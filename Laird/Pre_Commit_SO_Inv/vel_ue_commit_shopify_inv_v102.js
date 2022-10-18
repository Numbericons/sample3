define(["N/record", "N/task", "N/search"],
  function (record, task, search) {
    /**
    *@NApiVersion 2.1
    *@NScriptType UserEventScript
    */

    function afterSubmit(context) {
      if (context.type == context.UserEventType.CREATE) {
        var newRec = context.newRecord;
        
        var id = newRec.getValue({
          fieldId: 'id'
        });
        log.debug('newRec id : ', id);
  
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
      if (lots === false) return;

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
    }

    function setLots(arr, targetString) {
      var lotArr = [];
      var target = parseInt(targetString);

      for (let i=0; i<arr.length; i++){
        var id = arr[i].getValue({ name: 'internalid' });
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
          setItem(rec, i);
        }
      }

      rec.save({ enableSourcing: false, ignoreMandatoryFields: false });
      log.debug('Record saved');
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