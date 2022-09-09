/**
 *@NModuleScope Public
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 *@Author  Shubham Kaila
 */
/***********************************************************************
 * File:        SK_MHI_Update_Inventory_Detail.js
 * Date:        11/23/2021
 * Summary:
 * Author:      Shubham Kaila
 * Copyrights:  Shubham Kaila
 * Updates:     Change to recursively call itself to continue processing [Zach]
 ***********************************************************************/
define(['N/search', 'N/record', 'N/runtime', 'N/task', './lodash'],
  function (search, record, runtime, task) {
    var invoiceSearchObject = {};
    function execute(context) {
      try {
        var scriptObj = runtime.getCurrentScript();
        var poID = scriptObj.getParameter({ name: "custscript_po_id" });
        var cusRecID = scriptObj.getParameter({ name: "custscript_cus_rec_id" });
        log.debug('cusRecID   ' + cusRecID);

        var updatePO = updatePo(poID, cusRecID); log.debug('Purchase Order being updated: ', updatePO);
        log.debug('Remaining governance units: ' + scriptObj.getRemainingUsage());

      } catch (e) { log.debug("Error in Execute Function", e.toString() + " >>> END <<< "); }
    }

    function updatePo(poID, cusRecID) {
      try {
        var maxLines = 5;
        var cusRecObj = record.load({ type: 'customrecord_mhi_943_item_data', id: cusRecID, isDynamic: true });
        var currentLine = cusRecObj.getValue({ fieldId: 'custrecord_current_inventory_detail_line' });
        log.debug('Current Line: ', currentLine );
        const updatePoRec = record.load({ type: record.Type.PURCHASE_ORDER, id: poID, isDynamic: true });
        var updatePoLine = updatePoRec.getLineCount({ sublistId: 'item' }); log.debug('updatePoRec Lines', updatePoLine);
        var numLines = updatePoLine - currentLine;
        if (numLines > maxLines) numLines = maxLines;

        for (var i = currentLine; i < currentLine + numLines; i += 1) {
          log.debug('Current PO', { totalLinesOnPO: updatePoLine, idx: i, currentLine: currentLine, numLines: numLines  });//, updateIndexStart: poLines });

          updatePoRec.selectLine({ sublistId: 'item', line: i }); //log.debug('Current PO Line: ', lineId);
          var inventoryDetailRecord = updatePoRec.getCurrentSublistSubrecord({ sublistId: 'item', fieldId: 'inventorydetail' });
          var lotNum = updatePoRec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_po_case_serial' });
          var quantity = updatePoRec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity' });

          if (lotNum && quantity) {
            inventoryDetailRecord.selectNewLine({ sublistId: 'inventoryassignment' });
            inventoryDetailRecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: lotNum });
            inventoryDetailRecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantity', value: parseInt(quantity, 10) });
            inventoryDetailRecord.commitLine('inventoryassignment');
          }
          updatePoRec.commitLine('item');
          log.debug('Obj', {
            'CurrentRun': 'adding inventory details', 'Counter': i
          });
        }

        var updatePoRecId = updatePoRec.save({ enableSourcing: false, ignoreMandatoryFields: false }); log.debug('', 'Purchase Order >>>  ' + updatePoRecId + '  <<< Has been updated (run 2: inv details)!');
       
        const recursiveCall = updatePoLine - currentLine > maxLines;
        log.debug('RecursiveCall Variable: ', recursiveCall);
        if (!recursiveCall) cusRecObj.setValue({ fieldId: 'custrecord_mhi_943_cleared', value: true });

        cusRecObj.setValue({ fieldId: 'custrecord_current_inventory_detail_line', value: currentLine + numLines });

        var cusRecId = cusRecObj.save({ enableSourcing: false, ignoreMandatoryFields: false });

        log.debug('', '>>>> Custom Record has been processed! <<<<');

        if (recursiveCall) {
          log.debug('', 'Recursive Call to Update Inventory Details Initiated');
          var scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
          scriptTask.scriptId = 'customscript_sk_mhi_update_po_inventory_';  //'customscript_sk_mhi_update_po_lines_sch';
          scriptTask.deploymentId = 'customdeploy_sk_mhi_update_po_inventory_';  //'customdeploy_sk_mhi_update_po_lines_sch';
          scriptTask.params = { custscript_po_id: updatePoRecId, custscript_cus_rec_id: cusRecId };
          var scriptTaskId = scriptTask.submit();
        }

      } catch (e) { log.debug('', 'Error in updatePo: ' + e.toString()); }
    }

    //HELPER FUNCTIONS
    function getRemainingUsage() {
      var scriptObj = runtime.getCurrentScript();
      log.debug('Remaining governance units: ' + scriptObj.getRemainingUsage());
      return scriptObj.getRemainingUsage();
    }

    function searchAll(objSavedSearch) {
      var arrReturnSearchResults = [];
      var objResultset = objSavedSearch.run();
      var intSearchIndex = 0;
      var objResultSlice = null;
      var maxSearchReturn = 1000;

      var maxResults = 0;

      do {
        var start = intSearchIndex;
        var end = intSearchIndex + maxSearchReturn;
        if (maxResults && maxResults <= end) {
          end = maxResults;
        }
        objResultSlice = objResultset.getRange(start, end);

        if (!(objResultSlice)) {
          break;
        }

        arrReturnSearchResults = arrReturnSearchResults.concat(objResultSlice);
        intSearchIndex = intSearchIndex + objResultSlice.length;

        if (maxResults && maxResults == intSearchIndex) {
          break;
        }
      }
      while (objResultSlice.length >= maxSearchReturn);

      return arrReturnSearchResults;
    }
    function isEmpty(stValue) {
      if ((stValue == '') || (stValue == null) || (stValue == undefined)) {
        return true;
      } else {
        if (stValue instanceof String) {
          if ((stValue == '')) {
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
      execute: execute
    };
  });