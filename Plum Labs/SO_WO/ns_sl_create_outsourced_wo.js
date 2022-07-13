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
 * 1.00       Jan 2021    Amaan Khimani
 *
 */
/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/http', 'N/record', 'N/redirect', 'N/error', 'N/runtime', 'N/search'],
    function(http, record, redirect, error, runtime, search) {
        function onRequest(context) {
            try {
                var stLogTitle = "SL Create WO";
                log.debug(stLogTitle, '--Entry--');
                var workOrderId = context.request.parameters.workorder;

                var recWorkOrder = record.load({
                    type: record.Type.WORK_ORDER,
                    id: workOrderId
                });

                var assemblyItem = recWorkOrder.getValue({
                    fieldId: 'assemblyitem'
                });

                var objAssemblyFields = search.lookupFields({
                    type: search.Type.ITEM,
                    id: assemblyItem,
                    columns: ['custitem_pli_outsource_charge_item', 'custitem_pli_outsource_manufacturer']
                });

                log.debug(stLogTitle, 'objAssemblyFields: ' + JSON.stringify(objAssemblyFields));

                var outsourceItem = objAssemblyFields.custitem_pli_outsource_charge_item[0].value;

                var outsourceManufacturer = objAssemblyFields.custitem_pli_outsource_manufacturer[0].value;

                var objWoFields = getWoFields(recWorkOrder);

                log.debug(stLogTitle, 'objWoFields: ' + JSON.stringify(objWoFields));

                var stLocationSearch = runtime.getCurrentScript().getParameter({name: 'custscript_outsourced_wo_cut_case_ss'});

                var workLocation = getCutCaseLocation(stLocationSearch, objWoFields.cutitem);

                var outsourcedWorkOrder = createWorkOrder(objWoFields, workLocation, outsourceItem, outsourceManufacturer);

                recWorkOrder.setValue({
                    fieldId: 'custbody_pli_linked_outsourced_wo',
                    value: outsourcedWorkOrder
                });

                recWorkOrder.save();

                redirect.toRecord({
                    type : record.Type.WORK_ORDER,
                    id : workOrderId,
                });

                log.debug(stLogTitle, '--Exit--');
            }
            catch(error){
                log.debug(stLogTitle, JSON.stringify(error));

                redirect.toRecord({
                    type : record.Type.WORK_ORDER,
                    id : workOrderId,
                });
            }
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

        function createWorkOrder(objWoFields, workLocation, outsourceItem, outsourceManufacturer){
            var stLogTitle = 'createWorkOrder';

            log.debug(stLogTitle, '--Entry--');

            var recWorkOrder = record.create({
                type: record.Type.WORK_ORDER,
                isDynamic: true
            });

            recWorkOrder.setValue({
                fieldId: 'assemblyitem',
                value: objWoFields.cutitem
            });

            recWorkOrder.setText({
                fieldId: 'location',
                text: workLocation
            });

            //recWorkOrder.setValue({
            //    fieldId: 'entity',
             //   value: objWoFields.customer
            //});

            recWorkOrder.setValue({
                fieldId: 'quantity',
                value: objWoFields.quantity
            });

            recWorkOrder.setValue({
                fieldId: 'custbody_pli_port_1',
                value: objWoFields.port1
            });

            recWorkOrder.setValue({
                fieldId: 'custbody_pli_port_1_qty',
                value: objWoFields.port1qty
            });

            recWorkOrder.setValue({
                fieldId: 'custbody_pli_port_2',
                value: objWoFields.port2
            });

            recWorkOrder.setValue({
                fieldId: 'custbody_pli_port_2_qty',
                value: objWoFields.port2qty
            });

            recWorkOrder.setValue({
                fieldId: 'custbody_pli_port_3',
                value: objWoFields.port3
            });

            recWorkOrder.setValue({
                fieldId: 'custbody_pli_port_3_qty',
                value: objWoFields.port3qty
            });

            //recWorkOrder.setValue({
             //   fieldId: 'outsourcingcharge',
             //   value: outsourceItem
            //});

           // recWorkOrder.setValue({
            //    fieldId: 'vendor',
            //    value: outsourceManufacturer
           // });

            var workId = recWorkOrder.save();

            log.debug(stLogTitle, '--Exit--');

            return workId;
        }

        function getCutCaseLocation(stSearch, stItem){
            var stLogTitle = 'getCutCaseLocation';

            log.debug(stLogTitle, '--Entry--');

            var result = '';

            var cutCaseSearchObj = search.load({
                id: stSearch
            });

            var itemFilter = search.createFilter({
                name: 'internalid',
                operator: search.Operator.ANYOF,
                values: stItem
            });

            cutCaseSearchObj.filters.push(itemFilter);

            var cutCaseSearchResult = getAllResults(cutCaseSearchObj);

            if (cutCaseSearchResult.length > 0) {

                result = cutCaseSearchResult[0].getValue({
                    name: 'manufacturinglocations',
                    join: 'preferredVendor'
                });

            }

            log.debug(stLogTitle, '--Exit--');

            return result;
        }

        function getWoFields(recWorkOrder){
            var stLogTitle = 'getWoFields';

            log.debug(stLogTitle, '--Entry--');

            var objReturn = {};

            var headerQuantity = recWorkOrder.getValue({
                fieldId: 'quantity'
            });

            var endUser = recWorkOrder.getValue({
                fieldId: 'custbody_pli_wo_end_user'
            });

            var customer = recWorkOrder.getValue({
                fieldId: 'entity'
            });

            var port1 = recWorkOrder.getValue({
                fieldId: 'custbody_pli_port_1'
            });

            var port1Qty = recWorkOrder.getValue({
                fieldId: 'custbody_pli_port_1_qty'
            });

            var port2 = recWorkOrder.getValue({
                fieldId: 'custbody_pli_port_2'
            });

            var port2Qty = recWorkOrder.getValue({
                fieldId: 'custbody_pli_port_2_qty'
            });

            var port3 = recWorkOrder.getValue({
                fieldId: 'custbody_pli_port_3'
            });

            var port3Qty = recWorkOrder.getValue({
                fieldId: 'custbody_pli_port_3_qty'
            });

            var itemLineCount = recWorkOrder.getLineCount({
                sublistId: 'item'
            });

            for (var i=0; i<itemLineCount; i++){

                var drillCase = recWorkOrder.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pli_drilled_case_item',
                    line: i
                });

                var outsourcedCutCase = recWorkOrder.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pli_outsourced_cut_case',
                    line: i
                });

                if (drillCase) {
                 recWorkOrder.setSublistValue({
                     sublistId: 'item',
                     fieldId: 'quantity',
                     line: i,
                     value: 0
                 });
                }

                if (outsourcedCutCase){
                    recWorkOrder.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i,
                        value: headerQuantity
                    });

                    var cutCaseItem = recWorkOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
                }
            }

            objReturn = {
                cutitem: cutCaseItem,
                enduser: endUser,
                customer: customer,
                quantity: headerQuantity,
                port1: port1,
                port1qty: port1Qty,
                port2: port2,
                port2qty: port2Qty,
                port3: port3,
                port3qty: port3Qty
            };

            log.debug(stLogTitle, '--Exit--');

            return objReturn;
        }

        return {
            onRequest: onRequest
        }
    });