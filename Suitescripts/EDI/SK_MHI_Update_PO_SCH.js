/***********************************************************************
 * File:        SK_MHI_Update_PO_SCH.js
 * Date:        10/22/2021
 * Summary:     Processes MHI 943 Line Item Data and Updates PO
 * Author:      Shubham Kaila
 ***********************************************************************/

function execute(type){
    try{
        var companyInfo = nlapiLoadConfiguration('companypreferences');
        nlapiLogExecution('DEBUG','companyInfo',' '+companyInfo.getFieldValue('custscript_mhi_943_id') );
        var rId = companyInfo.getFieldValue('custscript_mhi_943_id');
        var result = getChildRecords(rId);

    }catch (e) {
        nlapiLogExecution('DEBUG','Error',' '+ e.toString());
    }
}

function getChildRecords(rId){
    try{
        rec = nlapiLoadRecord('customrecord_mhi_943_item_data', parseInt(rId));
        var poId = rec.getFieldValue('externalid');
        var po_Id = getPoId(poId);  //nlapiLogExecution('DEBUG','POID '+ obj);
        updatePo(po_Id,rec);
    }catch (e) {nlapiLogExecution('DEBUG', 'Error in function getChildRecords',e.toString());}
}

function updatePo(rId,rec){
    try{
        var poRec = nlapiLoadRecord('purchaseorder',rId);
        var lineCount = poRec.getLineItemCount('item');
        var count = rec.getLineItemCount('recmachcustrecord_mhi_943_item_data_parent');
        // var nIndex = parseInt(lineCount) + 1;
        var location = poRec.getLineItemValue('item','location',1);

        for(var i=1; i<count; i++){
            nlapiSelectNewLineItem('item');
            nlapiSetCurrentLineItemValue('item,','item',1831);
            // nlapiSetCurrentLineItemValue('item', 'item', rec.getLineItemValue('recmachcustrecord_mhi_943_item_data_parent','custrecord_mhi_943_item_number',i), true, true);
            nlapiSetCurrentLineItemValue('item', 'quantity', rec.getLineItemValue('recmachcustrecord_mhi_943_item_data_parent','custrecord_mhi_943_qty_shipped',i));
            nlapiSetCurrentLineItemValue('item', 'rate', 0);
            nlapiSetCurrentLineItemValue('item', 'amount', 0);
            nlapiSetCurrentLineItemValue('item', 'custcol_po_batch', rec.getLineItemValue('recmachcustrecord_mhi_943_item_data_parent','custrecord_mhi_943_batch_date',i));
            nlapiSetCurrentLineItemValue('item', 'custcol_po_case_serial', rec.getLineItemValue('recmachcustrecord_mhi_943_item_data_parent','custrecord_mhi_943_case_serialnum',i));
            nlapiSetCurrentLineItemValue('item', 'custcol_po_case_weight', rec.getLineItemValue('recmachcustrecord_mhi_943_item_data_parent','custrecord_mhi_943_net_weight',i));
            nlapiSetCurrentLineItemValue('item', 'custcol_po_cases_in_pallet', rec.getLineItemValue('recmachcustrecord_mhi_943_item_data_parent','custrecord_mhi_943_casesinpallet',i));
            nlapiSetCurrentLineItemValue('item', 'custcol_po_pallet_weight', rec.getLineItemValue('recmachcustrecord_mhi_943_item_data_parent','custrecord_mhi_943_palletweight',i));
            nlapiSetCurrentLineItemValue('item', 'location', location);
            nlapiCommitLineItem('item');
            getRemainingUsage();
        }
        var recordId = nlapiSubmitRecord(poRec,true);
        rec.setFieldValue('custrecord_mhi_943_cleared', 'T');
        var cusRecId = nlapiSubmitRecord(rec,true);
        nlapiLogExecution('DEBUG', ' ','POID: '+ recordId+ ' CusRecID: '+ cusRecId);

    }catch (e) {nlapiLogExecution('DEBUG', 'Error in function updatePo',e.toString());}
}

function getPoId(poId) {
    try{
        var purchaseorderSearch = nlapiSearchRecord("purchaseorder",null,
            [
                ["type","anyof","PurchOrd"],
                "AND",
                ["mainline","is","T"],
                "AND",
                ["custbody_up_order_number","is",poId]
            ],
            [
                new nlobjSearchColumn("internalid")
            ]
        );
        if(!isEmpty(purchaseorderSearch)) {
            var rId = purchaseorderSearch[0].getValue('internalid');
        }else{log.debug('END!!!');}
        return rId;
    }catch (e) {nlapiLogExecution('DEBUG', 'Error in function getPoId',e.toString());}
}


//HELPER FUNCTIONS
function getRemainingUsage(){
    var context = nlapiGetContext();
    if (context.getRemainingUsage() <= 500){
        var stateMain = nlapiYieldScript();
        if( stateMain.status == 'FAILURE'){
            nlapiLogExecution("debug","Failed to yield script (do-while), exiting: Reason = "+ stateMain.reason + " / Size = "+ stateMain.size);
            throw "Failed to yield script";
        }
        else if ( stateMain.status == 'RESUME' ){
            nlapiLogExecution("debug", "Resuming script (do-while) because of " + stateMain.reason+". Size = "+ stateMain.size);
        }
    }
}
function forceParseFloat(stValue) {
    var flValue = parseFloat(stValue);
    if (isNaN(flValue) || (Infinity == stValue)) {
        return 0.00;
    }
    return flValue;
}
function datetotime(template, date){
    date = date.split( template[1] );
    template = template.split( template[1] );
    date = date[ template.indexOf('m') ]
        + "/" + date[ template.indexOf('d') ]
        + "/" + date[ template.indexOf('Y') ];

    return (new Date(date).getTime());
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
function isEmpty ( stValue ) {
    if ((stValue == '') || (stValue == null) || (stValue == undefined)) {
        return true;
    }
    else {
        if (stValue instanceof String) {
            if ((stValue == '')) {
                return true;
            }
        }
        else if (stValue instanceof Array) {
            if (stValue.length == 0) {
                return true;
            }
        }

        return false;
    }
}