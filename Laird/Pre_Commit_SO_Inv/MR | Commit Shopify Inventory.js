  /**
   *@NApiVersion 2.1
  *@NScriptType MapReduceScript
  *@Author   Zachary Oliver
  */
  /***********************************************************************
   * File:        MR | Commit Shopify Inventory
   * Date:        10/7/2022
   * Summary:
   * Author:       Zachary Oliver
   * Updates:     
   ***********************************************************************/
  define(
    ["N/record", "N/search", "N/runtime", "N/error"],
    (record, search, runtime, error) => {
      const getInputData = (context) => {
        try {
          var search = searchCreate();

          var count = search.runPaged().count;
          log.debug('Count of search results : ' + count);

          return search;
        } catch (e) {
          log.debug(
            "Error in getInputData Function",
            e.toString() + " >>> END <<< ",
          );
        }
      };

      const map = (context) => {
        const logOn = true;
        try {
          let result = context.value;
          if (logOn) log.debug('result : ', result);
  
          const id = JSON.parse(result).values.internalid.value;
          if (logOn) log.debug('id : ', id);

          addNumbers(id);

          if (logOn) log.debug('Post map save SO');
  
          return true;

        } catch (errorObj) {
          log.error({
            title: "Error in map ",
            details: errorObj.toString(),
          },);
          throw errorObj;
        }
      };

      const summarize = (summary) => {
        try {
          summary.output.iterator().each(function (key, value) {
            log.audit({
              title: " PO: " + key,
              details: value,
            },);
            const reduceValues = JSON.parse(value);
            log.debug("1st Object", reduceValues.values[0]);
            
            return true;
          },);

          log.audit({
            title: "END", details:
              "<---------------------------------END--------------------------------->",
          },);
        } catch (errorObj) {
          log.error({
            title: "(Summary) You were so close Error",
            details: errorObj.toString(),
          },);
          throw errorObj;
        }
      };

    function setItem(rec, idx) {
      var item = rec.getSublistValue({
          sublistId: 'item',
          fieldId: 'item',
          line: idx
      });
      log.debug('Current Item: ', item);
      
      var quantity = rec.getSublistValue({
        sublistId: 'item',
        fieldId: 'quantity',
        line: idx
      });
      log.debug('Current quantity: ', quantity);

      var results = searchItem(item);
      var count = results.runPaged().count;
      log.debug('Item results count: ', count);

      var range = results.run().getRange({
        start: 0,
        end: count
      });

      var lots = setLots(range, quantity);
      log.debug('lots : ', lots);

      if (lots === false) {
        log.debug('There were not enough inventory available in a correct bin etc. to fully allocate the order');
        return false;
      }

      for (var k=0; k < lots.length; k++){
        log.debug('lots[k] : ', lots[k]);

        var lotNum = parseInt(lots[k].invNumberId);
        var available = lots[k].quantity;

        rec.selectLine({ sublistId: 'item', line: idx });
        var invDetail = rec.getCurrentSublistSubrecord({ sublistId: 'item', fieldId: 'inventorydetail' });

        invDetail.selectNewLine({ sublistId: 'inventoryassignment' });

        invDetail.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber', value: lotNum });
        invDetail.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantity', value: available });
        invDetail.commitLine('inventoryassignment');
      }
      rec.commitLine('item');
      return true;
    }

    function setLots(arr, targetString) {
      var lotArr = [];
      var target = parseInt(targetString);

      for (let i=0; i<arr.length; i++){
        var id = arr[i].getValue({ name: 'internalid' });

        var results = searchInvBinNum(id);

        var inventoryBin = results.run().getRange({
          start: 0,
          end: 1
        });

        log.debug('inventoryBin : ', inventoryBin[0]);
        if (isEmpty(inventoryBin[0])) {
          log.audit('Inventory Bin search did not return a value');
          return false;
        }
        var invBinAvail = parseInt(inventoryBin[0].getValue({ name: 'quantityavailable' }));

        if (invBinAvail < target) {
          log.audit('Inventory Bin search showed less available than the needed for the item');
          return false;
        }
        
        var lot = { invNumberId: id };

        log.debug('lot : ', lot);
        log.debug('target: ', target);

        var locationAvail = arr[i].getValue({ name: 'quantityavailable' });
        locationAvail = parseInt(locationAvail);

        if (locationAvail >= target) {
          lot.quantity = target;
        } else {
          lot.quantity = locationAvail;
        }
        
        target -= locationAvail;

        lotArr.push(lot);
        if (target <= 0) return lotArr;
      }

      return false; //there was not enough available lot numbered quantity
    }

    function addNumbers(id) {
      var rec = record.load({
        type: "salesorder",
        id: id,
        isDynamic: true
      });

      var lines = rec.getLineCount({
        sublistId: 'item'
      });

      log.debug('Line Items: ', lines);

      for (var i=0; i<lines; i++){
        var isNumbered = rec.getSublistValue({
          sublistId: 'item',
          fieldId: 'isnumbered',
          line: i
        });
        log.debug('Item is Numbered: ', isNumbered);

        if (isNumbered === "T") {
          var result = setItem(rec, i);
          if (result === false) return;
        }
      }

      rec.setValue({
        fieldId: 'custbody_vel_picky_shopify_inv_alloc',
        value: true
      })

      rec.save({ enableSourcing: false, ignoreMandatoryFields: false });
      log.debug('Record saved');
    }

    function searchInvBinNum(invId) {
      return search.create({
        type: "inventorynumberbin",
        filters: [
            ["binnumber","anyof","4641"], 
            "AND", 
            ["inventorynumber.internalid","anyof", invId]
        ],
        columns: [
          search.createColumn({
            name: "binnumber",
            sort: search.Sort.ASC,
            label: "Bin Number"
          }),
          search.createColumn({name: "inventorynumber", label: "Inventory Number"}),
          search.createColumn({name: "quantityavailable", label: "Available"})
        ]
      });
    }

    function searchItem(item) {
      return search.create({
        type: "inventorynumber",
        filters:
        [
          ["item","anyof",item], 
          "AND", 
          ["quantityavailable","greaterthan","0"],
          "AND", 
          ["expirationdate","after","today"],
          "AND", 
          ["location","anyof","31"]
        ],
        columns:
        [
          search.createColumn({name: "internalid", label: "Internal ID"}),
          search.createColumn({name: "inventorynumber", label: "Number"}),
          search.createColumn({name: "item", label: "Item"}),
          search.createColumn({
            name: "expirationdate",
            sort: search.Sort.ASC,
            label: "Expiration Date"
          }),
          search.createColumn({name: "location", label: "Location"}),
          search.createColumn({name: "quantityonhand", label: "On Hand"}),
          search.createColumn({name: "quantityavailable", label: "Available"}),
          search.createColumn({name: "quantityonorder", label: "On Order"})
        ]
      });
    }

      function searchCreate() {
        return search.create({
          type: "salesorder",
          filters:
          [
            ["type","anyof","SalesOrd"], 
            "AND", 
            ["mainline","is","T"], 
            "AND", 
            ["custbody_celigo_shopify_store","anyof","101","201"], 
            "AND", 
            ["custbody_vel_picky_shopify_inv_alloc","is","F"],
            "AND",
            ["datecreated","onorafter","10/10/2022 12:00 am"],
            "AND", 
            ["internalidnumber","greaterthan","36219088"]
          ],
          columns:
          [
            search.createColumn({name: "internalid", label: "Internal ID"}),
            search.createColumn({name: "tranid", label: "Document Number"})
          ]
        });
      }

      function dateFormat(string) {
        var date = new Date(string);

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        if (month.toString().length === 1) month = '0' + month.toString();
        if (day.toString().length === 1) day = '0' + day.toString();

        return month + "/" + day + "/" + year;
      }

      function isEmpty(stValue) {
        if ((stValue == "") || (stValue == null) || (stValue == undefined)) {
          return true;
        } else {
          if (stValue instanceof String) {
            if (stValue == "") {
              return true;
            }
          } else if (stValue instanceof Array) {
            if (stValue.length == 0) {
              return true;
            }
          }
          return false;
        }
      }

      return {
        getInputData,
        map,
        summarize,
      };
    },
);