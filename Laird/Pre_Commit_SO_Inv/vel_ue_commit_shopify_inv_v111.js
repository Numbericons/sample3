define(["N/record", "N/task", "N/search"],
  function (record, task, search) {
    /**
    *@NApiVersion 2.1
    *@NScriptType UserEventScript
    *Author: Zachary Oliver
    *Version: v111
    */

    function afterSubmit(context) {
      if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
        var newRec = context.newRecord;
        
        var id = newRec.getValue({
          fieldId: 'id'
        });
        log.debug('newRec id : ', id);

        var storeId = newRec.getValue({
          fieldId: 'custbody_celigo_shopify_store_id'
        });

        const pickyStoreId = "16315219";
        const pickyB2BStoreId = "31056904";

        if (storeId !== pickyStoreId && storeId !== pickyB2BStoreId) {
          log.debug('Store ID not Picky or Picky B2B!');
          return; //allocation/commitment of inventory for sales orders is only done for Picky & Picky B2B
        }
  
        addNumbers(newRec, id);
      }
    }

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

    function addNumbers(newRec, id) {
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

    return {
      afterSubmit: afterSubmit
    };
  }
);