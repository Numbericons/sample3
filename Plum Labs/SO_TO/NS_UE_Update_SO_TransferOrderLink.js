/**
 * Copyright (c) 1998-2017 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 *
 *
 * Version Type     Date                Author          Remarks
 * 1.0              10 Oct 2020         Karthik       	Update "Linked Transfer Order" field on SO record with the current Transfer Order if the
 *                                                      field on SO is blank
 * 2.0              26 Jan 2021         Amaan Khimani   Updated to prepopulate fields on transfer order
 * 2.1              31 Dec 2021         Godfrey Sorita  Add shipping address logic
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime'],
    /**
     * @param{record} record
     */
    (record, search, runtime) => {

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            let stLogTitle = 'beforeLoad';
            log.debug(stLogTitle, '--Entry--');

            try {
               if (scriptContext.type == scriptContext.UserEventType.CREATE) {
                   let recTransferOrder = scriptContext.newRecord;
                   let stToLocation = runtime.getCurrentScript().getParameter({ name: 'custscript_pli_to_location' });
                   let stFromLocation = runtime.getCurrentScript().getParameter({ name: 'custscript_pli_from_location' });
                   let stLinkedSalesOrder = recTransferOrder.getValue({ fieldId: 'custbody_pli_linkedsalesorder' });

                   log.debug(`${stLogTitle} | stLinkedSalesOrder`, stLinkedSalesOrder);

                   //get values from sales order record
                   let recSalesOrder = record.load({
                       type: record.Type.SALES_ORDER,
                       id: stLinkedSalesOrder,
                   });

                   let arrItems = [];

                   let itemLineCount = recSalesOrder.getLineCount({ sublistId: 'item' });
                   for (let i=0; i<itemLineCount; i++) {
                       let stItem = recSalesOrder.getSublistValue({
                           sublistId: 'item',
                           fieldId: 'custcol_pli_actual_finished_good_item',
                           line: i
                       });

                       if (!isEmpty(stItem)){
                           let quantity = recSalesOrder.getSublistValue({
                               sublistId: 'item',
                               fieldId: 'quantity',
                               line: i
                           });
                           let objItem = {
                               item: stItem,
                               quantity: quantity
                           };

                           arrItems.push(objItem);
                       }
                   }

                   log.debug(`${stLogTitle} | arrItems`, arrItems);

                   //set values on transfer order record
                   recTransferOrder.setValue({
                       fieldId: 'location',
                       value: stFromLocation
                   });
                   recTransferOrder.setValue({
                       fieldId: 'transferlocation',
                       value: stToLocation
                   });

                   for (let i=0; i<arrItems.length; i++){
                       recTransferOrder.setSublistValue({
                           sublistId: 'item',
                           fieldId: 'item',
                           line: i,
                           value: arrItems[i].item
                       });
                       recTransferOrder.setSublistValue({
                           sublistId: 'item',
                           fieldId: 'quantity',
                           line: i,
                           value: arrItems[i].quantity
                       });
                   }
               }
           }
           catch(error){
               log.debug(stLogTitle, error);
           }

           log.debug(stLogTitle, '--Exit--');
        }

        const afterSubmit = (scriptContext) => {
            let stLogTitle = 'afterSubmit';
            try {
                log.debug('afterSubmit', '===== Start =====');
                if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
                    let recTransferOrder = record.load({
                        type: record.Type.TRANSFER_ORDER,
                        id: scriptContext.newRecord.id,
                        isDynamic: true
                    });
                    let stLinkedSalesOrder = recTransferOrder.getValue({ fieldId: 'custbody_pli_linkedsalesorder' });
                    log.debug(`${stLogTitle} | stLinkedSalesOrder`, stLinkedSalesOrder);

                    if (isEmpty(stLinkedSalesOrder)) return;

                    let recSalesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: stLinkedSalesOrder
                    });
                    let stTransferLink = recSalesOrder.getValue({ fieldId: 'custbody_pli_inv_transfer_link' });
                    log.debug(`${stLogTitle} | Transfer Link`, stTransferLink);

                    setShippingAddress(recSalesOrder, recTransferOrder);
                    recTransferOrder.save({
                        ignoreMandatoryFields: true
                    });
                    log.audit(`${stLogTitle} | Updated TO shipping address`, `ID = ${scriptContext.newRecord.id}`);


                    if (isEmpty(stTransferLink)) {
                        record.submitFields({
                            type: record.Type.SALES_ORDER,
                            id: stLinkedSalesOrder,
                            values: {
                                custbody_pli_inv_transfer_link: recTransferOrder.id
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    }
                }
            } catch (error) {
                log.error('ERROR', error);
            }
        }

        const isEmpty = (stValue) => {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0));
        }

        const setShippingAddress = (recSalesOrder, recTransferOrder) => {
            let recShippingAddress = recSalesOrder.getSubrecord({ fieldId: 'shippingaddress' });
            let stCountry = recShippingAddress.getValue({
                fieldId: 'country'
            });
            let stAttention = recShippingAddress.getValue({
                fieldId: 'attention'
            });
            let stAddressee = recShippingAddress.getValue({
                fieldId: 'addressee'
            });
            let stAddress1 = recShippingAddress.getValue({
                fieldId: 'addr1'
            });
            let stAddress2 = recShippingAddress.getValue({
                fieldId: 'addr2'
            });
            let stCity = recShippingAddress.getValue({
                fieldId: 'city'
            });
            let stState = recShippingAddress.getValue({
                fieldId: 'state'
            });
            let stZipCode = recShippingAddress.getValue({
                fieldId: 'zip'
            });
            let stPhone = recShippingAddress.getValue({
                fieldId: 'addrphone'
            });
            let stAddressText = recShippingAddress.getValue({
                fieldId: 'addrtext'
            });

            let recTransferShippingAddress = recTransferOrder.getSubrecord({
                fieldId: 'shippingaddress'
            });
            recTransferShippingAddress.setValue({
                fieldId: 'country',
                value: stCountry
            });
            recTransferShippingAddress.setValue({
                fieldId: 'attention',
                value: stAttention
            });
            recTransferShippingAddress.setValue({
                fieldId: 'addressee',
                value: stAddressee
            });
            recTransferShippingAddress.setValue({
                fieldId: 'addr1',
                value: stAddress1
            });
            recTransferShippingAddress.setValue({
                fieldId: 'addr2',
                value: stAddress2
            });
            recTransferShippingAddress.setValue({
                fieldId: 'city',
                value: stCity
            });
            recTransferShippingAddress.setValue({
                fieldId: 'state',
                value: stState
            });
            recTransferShippingAddress.setValue({
                fieldId: 'zip',
                value: stZipCode
            });
            recTransferShippingAddress.setValue({
                fieldId: 'addrphone',
                value: stPhone
            });
            recTransferShippingAddress.setValue({
                fieldId: 'addrtext',
                value: stAddressText
            });
            recTransferShippingAddress.setValue({
                fieldId: 'override',
                value: false
            });
        }

        return {
            beforeLoad : beforeLoad,
            afterSubmit: afterSubmit
        }
    });