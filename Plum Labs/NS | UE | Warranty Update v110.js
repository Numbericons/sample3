/**
 * Copyright (c) 1998-2018 Oracle NetSuite GBU, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Oracle NetSuite GBU, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Oracle NetSuite GBU.
 *
 * Module Description
 *
 * Version    Date			Author           Remarks
 * 1.00       Feb 2021    Amaan Khimani
 *
 */
/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format'],
    function(record, search, runtime, format) {
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.newRecord - New record
         * @param {Record}
         *            scriptContext.oldRecord - Old record
         * @param {string}
         *            scriptContext.type - Trigger type
         * @Since 2015.2
         */

        function afterSubmit(scriptContext){
            var stLogTitle = 'Update Warranty on Plum Case';
            log.debug(stLogTitle, '--Entry--');

            var recNewRecord = scriptContext.newRecord;

            var shipStatus = recNewRecord.getValue({
                fieldId: 'shipstatus'
            });

            try {

                if (recNewRecord.type == 'salesorder' && (scriptContext.type == scriptContext.UserEventType.EDIT || scriptContext.type == scriptContext.UserEventType.CREATE)) {
                    log.debug(stLogTitle, 'Sales Order');

                    var salesOrderId = recNewRecord.id;

                    var itemLineCount = recNewRecord.getLineCount({
                        sublistId: 'item'
                    });

                    var warrantyOnly = true;

                    var plumIncluded = false;
                    //Load sales order record in dynamic mode
                    var recSalesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId
                    });

                    for (var i = 0; i < itemLineCount; i++) {
                        var isPlumCase = recNewRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_pli_plum_case_item',
                            line: i
                        });

                        log.debug(stLogTitle, 'Line ' + i + ' is plum case: ' + isPlumCase);
                        log.debug('lines?', 'Line ' + i + ' lineCount' + (itemLineCount - 1))
                        if (isPlumCase && i == (itemLineCount - 1)){
                            plumIncluded = true;
                          log.debug('plumIncluded? (last item)', "true")
                        }

                        if (isPlumCase && i != (itemLineCount - 1)) {
                            warrantyOnly = false;

                            plumIncluded = true;
                            log.debug('plumIncluded? (not last item)', plumIncluded)
                            var extraWarranty = recNewRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_pli_warranty_item',
                                line: i + 1 //why is this from the next line? Plum line items matched with subsequent warranties?
                            });

                            var ncmLicenseItem = recNewRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_pli_ncm_license_item_line',
                                line: i + 1 //...
                            });

                            if (extraWarranty || ncmLicenseItem) {
                                log.debug(stLogTitle, 'Extra Warranty included for line: ' + i); //Not the next line (since that line is warranty)?
                                var plumQty = recNewRecord.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    line: i
                                });

                                var warrantyQty = recNewRecord.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    line: i + 1
                                });

                                var warrantyInMonths = recNewRecord.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_pli_warranty_months_line',
                                    line: i + 1
                                });

                                warrantyInMonths = parseFloat(warrantyInMonths); //probably should be parseInt

                                var additionalWarranty = warrantyInMonths * (warrantyQty/plumQty);

                                log.debug(stLogTitle, 'additional Warranty: ' + additionalWarranty);

                                recSalesOrder.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_pli_additional_warranty',
                                    line: i,
                                    value: additionalWarranty
                                });

                                recSalesOrder.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_pli_additional_ncm_included',
                                    line: i,
                                    value: true
                                });
                            }
                        }

                        var isWarrantyItem = recNewRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_pli_warranty_item',
                            line: i
                        });

                        var isNcmLicenseItem = recNewRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_pli_ncm_license_item_line',
                            line: i
                        });

                        if (!isWarrantyItem && !isNcmLicenseItem) {
                            warrantyOnly = false;
                        }
                    }

                    if (warrantyOnly) { //one or only warranty items
                        recSalesOrder.setValue({
                            fieldId: 'custbody_pli_warranty_items_only',
                            value: true
                        });
                        recSalesOrder.setValue({
                            fieldId: 'custbody_pli_plum_items_included',
                            value: false
                        });
                    } else if (plumIncluded) {
                        recSalesOrder.setValue({
                            fieldId: 'custbody_pli_plum_items_included',
                            value: true
                        });

                        recSalesOrder.setValue({
                            fieldId: 'custbody_pli_warranty_items_only',
                            value: false
                        });
                    }

                    recSalesOrder.save({ enableSourcing: true, ignoreMandatoryFields: true });
		        //Return/Save set values
                  return true;
                //shipStatus 'C' is Item Fulfillment Shipped
                } else if (recNewRecord.type == 'itemfulfillment' && (scriptContext.type != scriptContext.UserEventType.DELETE) && shipStatus == 'C') {
                    log.debug(stLogTitle, 'Item Fulfillment');
                    var plumCaseSS = runtime.getCurrentScript().getParameter({name: 'custscript_pli_plum_case_warranty_ss'});

                    var recNewRecord = record.load({ //unnessary load, variable declared
                        type: record.Type.ITEM_FULFILLMENT,
                        id: recNewRecord.id
                    });
                    //values inherited from sales order transformation
                    var plumCaseUpdated = recNewRecord.getValue({
                        fieldId: 'custbody_pli_plum_case_updated'
                    });

                    var plumItemsIncluded = recNewRecord.getValue({
                        fieldId: 'custbody_pli_plum_items_included'
                    });

                    var warrantyOnly = recNewRecord.getValue({
                        fieldId: 'custbody_pli_warranty_items_only' 
                    });

                    if (!plumCaseUpdated) {
                        log.debug(stLogTitle, 'Updating plum case records');

                        var itemFulfillmentId = recNewRecord.id;

                        if (warrantyOnly && !plumItemsIncluded) {
                            log.debug(stLogTitle, 'Warranty Items only in fulfillment');
                            var itemLineCount = recNewRecord.getLineCount({
                                sublistId: 'item'
                            });

                            var objSerialNumber = {};

                            for (var i = 0; i < itemLineCount; i++) {
                                var serialNumber = recNewRecord.getSublistText({
                                    sublistId: 'item',
                                    fieldId: 'custcol_pli_serv_renew_serial_numb',
                                    line: i
                                });

                                if (!isEmpty(serialNumber)) {
                                    var quantity = recNewRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        line: i
                                    });

                                    var warrantyMonths = recNewRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_pli_warranty_months_line',
                                        line: i
                                    });

                                    var isNcmItem = recNewRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_pli_ncm_license_item_line',
                                        line: i
                                    });

                                    if(isNcmItem){
                                        var ncm = 'T';
                                    }
                                    else{
                                        var ncm = 'F';
                                    }

                                    var totalMonths = quantity * warrantyMonths;

                                    objSerialNumber[serialNumber] = totalMonths + ',' + ncm;
                                }
                            }
                            log.debug(stLogTitle, 'objSerialNumber: ' + JSON.stringify(objSerialNumber));
                            var arrSerialNumbers = Object.keys(objSerialNumber);

                            if(!isEmpty(arrSerialNumbers)) {
                                var arrPlumData = getPlumCasesToUpdate(plumCaseSS, arrSerialNumbers);

                                if (!isEmpty(arrPlumData)) {
                                    updateWarrantyDates(objSerialNumber, arrPlumData);

                                    record.submitFields({
                                        type: record.Type.ITEM_FULFILLMENT,
                                        id: itemFulfillmentId,
                                        values: {
                                            'custbody_pli_plum_case_updated': true
                                        }
                                    });
                                }
                            }
                        } else if (plumItemsIncluded && !warrantyOnly) {
                            log.debug(stLogTitle, 'Plum Case Items included in fulfillment');
                            var objSerialNumber = getFulfillmentFields(recNewRecord);
                            log.debug(stLogTitle, 'objSerialNo: ' + JSON.stringify(objSerialNumber));

                            var fulfillmentDate = recNewRecord.getValue({
                                fieldId: 'trandate'
                            });

                            var arrSerialNumbers = Object.keys(objSerialNumber);

                            if (!isEmpty(arrSerialNumbers)) {
                                var arrPlumData = getPlumCasesToUpdate(plumCaseSS, arrSerialNumbers);
                                log.debug(stLogTitle, 'arrPlumData: ' + JSON.stringify(arrPlumData));

                                if (!isEmpty(arrPlumData)) {
                                   addWarrantyDates(objSerialNumber, arrPlumData, fulfillmentDate);

                                    record.submitFields({
                                        type: record.Type.ITEM_FULFILLMENT,
                                        id: itemFulfillmentId,
                                        values: {
                                            'custbody_pli_plum_case_updated': true
                                        }
                                    });
                                }
                            }
                        }
                    }
                } else if (recNewRecord.type == 'invoice' && (scriptContext.type == scriptContext.UserEventType.EDIT || scriptContext.type == scriptContext.UserEventType.CREATE)){
                    log.debug(stLogTitle, 'Invoice');

                    var plumCaseSS = runtime.getCurrentScript().getParameter({name: 'custscript_pli_plum_case_warranty_ss'});

                    var serialNumberSS = runtime.getCurrentScript().getParameter({name: 'custscript_pli_serial_no_ss'});

                    var invoiceUpdated = recNewRecord.getValue({
                        fieldId: 'custbody_pli_invoice_updated'
                    });

                    if(!invoiceUpdated){
                        var objSerialNumber = getInvoiceFields(serialNumberSS, recNewRecord.id);

                        log.debug(stLogTitle, 'objSerialNumber: ' + JSON.stringify(objSerialNumber));

                        if (!isEmpty(objSerialNumber)) {
                            var arrSerialNumbers = Object.keys(objSerialNumber);

                            var arrPlumData = getPlumCasesToUpdate(plumCaseSS, arrSerialNumbers);

                            log.debug(stLogTitle, 'arrPlumData: ' + JSON.stringify(arrPlumData));

                            for (var i = 0; i < arrPlumData.length; i++) {
                                record.submitFields({
                                    type: 'customrecord_pli_plum_case',
                                    id: arrPlumData[i].internalId,
                                    values: {
                                        'custrecord_pli_plum_case_invoice': recNewRecord.id
                                    }
                                });
                            }

                            record.submitFields({
                                type: record.Type.INVOICE,
                                id: recNewRecord.id,
                                values: {
                                    'custbody_pli_invoice_updated': true
                                }
                            });
                        }
                    }
                }
                log.debug(stLogTitle, '--Exit--');
            }
            catch(error){
                log.debug(stLogTitle, error);
            }

        }
        function getInvoiceFields(stSearch, invoiceId){
            var stLogTitle = 'getInvoiceFields';

            log.debug(stLogTitle, '--Entry--');

            var objReturn = {};

            var searchObj = search.load({
                id: stSearch
            });

            var transactionFilter = search.createFilter({
                name: 'internalid',
                operator: search.Operator.ANYOF,
                values: invoiceId
            });

            searchObj.filters.push(transactionFilter);

            var arrSearchResult = getAllResults(searchObj);

            log.debug(stLogTitle, 'arrSearchResult: ' + JSON.stringify(arrSearchResult));

            for (var i=0; i<arrSearchResult.length; i++){
                var serialNumber = arrSearchResult[i].getValue({
                    name: 'serialnumber'
                });

                objReturn[serialNumber] = 1;
            }

            log.debug(stLogTitle, '--Exit--');

            return objReturn;
        }
        function addWarrantyDates(objSerialNumber, arrPlumData, fulfillmentDate){
            var stLogTitle = 'addWarrantyDates';

            for(var k=0; k<arrPlumData.length;k++){
                arrPlumData[k].fulfillmentDate = fulfillmentDate;
            }
          log.debug('fulfillmentDate', fulfillmentDate);

            log.debug(stLogTitle, '--Entry--');
            //add fulfillment date into arrPlumData
            log.debug(stLogTitle, 'arrPlumData: ' + JSON.stringify(arrPlumData));
            for (var i=0; i<arrPlumData.length; i++){
                var plumCareDate = '';

                var initialDate = new Date(arrPlumData[i].fulfillmentDate);

                log.debug(stLogTitle, 'initialDate: ' + initialDate);

                var initialDateNcm = new Date(arrPlumData[i].fulfillmentDate);

                log.debug(stLogTitle, 'initialDate NCM: ' + initialDateNcm);

                var serialNumber = arrPlumData[i].serialNumber;

                var arrFields = objSerialNumber[serialNumber].split(',');

                log.debug(stLogTitle, 'arrFields: ' + JSON.stringify(arrFields));

                var additionalWarranty = parseFloat(arrFields[0]);

                var extraNcm = arrFields[1];

                log.debug(stLogTitle, 'additionalWarranty: ' + additionalWarranty);

                log.debug(stLogTitle, 'extraNcm: ' + extraNcm);

                log.debug(stLogTitle, 'plumCaseWarranty: ' + arrPlumData[i].warranty);

                var totalAdditionalWarranty = additionalWarranty + arrPlumData[i].warranty;

                log.debug(stLogTitle, 'totalAdditionalWarranty: ' + totalAdditionalWarranty);

                if(extraNcm == 'F') {
                    plumCareDate = new Date(initialDate.setMonth(initialDate.getMonth() + totalAdditionalWarranty));
                    plumCareDate = new Date(plumCareDate.setDate(plumCareDate.getDate() + 7));
                }
                else{
                    plumCareDate = new Date(initialDate.setMonth(initialDate.getMonth() + arrPlumData[i].warranty));
                    plumCareDate = new Date(plumCareDate.setDate(plumCareDate.getDate() + 7));
                }
                //plumCareDate = new Date(plumCareDate.setDate(plumCareDate.getDate() + 7));
                //plumCareDate = format.format({
                 //   value: plumCareDate,
                  //  type: format.Type.DATETIME
               // });
                if(!isEmpty(totalAdditionalWarranty)) {
                    //if (additionalWarranty > 0) {
                        if(!isEmpty(arrPlumData[i].ncmDate)) {
                            var ncmDate = new Date(arrPlumData[i].ncmDate);
                            var ncmDate = new Date(ncmDate.setMonth(ncmDate.getMonth() + additionalWarranty)); //re-declaration of var
                        }
                        else{
                            log.debug(stLogTitle, 'Setting initial NCM date');
                            var ncmDate = new Date(initialDateNcm.setMonth(initialDateNcm.getMonth() + totalAdditionalWarranty));
                            var ncmDate = new Date(ncmDate.setDate(ncmDate.getDate() + 7));
                        }

                        record.submitFields({
                            type: 'customrecord_pli_plum_case',
                            id: arrPlumData[i].internalId,
                            values: {
                                'custrecord_pli_plum_case_warr_end': plumCareDate,
                                'custrecord_pli_plum_case_ncm_end': ncmDate,
                              //Set Initial Sales Date on Plum Case record
                              	'custrecord_pli_plum_case_sale_date': new Date(arrPlumData[i].fulfillmentDate)
                            }
                        });
                /*    } else {
                        record.submitFields({
                            type: 'customrecord_pli_plum_case',
                            id: arrPlumData[i].internalId,
                            values: {
                                'custrecord_pli_plum_case_warr_end': plumCareDate
                            }
                        });
                    }*/
                }
            }
            log.debug(stLogTitle, '--Exit--');
        }

        function getFulfillmentFields(recItemFulfillment){
            var stLogTitle = 'getFulfillmentFields';

            log.debug(stLogTitle, '--Entry--');

            var itemLineCount = recItemFulfillment.getLineCount({
                sublistId: 'item'
            });

            var objReturn = {};

            for (var i=0; i<itemLineCount; i++){
                var plumCaseItem = recItemFulfillment.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pli_plum_case_item',
                    line: i
                });

                if (plumCaseItem){
                    var additionalWarranty = recItemFulfillment.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_pli_additional_warranty',
                        line: i
                    });

                    var hasNcmLicense = recItemFulfillment.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_pli_additional_ncm_included',
                        line: i
                    });

                    var extraNcm = 'F';

                    if(hasNcmLicense){
                        extraNcm = 'T';
                    }

                    if(isEmpty(additionalWarranty)){
                        additionalWarranty = 0;
                    }
                    else{
                        additionalWarranty = parseFloat(additionalWarranty);
                    }
                    var recInventoryDetail = recItemFulfillment.getSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail',
                        line: i
                    });

                    var serialLineCount = recInventoryDetail.getLineCount({
                        sublistId: 'inventoryassignment'
                    });

                    for (var j=0; j<serialLineCount; j++){
                        var serialNumber = recInventoryDetail.getSublistText({
                            sublistId: 'inventoryassignment',
                            fieldId: 'issueinventorynumber',
                            line: j
                        });

                        objReturn[serialNumber] = additionalWarranty + ',' + extraNcm;
                    }
                }
            }

            log.debug(stLogTitle, '--Exit--');

            return objReturn;
        }

        function getPlumCasesToUpdate(stSearch, arrSerialNumbers){
            var stLogTitle = 'getPlumCasesToUpdate';
            log.debug(stLogTitle, '--Entry--');
            var arrReturn = [];
            var arrFilter = [];

            for (var j=0; j<arrSerialNumbers.length; j++){
                if (j !== arrSerialNumbers.length - 1){
                    arrFilter.push(["idtext",search.Operator.IS,arrSerialNumbers[j]]);
                    arrFilter.push('or');
                }
                else{
                    arrFilter.push(["idtext",search.Operator.IS,arrSerialNumbers[j]]);
                }
            }
          
          //Above filter makes it so that if there is no serial number, it will include every plum case. Below, a filter is added if no serial number is included on the item.
				if(arrSerialNumbers.length == 0){
                  arrFilter.push(["idtext",search.Operator.IS,'']);
                }

            var searchObj = search.create({
                type: "customrecord_pli_plum_case",
                filters: arrFilter,
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "ID"
                        }),
                        search.createColumn({name: "custrecord_pli_plum_case_item", label: "Item"}),
                        search.createColumn({
                            name: "custitem_pli_warrantyinmonth",
                            join: "CUSTRECORD_PLI_PLUM_CASE_ITEM",
                            label: "Warranty in Months"
                        }),
                        search.createColumn({name: "custrecord_pli_plum_case_warr_end", label: "Plum Care End Date"}),
                        search.createColumn({name: "custrecord_pli_plum_case_ncm_end", label: "NCM End Date"})
                    ]
            });

            log.debug(stLogTitle, JSON.stringify(searchObj));

            var arrSearchResult = searchObj.run().getRange(0, 1000);

            log.debug(stLogTitle, 'arrSearchResult: ' + JSON.stringify(arrSearchResult));

            for (var i=0; i<arrSearchResult.length; i++){
                var serialNumber = arrSearchResult[i].getValue({
                    name: 'name'
                });

                    var plumCase = arrSearchResult[i].id;

                    var warrantyMonths = arrSearchResult[i].getValue({
                        name: 'custitem_pli_warrantyinmonth',
                        join: 'CUSTRECORD_PLI_PLUM_CASE_ITEM'
                    });

                    warrantyMonths = parseFloat(warrantyMonths);

                    var careEndDate = arrSearchResult[i].getValue({
                        name: 'custrecord_pli_plum_case_warr_end'
                    });

                    var ncmEndDate = arrSearchResult[i].getValue({
                        name: 'custrecord_pli_plum_case_ncm_end'
                    });

                    var objPlumRecord = {
                        internalId: plumCase,
                        serialNumber: serialNumber,
                        warranty: warrantyMonths,
                        careDate: careEndDate,
                        ncmDate: ncmEndDate
                    };

                    arrReturn.push(objPlumRecord);

            }

            log.debug(stLogTitle, '--Exit--');

            return arrReturn;
        }

        function updateWarrantyDates(objSerialNumber, arrPlumData){
            var stLogTitle = 'updateWarrantyDates';

            log.debug(stLogTitle, '--Entry--');

            log.debug(stLogTitle, 'arrPlumData: ' + JSON.stringify(arrPlumData));

            for (var i=0; i<arrPlumData.length; i++){
                var serialNumber = arrPlumData[i].serialNumber;

                var arrFields = objSerialNumber[serialNumber].split(',');

                var isNcmItem = arrFields[1];

                var totalAdditionalWarranty = parseFloat(arrFields[0]);

                log.debug(stLogTitle, 'totalAdditionalWarranty: ' + totalAdditionalWarranty);

                var plumCareDate = '';
                var newPlumCareDate = '';
                var ncmDate = '';

                if(!isEmpty(totalAdditionalWarranty)) {

                    if (!isEmpty(arrPlumData[i].careDate) && isNcmItem == 'F') {
                        plumCareDate = new Date(arrPlumData[i].careDate);

                        log.debug(stLogTitle, 'current plumCareDate: ' + plumCareDate);

                        newPlumCareDate = new Date(plumCareDate.setMonth(plumCareDate.getMonth() + totalAdditionalWarranty));

                        log.debug(stLogTitle, 'newPlumCareDate: ' + newPlumCareDate);
                    }
                    if (!isEmpty(arrPlumData[i].ncmDate)) {
                        ncmDate = new Date(arrPlumData[i].ncmDate);

                        ncmDate = new Date(ncmDate.setMonth(ncmDate.getMonth() + totalAdditionalWarranty));
                    }

                    if(isNcmItem == 'F') {
                        record.submitFields({
                            type: 'customrecord_pli_plum_case',
                            id: arrPlumData[i].internalId,
                            values: {
                                'custrecord_pli_plum_case_warr_end': newPlumCareDate,
                                'custrecord_pli_plum_case_ncm_end': ncmDate
                            }
                        });
                    }
                    else{
                        record.submitFields({
                            type: 'customrecord_pli_plum_case',
                            id: arrPlumData[i].internalId,
                            values: {
                                'custrecord_pli_plum_case_ncm_end': ncmDate
                            }
                        });
                    }
                }
            }

            log.debug(stLogTitle, '--Exit--');
        }

        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0));
        }

        function getAllResults(objSearch, maxResults)
        {
            var intPageSize = 1000;
            // limit page size if the maximum is less than 1000
            if (maxResults && maxResults < 1000) {
                intPageSize = maxResults;
            }
            var objResultSet = objSearch.runPaged({
                pageSize : intPageSize
            });
            var arrReturnSearchResults = [];
            var j = objResultSet.pageRanges.length;
            // retrieve the correct number of pages. page count = maximum / 1000
            if (j && maxResults) {
                j = Math.min(Math.ceil(maxResults / intPageSize), j);
            }
            for (var i = 0; i < j; i++) {
                var objResultSlice = objResultSet.fetch({
                    index : objResultSet.pageRanges[i].index
                });
                arrReturnSearchResults = arrReturnSearchResults.concat(objResultSlice.data);
            }
            if (maxResults) {
                return arrReturnSearchResults.slice(0, maxResults);
            } else {
                return arrReturnSearchResults;
            }
        }
        return {
            afterSubmit : afterSubmit
        };
    });