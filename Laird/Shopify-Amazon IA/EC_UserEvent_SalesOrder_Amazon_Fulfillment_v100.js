/*
* Company          Explore Consulting
* Copyright        2018 Explore Consulting, LLC
* Spec             https://docs.google.com/document/d/13YIZ8jnRihZQ3AtnMvZ78yGpLwspz3XkXdKXGZ1-Nsc/edit
*/
var EC_SO_AMZ_FUL;
(function (EC_SO_AMZ_FUL) {
  function onAfterSubmit(type) {
    try {
      if (type == "delete") {
        return;
      }
      // load the current sales order record
      var salesOrderRecord = nsdal.loadObject(
        nlapiGetRecordType(),
        nlapiGetRecordId(),
        ["tranid", "custbody_lsf_amazon_channel", "status", "trandate"],
      ).withSublist("item", ["item", "quantitybackordered"]);
      log.debug("salesOrderRecord", salesOrderRecord);
      // look through all of the lines on the sales order to determine if any of the items are back ordered. we do not
      // want to fulfill a sales order that has any back ordered items. We only do full fulfillment's. no partials.
      var backOrderedItemExists = _.find(
        salesOrderRecord.item,
        function (item) {
          return _.toNumber(item.quantitybackordered || 0) > 0;
        },
      );
      log.debug("backOrderedItemExists", "value=" + backOrderedItemExists);
      if (backOrderedItemExists) log.error('salesOrderRecord', salesOrderRecord);
      
      // only fulfill the sales order if these criteria work out
      if (
        salesOrderRecord.status == "Pending Fulfillment" &&
        !backOrderedItemExists &&
        salesOrderRecord.custbody_lsf_amazon_channel == "2"
      ) {
        fulfillSalesOrder(salesOrderRecord);
      }
    } catch (e) {
      log.error(
        "unexpected error- EC_SO_AMZ_FUL.onAfterSubmit",
        EC.getExceptionDetail(e),
      );
    }
  }
  EC_SO_AMZ_FUL.onAfterSubmit = onAfterSubmit;
  /**
     * main function that does all of the heavy lifting and creates the fulfillment record
     * @param salesOrderRecord
     */
  function fulfillSalesOrder(salesOrderRecord) {
    // create an item fulfillment record from the sales order record
    var itemFulfillmentRecord = nsdal.fromRecord(
      nlapiTransformRecord(
        "salesorder",
        salesOrderRecord.getId(),
        "itemfulfillment",
        { recordmode: "dynamic" },
      ),
      ["createdfrom", "shipstatus", "trandate"],
    );
    itemFulfillmentRecord.withSublist(
      "item",
      ["item", "quantity", "itemreceive", "inventorydetailreq", "itemtype"],
    );
    log.debug("itemFulfillmentRecord", itemFulfillmentRecord);
    // update header field values
    itemFulfillmentRecord.trandate = salesOrderRecord.trandate;
    itemFulfillmentRecord.shipstatus = "C"; // C == Shipped
    // load the existing search that conveniently has all of the items and inventory available for the amazon lots
    var lotNumberResults = lazy.loadSearch(
      "",
      "customsearch_ec_lot_no_avail_amz",
    ).nsSearchResult2obj().sortBy("expirationdate").toArray();
    // log.debug('lotNumberResults', lotNumberResults);
    // iterate through each line on the fulfilment record and fulfill all of the lines
    _.forEach(
      itemFulfillmentRecord.item,
      function (lineItem, index) {
        log.debug("processing line", lineItem);
        // if the line does not require inventory detail then all we do is receive the line nothing more. otherwise if it
        // does require it we do all of the fun inventory detail scripting bits
        //Item ID clause added by Geoff Petkus June 2, 2020. Item 2524 is a non-inventory item that is appearing
        //in fulfillment objects with inventorydetailreq=T which seems to be a bug. So adding the OR clause.
        //Clause to skip Kit type lines added by Geoff Petkus Feb 29, 2021. Kit lines in IF records
        //will by definition come with sub-lines that are used for the actual fulfillment. By skipping the kit line,
        //the sublines will get processed according to the existing routines.
        if (
          lineItem.inventorydetailreq == "F" ||
          lineItem.item == "2524" ||
          lineItem.item == "2475" ||
          lineItem.itemtype == "Kit"
        ) {
          // first select the line so any data we get/set applies to our current line
          itemFulfillmentRecord.selectLineItem("item", index + 1);
          itemFulfillmentRecord.setCurrentLineItemValue(
            "item",
            "itemreceive",
            "T",
          );
        } else {
          // get all of the lot numbers that we need to distribute for this line item. Since the quantity could actually
          // be split in theory, we need to be able to handle that distribution of quantity against multiple lots
          var lotNumbers = getLotNumbers(lotNumberResults, lineItem);
          // first select the line so any data we get/set applies to our current line
          itemFulfillmentRecord.selectLineItem("item", index + 1);
          itemFulfillmentRecord.setCurrentLineItemValue(
            "item",
            "itemreceive",
            "T",
          );
          // create a new subrecord for the inventory line
          var subRecord_1 = itemFulfillmentRecord.createCurrentLineItemSubrecord(
            "item",
            "inventorydetail",
          );
          // because we may be splitting the quantity for this line across multiple lots we have to handle this as a
          // possibility that this gets split up.
          _.forEach(
            lotNumbers,
            function (lotNumber, iaIndex) {
              // for the first line we need to select it, then from there select new lines... NetSuite at its finest
              if (iaIndex === 0) {
                subRecord_1.selectLineItem("inventoryassignment", "1");
              } else {
                subRecord_1.selectNewLineItem("inventoryassignment");
              }
              subRecord_1.setCurrentLineItemValue(
                "inventoryassignment",
                "issueinventorynumber",
                lotNumber.id,
              );
              subRecord_1.setCurrentLineItemValue(
                "inventoryassignment",
                "quantity",
                lotNumber.quantity,
              );
              subRecord_1.commitLineItem("inventoryassignment");
              //log.debug('Inside the InventoryAssignmentList creation', 'params: lotNumber.id='+lotNumber.id+' lotNumber.quantity='+lotNumber.quantity);
            },
          );
          subRecord_1.commit();
          itemFulfillmentRecord.commitLineItem("item");
        }
      },
    );
    // save our new item fulfillment record
    var itemFulfillmentId = itemFulfillmentRecord.save();
    log.debug("itemFulfillmentId", itemFulfillmentId);
  }
  /**
     * This function is a fancy function handled to get all of the lot numbers associated to this particular line item
     * being processed. Because a single line item may have a larger quantity than a single lot may have available the
     * exception to distribute quantity over multiple lots is needed. This function handles that distribution of a line
     * item quantity across multiple lots. It returns an array of lot ID and the expected quantity to assign.
     * @param lotNumberResults
     * @param lineItem
     * @returns []
     */
  function getLotNumbers(lotNumberResults, lineItem) {
    var lotNumbers = [];
    // find the corresponding match for the lot number search result
    var lotNumberMatches = _.filter(
      lotNumberResults,
      function (lotNumberResult) {
        return lotNumberResult.item == lineItem.item;
      },
    );
    log.debug("Item to search", "lineItem.item=" + lineItem.item);
    log.debug("matching lot numbers", lotNumberMatches);
    var remainderQuantity = lineItem.quantity;
    _.forEach(
      lotNumberMatches,
      function (lotNumberMatch) {
        var lotNumber = { id: "", quantity: "" };
        // default this to the remainder quantity. it will be updated below if the lot doesn't have enough to dish out
        lotNumber.quantity = remainderQuantity;
        lotNumber.id = lotNumberMatch.id;
        // calculate the remaining quantity. This determines whether we use the the remaining quantity available in this
        // lot or if we need to distribute amongst multiple lots for the quantity
        remainderQuantity =
          Math.max(
            0,
            _.toNumber(remainderQuantity) - _.toNumber(
              lotNumberMatch.quantityavailable,
            ),
          );
        log.debug("remainderQuantity", remainderQuantity);
        // if there is remainder quantity do not use the item total quantity for this lot since this lot doesn't actually
        // have that many to distribute! Only use what is still available in the lot.
        if (_.toNumber(remainderQuantity) > 0) {
          lotNumber.quantity = lotNumberMatch.quantityavailable;
        }
        // push our lot number to this lot collection
        log.debug("lotNumber", lotNumber);
        lotNumbers.push(lotNumber);
        // if we have no more quantity to distribute then stop this loop.
        if (_.toNumber(remainderQuantity) == 0) {
          return false;
        }
      },
    );
    log.debug("lotNumbers", lotNumbers);
    return lotNumbers;
  }
})(EC_SO_AMZ_FUL || (EC_SO_AMZ_FUL = {}));
