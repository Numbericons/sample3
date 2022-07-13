/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 *@Author 
 */
/***********************************************************************
 * File:        SK_ZO_MHI_Update_Inventory_Detail_V2.js
 * Date:        3/4/2021
 * Summary:
 * Author:      Zachary Oliver
 * Updates:     Clean up code
 ***********************************************************************/
define(['N/record', 'N/search', 'N/runtime', 'N/error', 'N/task', 'N/file', './MHI_lib_task', './lodash'], (record, search, runtime, error, task, file, mhiLibTask) => {
  const getInputData = (context) => {
    try {
      var scriptObj = runtime.getCurrentScript();
      const poId = scriptObj.getParameter({ name: 'custscript_mr_po_ids' });
      var bodyObj = {};
      bodyObj.properties = [];
      bodyObj.properties.push({ poId: poId });
      return { reduceValues: bodyObj };

    } catch (e) { log.debug("Error in getInputData Function", e.toString() + " >>> END <<< "); }
  };
  const map = (map) => { };


  const reduce = (context) => {
    const obj = JSON.parse(context.values);
    log.debug('Purchase Order ID: ', obj.properties[0].poId);
    const poObj = getPoLines(obj.properties[0].poId);
    context.write({
      key: obj.properties[0].poId,
      value: poObj
    });
    return true;
  };

  const summarize = (summary) => {
    try {
      summary.output.iterator().each(function (key, value) {
        log.audit({
          title: ' PO: ' + key,
          details: value
        });
        const reduceValues = JSON.parse(value);
        log.debug('1st Object', reduceValues.values[0]);
        const finished = updateInventoryDetails(reduceValues.values[0].poParentId, reduceValues);

        if (finished) updatePo(reduceValues.values[0].poParentId);
        return true;
      });

      log.audit({ title: 'Reduce Time Total (seconds)', details: summary.reduceSummary.seconds });
      log.audit({ title: 'Max Concurrency Utilized ', details: summary.reduceSummary.concurrency });
      log.audit({ title: 'END', details: '<---------------------------------END--------------------------------->' });
    } catch (errorObj) {
      log.error({ title: '(Summary) You were so close Error', details: errorObj.toString() });
      throw errorObj;
    }
  };

  ////////////// Helper Functions ///////////////////

  const updatePo = (poId) => {
    try {
      const rec = record.load({ type: record.Type.PURCHASE_ORDER, id: poId, isDynamic: true });
      rec.setValue({ fieldId: 'custbody_mhi_sk_inv_cleared', value: true });
      rec.setValue({ fieldId: 'custbody_mhi_sk_update_inventory_num', value: true });
      var updatePoRecId = rec.save({ enableSourcing: false, ignoreMandatoryFields: false });
      log.debug('', 'Purchase Order >>>  ' + updatePoRecId + '  <<< Has been cleared!');
    } catch (e) { log.debug('', 'Error in updatePo: ' + e.toString()); }
  }

  const updateInventoryDetails = (id, reduceValues) => {
    var maxLines = 1500;
    const itemsObj = getTotalItems(id);
    log.debug('items: ', itemsObj);

    if (_.isEmpty(id)) { return; }
    const updatePoRec = record.load({ type: record.Type.PURCHASE_ORDER, id: id, isDynamic: true });
    var currentLine = updatePoRec.getValue({ fieldId: 'custbody_current_inventory_detail_line' });
    log.debug('Current Line: ', currentLine);

    var numLines = reduceValues.values.length - currentLine;
    if (numLines > maxLines) numLines = maxLines;

    for (let i = currentLine; i < currentLine + numLines; i++) {
      let lineNumber = updatePoRec.findSublistLineWithValue({ sublistId: 'item', fieldId: 'item', value: _.parseInt(itemsObj[reduceValues.values[i].itemNumber]) });

      updatePoRec.selectLine({ sublistId: 'item', line: lineNumber });
      var inventoryDetailRecord = updatePoRec.getCurrentSublistSubrecord({ sublistId: 'item', fieldId: 'inventorydetail' });

      log.debug('About to add inventory detail', i + ' - serial: ' + reduceValues.values[i].serialNumber + ' - quantity: ' + reduceValues.values[i].quantityShipped);

      if (reduceValues.values[i].serialNumber && reduceValues.values[i].quantityShipped) {
        inventoryDetailRecord.selectNewLine({ sublistId: 'inventoryassignment' });
        inventoryDetailRecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'receiptinventorynumber', value: reduceValues.values[i].serialNumber });
        inventoryDetailRecord.setCurrentSublistValue({ sublistId: 'inventoryassignment', fieldId: 'quantity', value: _.parseInt(reduceValues.values[i].quantityShipped, 10) });
        inventoryDetailRecord.commitLine('inventoryassignment');
        updatePoRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_mhi_sk_inv_detail_added', value: true });
      }
      updatePoRec.commitLine('item');

      log.debug('adding inventory detail', i + ' - ' + reduceValues.values[i].serialNumber);
    }

    updatePoRec.setValue({ fieldId: 'custbody_current_inventory_detail_line', value: currentLine + numLines });
    var updatePoRecId = updatePoRec.save({ enableSourcing: false, ignoreMandatoryFields: false });
    log.debug('', 'Purchase Order >>>  ' + updatePoRecId + '  <<< Has been updated (run 2: Inventory Details Added)!');

    const recursiveCall = reduceValues.values.length - currentLine > maxLines;
    log.debug('RecursiveCall Variable: ', recursiveCall);

    if (recursiveCall) {
      recursiveDeploy('customscript_sk_zo_mhi_update_inventory2', updatePoRecId);
      return true;
    } else {
      deployScript('customscript_sk_mhi_update_po_inventory_', updatePoRecId, !recursiveCall) //if not recursive, trigger other (scheduled) script type
    }
  }

  const recursiveDeploy = (scriptId, recId) => {
    const params = {};
    params.custscript_mr_po_ids = recId;
    var deploymentId = runtime.getCurrentScript().deploymentId;

    mhiLibTask.createMRTaskAndSubmit(scriptId, deploymentId, params);
  }

  const submitTask = (scriptId, params, scheduled) => {
    if (scheduled) {
      return mhiLibTask.createSchedTaskAndSubmit(scriptId, null, params);
    } else {
      return mhiLibTask.createMRTaskAndSubmit(scriptId, null, params);
    }
  }

  const deployScript = (scriptId, recId, scheduled) => {
    const params = {};
    params.custscript_po_id = recId;

    var stScriptTaskId = submitTask(scriptId, params, scheduled);
    
    // if no available deployment, create deployment record and submit
    if (stScriptTaskId == 'NO_DEPLOYMENTS_AVAILABLE') {
      
      // create deployment record by copying default deployment
      const stDeploymentSID = mhiLibTask.copyDeploymentRecord(scriptId);
      
      // trigger script using new deployment
      submitTask(scriptId, params, scheduled);
    }
  }
  
  const updateInventoryNumbers = (poId, reducedValues) => {
    try {
      const obj = getPoInventoryDetailId(poId); log.debug('Inventory Detail OBJ: ', obj);
      const invDetailIdObj = obj.invDetailIdObj;
      const inventoryNumberId = obj.inventoryNumberId;
      const bodyObj = {};
      bodyObj.properties = [];

      for (let j = 0; j < reducedValues.values.length; j++) {
        bodyObj.properties.push({
          internalId: inventoryNumberId[reducedValues.values[j].serialNumber]
          , caseSerialNumber: reducedValues.values[j].caseSerialNumber
          , supplierBatch: reducedValues.values[j].supplierBatch
          , netWeight: reducedValues.values[j].netWeight
          , palletWeight: reducedValues.values[j].palletWeight
          , casesInPallet: reducedValues.values[j].casesInPallet
          , batchDate: reducedValues.values[j].batchDate
          , expiryDate: reducedValues.values[j].expiryDate
          , productionDate: reducedValues.values[j].productionDate
          , bestBeforeDate: reducedValues.values[j].bestBeforeDate
          , palletId: reducedValues.values[j].palletId
        });
      }

      const jsonString = JSON.stringify(bodyObj);
      log.debug('jsonObj', jsonString);

    } catch (e) { log.debug('', 'Error in updateInventoryNumbers: ' + e.toString()); }
  }

  const updateCustomRecordEntries = (poId, customRecordId) => {
    try {
      var rec = record.load({ type: 'customrecord_mhi_943_item_data_lines', id: customRecordId, isDynamic: true });
      rec.setValue({ fieldId: 'custrecord_mhi_943_line_cleared', value: true })
      var recordId = rec.save({ enableSourcing: true, ignoreMandatoryFields: true });
    } catch (e) { log.debug('', 'Error in updateCustomRecordEntries: ' + e.toString()); }
  }

  const inventoryNumberLookup = (inventoryDetailId) => {
    try {
      var idLookup = search.lookupFields({
        type: 'inventorydetail',
        id: inventoryDetailId,
        columns: ['internalid.inventoryNumber']
      });
      var inventoryNumberId = idLookup['internalid.inventoryNumber'];
      return inventoryNumberId;
    } catch (e) { log.debug('', 'Error in inventoryNumberLookup: ' + e.toString()); }
  }
  const getInvCusRecCount = (poId) => {
    try {
      var purchaseorderSearchObj = search.create({
        type: "purchaseorder",
        filters: [["internalid", "anyof", poId], "AND", ["mainline", "is", "F"], "AND", ["type", "anyof", "PurchOrd"], "AND", ["custrecord_mhi_sk_po_parent.custrecord_mhi_943_line_cleared", "is", "F"]],
        columns: [search.createColumn({ name: "internalid", join: "CUSTRECORD_MHI_SK_PO_PARENT", summary: "COUNT" }), search.createColumn({ name: "internalid", summary: "GROUP" })]
      });

      const results = searchAll(purchaseorderSearchObj);
      if (!isEmpty(results)) {
        var totalCount = results[0].getValue({ name: "internalid", join: "CUSTRECORD_MHI_SK_PO_PARENT", summary: "COUNT" });
      } else { totalCount = 0 }
      // log.debug('totalCount',totalCount);
      return totalCount;
    } catch (e) { log.debug('', 'Error in getPoId: ' + e.toString()); }
  }
  const getPoInventoryDetailId = (poId) => {
    try {
      const purchaseorderSearchObj = search.create({
        type: "purchaseorder",
        filters: [["mainline", "is", "F"], "AND", ["type", "anyof", "PurchOrd"], "AND", ["internalid", "anyof", poId]],
        columns: [search.createColumn({ name: "inventorynumber", join: "inventoryDetail" }), search.createColumn({ name: "internalid", join: "inventoryDetail" })]
      });

      const invDetailIdObj = {};
      const inventoryNumberId = {};
      const results = searchAll(purchaseorderSearchObj); log.debug('Total Inventory Detail Lines: ', results.length);
      if (!isEmpty(results)) {
        for (var i = 0; i < results.length; i++) {
          let serialNumId = results[i].getValue({ name: "inventorynumber", join: "inventoryDetail" });
          let serialNum = results[i].getText({ name: "inventorynumber", join: "inventoryDetail" });
          let invDetailId = results[i].getValue({ name: "internalid", join: "inventoryDetail" });
          invDetailIdObj[serialNum] = invDetailId;
          inventoryNumberId[serialNum] = serialNumId;
        }
      }
      return { invDetailIdObj: invDetailIdObj, inventoryNumberId: inventoryNumberId };
    } catch (e) { log.debug('', 'Error in getPoInventoryDetailId: ' + e.toString()); }
  }
  const getPoInventoryNumberId = (poId) => {
    try {
      const inventorydetailSearchObj = search.create({
        type: "inventorydetail",
        filters: [["inventorynumber.custitemnumber_edi_case_serial_or_lot", "isempty", ""]],
        columns: [search.createColumn({ name: "internalid", label: "Internal ID" }), search.createColumn({ name: "internalid", join: "inventoryNumber", })]
      });
      const invDetailObj = {};
      invDetailObj.values = [];
      const results = searchAll(inventorydetailSearchObj); log.debug('Total Inventory Number Lines: ', results.length);
      if (!isEmpty(results)) {
        for (var i = 0; i < results.length; i++) {
          invDetailObj.values.push({
            serialNum: results[i].getValue({ name: "custcol_po_case_serial" })
            , invDetailId: results[i].getValue({ name: "internalid", join: "inventoryDetail" })
          });
        }
        log.debug('Lines returned: ', invDetailObj.values.length);
      } else { log.debug('END!!!'); }
      return invDetailObj;
    } catch (e) { log.debug('', 'Error in getPoId: ' + e.toString()); }
  }
  const getPoLines = (poId) => {
    try {
      var purchaseorderSearchObj = search.create({
        type: "purchaseorder",
        filters: [["type", "anyof", "PurchOrd"], "AND", ["mainline", "is", "T"], "AND", ["internalid", "anyof", poId]],
        columns: [
          search.createColumn({ name: "internalid" }),
          search.createColumn({ name: "custrecord_mhi_943_batch_date", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_best_before_date", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_case_serialnum", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_expiry_date", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_item_number", join: "CUSTRECORD_MHI_SK_PO_PARENT", sort: search.Sort.ASC }),
          search.createColumn({ name: "custrecord_mhi_943_lotnum", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_net_weight", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_sk_po_parent", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_pallet_id", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_production_date", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_qty_shipped", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_serialnum", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_supplier_batch", join: "CUSTRECORD_MHI_SK_PO_PARENT", }),
          search.createColumn({ name: "custrecord_mhi_943_casesinpallet", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_invnumber", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "internalid", join: "CUSTRECORD_MHI_SK_PO_PARENT" }),
          search.createColumn({ name: "custrecord_mhi_943_palletweight", join: "CUSTRECORD_MHI_SK_PO_PARENT" })
        ]
      });

      var linesObj = {};
      linesObj.values = [];
      var results = searchAll(purchaseorderSearchObj);
      if (!isEmpty(results)) {
        for (var i = 0; i < results.length; i++) {
          linesObj.values.push({
            poParentId: results[i].getValue({ name: 'custrecord_mhi_sk_po_parent', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , batchDate: results[i].getValue({ name: 'custrecord_mhi_943_batch_date', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , bestBeforeDate: results[i].getValue({ name: 'custrecord_mhi_943_best_before_date', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , caseSerialNumber: results[i].getValue({ name: 'custrecord_mhi_943_case_serialnum', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , expiryDate: results[i].getValue({ name: 'custrecord_mhi_943_expiry_date', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , itemNumber: results[i].getValue({ name: 'custrecord_mhi_943_item_number', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , lotNumber: results[i].getValue({ name: 'custrecord_mhi_943_lotnum', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , netWeight: results[i].getValue({ name: 'custrecord_mhi_943_net_weight', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , palletId: results[i].getValue({ name: 'custrecord_mhi_943_pallet_id', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , productionDate: results[i].getValue({ name: 'custrecord_mhi_943_production_date', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , quantityShipped: results[i].getValue({ name: 'custrecord_mhi_943_qty_shipped', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , serialNumber: results[i].getValue({ name: 'custrecord_mhi_943_serialnum', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , supplierBatch: results[i].getValue({ name: 'custrecord_mhi_943_supplier_batch', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , casesInPallet: results[i].getValue({ name: 'custrecord_mhi_943_casesinpallet', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , invNumber: results[i].getValue({ name: 'custrecord_mhi_943_invnumber', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , palletWeight: results[i].getValue({ name: 'custrecord_mhi_943_palletweight', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
            , customRecordId: results[i].getValue({ name: 'internalid', join: "CUSTRECORD_MHI_SK_PO_PARENT" })
          });
        }
        log.debug('Lines returned: ', linesObj.values.length);
      }//else { log.debug('END!!!'); }
      return linesObj;
    } catch (e) { log.debug('', 'Error in getPoLines: ' + e.toString()); }
  }
  const getTotalItems = (id) => {
    try {
      var purchaseorderSearchObj = search.create({
        type: "purchaseorder",
        filters: [["type", "anyof", "PurchOrd"], "AND", ["mainline", "is", "T"], "AND", ["internalid", "anyof", id]],
        columns:
          [search.createColumn({ name: "internalid", summary: "COUNT" }), search.createColumn({ name: "custrecord_mhi_943_item_number", join: "CUSTRECORD_MHI_SK_PO_PARENT", summary: "GROUP" })]
      });
      const itemsObj = {};
      var results = searchAll(purchaseorderSearchObj);
      if (!isEmpty(results)) {
        for (var i = 0; i < results.length; i++) {
          let itemId = results[i].getValue({ name: "custrecord_mhi_943_item_number", join: "CUSTRECORD_MHI_SK_PO_PARENT", summary: "GROUP", sort: search.Sort.ASC });
          itemsObj[itemId] = itemId;
        }
      }
      return itemsObj;
    } catch (e) { log.debug('', 'Error in getTotalItems: ' + e.toString()); }
  }
  function handleErrorIfAny(summary) {
    var inputSummary = summary.inputSummary;
    var mapSummary = summary.mapSummary;
    var reduceSummary = summary.reduceSummary;
    if (inputSummary.error) {
      var e = error.create({
        name: 'INPUT_STAGE_FAILED',
        message: inputSummary.error
      });
      log.error('Stage: getInputData failed', e);
    }
    handleErrorInStage('map', mapSummary);
    handleErrorInStage('reduce', reduceSummary);
  }

  function handleErrorInStage(stage, summary) {
    var errorMsg = [];
    summary.errors.iterator().each(function (key, value) {
      var msg = 'Failed ID: ' + key + '. Error was: ' + JSON.parse(value).message + '\n';
      errorMsg.push(msg);
      return true;
    });
    if (errorMsg.length > 0) {
      var e = error.create({
        name: 'FAILURE',
        message: JSON.stringify(errorMsg)
      });
      log.error('Stage: ' + stage + ' failed', e);
    }
  }
  function getUsageInfo() {
    var script = runtime.getCurrentScript();
    log.debug({
      "title": "Governance Monitoring",
      "details": "Remaining Usage = " + script.getRemainingUsage()
    });
  }
  const executeSCH = (poId) => {
    try {
      var scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
      scriptTask.scriptId = 'customscript_sk_mhi_update_po_lines';  //'customscript_sk_mhi_update_po_lines_sch';
      scriptTask.deploymentId = 'customdeploy_sk_mhi_update_po_lines';  //'customdeploy_sk_mhi_update_po_lines_sch';
      scriptTask.params = { custscript_mr_inv_num_po_id: poId, custscript_mr_inv_num_file_id: fileId };
      var scriptTaskId = scriptTask.submit();
    } catch (e) { log.debug("Error in Executing the Map Reduce Script", e.toString() + " >>> END <<< "); }
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
  const getAllSearchResults = (searchResult) => {
    let arrResults = [];
    let resultSet = [];
    const MAX_SEARCH_SIZE = 20;
    let count = 0;

    do {
      resultSet = searchResult.getRange({
        start: count,
        end: count + MAX_SEARCH_SIZE
      });
      arrResults = arrResults.concat(resultSet);
      count += MAX_SEARCH_SIZE;
    } while (resultSet.length > 0);

    return arrResults;
  };

  const concatString = (arrString, obj, delimiter) => {
    let string = '';
    for (let i = 0; i < arrString.length; i += 1) {
      string += obj[arrString[i]] + delimiter;
    }

    return string.substr(-1) === delimiter ? string.slice(0, -1) : string;
  };

  const groupByMultKeys = (array, f) => array.reduce((acc, obj) => {
    const key = concatString(f, obj, '.');

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(obj);
    return acc;
  }, {});

  return {
    getInputData,
    reduce,
    summarize
  };
});