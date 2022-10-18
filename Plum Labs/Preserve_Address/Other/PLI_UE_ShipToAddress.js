/**
 * Copyright (c) 2021, Oracle and/or its affiliates.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ('Confidential Information'). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 *
 * Version          Date          Author               Remarks
 * 1.0              2021/1/20     godfrey.sorita       Initial commit
 **/

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(require=> {
    const runtime = require('N/runtime');
    const serverWidget = require('N/ui/serverWidget');
    const url = require('N/url');
    const redirect = require('N/redirect');
    const search = require('N/search');
    const record = require('N/record');

    /**
     * Defines the function definition that is executed before record is loaded.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @param {Form} scriptContext.form - Current form
     * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
     *
     * @return null
     * @since 2015.2
     */
    const beforeLoad = (scriptContext) => {
        const stLogTitle = 'beforeLoad';

        try {
            log.debug({ title: stLogTitle, details: `scriptContext.type = ${scriptContext.type}` });
            const allowedEventTypes = [
                scriptContext.UserEventType.CREATE,
                scriptContext.UserEventType.EDIT,
                scriptContext.UserEventType.COPY,
            ];
            if (!allowedEventTypes.includes(scriptContext.type)) return;

            scriptContext.form.clientScriptModulePath = 'SuiteScripts/Ship to Address/PLI_CS_ShipToAddress.js';

            //Add custom ship to address fields
            let objHeaderAddress = scriptContext.form.addField({
                type: serverWidget.FieldType.SELECT,
                id: 'custpage_ship_to_address',
                label: 'Existing Ship-to Party Addresses',
                container: 'main' //shipping
            });
            scriptContext.form.insertField({
                field: objHeaderAddress,
                nextfield: 'shipaddresslist'
            })

            //Add save and edit button
            let objItemSublist = scriptContext.form.getSublist({
                id: 'item'
            });
            objItemSublist.addButton({
                id: 'custpage_save_edit',
                label: 'Save & Edit',
                functionName: "saveAndEdit()"
            });

            //Add action field
            let objAction = scriptContext.form.addField({
                id: 'custpage_action',
                type: serverWidget.FieldType.TEXT,
                label: 'Action'
            });
            objAction.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            })

            scriptContext.form.getSublist({ id: 'item' }).addField({
                type: serverWidget.FieldType.SELECT,
                id: 'custpage_ship_to_address_line',
                label: 'Existing Ship-to Party Addresses'
            });

            //Add field to store Suitelet URL
            let stSuiteletUrl = url.resolveScript({
                scriptId: 'customscript_ns_sl_ship_to_address',
                deploymentId: 'customdeploy_ns_sl_ship_to_address'
            });
            log.debug({ title: stLogTitle, details: `stSuiteletUrl = ${stSuiteletUrl}` });

            let fldSuiteletUrl = scriptContext.form.addField({
                type: serverWidget.FieldType.TEXT,
                id: 'custpage_suitelet_url',
                label: 'Suitelet URL'
            });
            fldSuiteletUrl.defaultValue = stSuiteletUrl;
            fldSuiteletUrl.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        } catch (error) {
            log.error({ title: stLogTitle, details: error });
        }
    }

    /**
     * Defines the function definition that is executed before record is submitted.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @since 2015.2
     */
    const beforeSubmit = (scriptContext) => {
        const stLogTitle = 'beforeSubmit';

        try {
            log.debug({ title: stLogTitle, details: `scriptContext.type = ${scriptContext.type}` });
            const allowedEventTypes = [
                scriptContext.UserEventType.CREATE,
                scriptContext.UserEventType.EDIT,
                scriptContext.UserEventType.COPY,
            ];
            if (!allowedEventTypes.includes(scriptContext.type)) return;

            let stBillTo = scriptContext.newRecord.getValue({ fieldId: 'entity' });
            let stShipTo = scriptContext.newRecord.getValue({ fieldId: 'custbody_pli_shipto_end_user' });
            let bDiffShip = stBillTo !== stShipTo;
            let bIsMultiShip = scriptContext.newRecord.getValue({ fieldId: 'ismultishipto' });
            log.debug({ title: stLogTitle, details: {stBillTo, stShipTo, bDiffShip, bIsMultiShip }});

            if (bIsMultiShip) { //Line shipping
                setLineShipping(scriptContext.newRecord, bDiffShip);
            } else {
                let stShipToAddress = scriptContext.newRecord.getValue({ fieldId: 'custpage_ship_to_address' });
                if (stShipToAddress != '') {
                    setHeaderShipping(scriptContext.newRecord, bDiffShip, stShipToAddress);
                }
            }

            let stAction = scriptContext.newRecord.getValue({ fieldId: 'custpage_action' });
            log.debug({ title: stLogTitle, details: `stAction = ${stAction}` });

            if (stAction == 'saveAndEdit') {
                scriptContext.newRecord.setValue({
                    fieldId: 'orderstatus',
                    value: 'A' //Pending Approval
                });
            }

            log.debug({ title: stLogTitle, details: 'Script execution complete' });
        } catch (error) {
            log.error({ title: stLogTitle, details: error });
        }
    }

    /**
     * Defines the function definition that is executed after record is submitted.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @since 2015.2
     */
    const afterSubmit = (scriptContext) => {
        const stLogTitle = 'afterSubmit';

        try {
            let stAction = scriptContext.newRecord.getValue({ fieldId: 'custpage_action' });
            log.debug({ title: stLogTitle, details: `stAction = ${stAction}` });

            let bIsMultiShip = scriptContext.newRecord.getValue({ fieldId: 'ismultishipto' });
            let stShipTo = scriptContext.newRecord.getValue({ fieldId: 'custbody_pli_shipto_end_user' });

            if (bIsMultiShip) { //Line shipping
                addLineAddressToCustomer(scriptContext.newRecord, stShipTo);
            } else {
                let stShipToAddress = scriptContext.newRecord.getValue({ fieldId: 'custpage_ship_to_address' });
                if (stShipToAddress == '') {
                    addAddressToCustomer(scriptContext.newRecord, stShipTo);
                }
            }

            if (stAction == 'saveAndEdit') {
                redirect.toRecord({
                    type: scriptContext.newRecord.type,
                    id: scriptContext.newRecord.id,
                    isEditMode: true
                });
                log.debug({ title: stLogTitle, details: 'Redirecting to edit page...' });
            }
        } catch (error) {
            log.error({ title: stLogTitle, details: error });
        }
    }

    const setHeaderShipping = (transaction, hasDiffId, shipAddress) => {
        let stCustomer = transaction.getValue({ fieldId: 'custbody_pli_shipto_end_user' });

        if (hasDiffId) {
            let objAddresses = getAddressDetails(stCustomer);
            let objAddressDetails = objAddresses[shipAddress];
            // record.setValue({
            //     fieldId: 'shipaddresslist',
            //     value: -2 //Custom
            // });
            let objShipAddress = transaction.getSubrecord({
                fieldId: 'shippingaddress'
            });
            for (const [key, value] of Object.entries(objAddressDetails)) {
                if (key != 'addAddress' && value != "") objShipAddress.setValue(key, value);
            }
            // transaction.setValue({
            //     fieldId: 'shipaddress',
            //     value: objAddressDetails.addrtext
            // });
        } else {
            transaction.setValue({
                fieldId: 'shipaddresslist',
                value: shipAddress
            });
        }
    }

    const setLineShipping = (transaction, hasDiffId) => {
        const stLogTitle = 'setLineShipping';
        const sublistId = 'item';

        let stCustomer = transaction.getValue({ fieldId: 'custbody_pli_shipto_end_user' });
        let objAddresses = getAddressDetails(stCustomer);
        let intLines = transaction.getLineCount({ sublistId });
        if (hasDiffId) {
            for (let line = 0; line < intLines; line++) {
                let stLineAddress = transaction.getSublistValue({ sublistId, line, fieldId: 'custpage_ship_to_address_line' });
                log.debug({ title: stLogTitle, details: stLineAddress });

                if (!stLineAddress) continue;

                log.debug({ title: stLogTitle, details: `Setting line ${line}` });

                let objLineAddress = transaction.getSublistSubrecord({ sublistId, line, fieldId: 'shippingaddress' });
                let objAddressDetails = objAddresses[stLineAddress];
                for (const [key, value] of Object.entries(objAddressDetails)) {
                    if (key != 'addAddress' && value != "") objLineAddress.setValue(key, value);
                }
            }
        } else {
            for (let line = 0; line < intLines; line++) {
                let stLineAddress = transaction.getSublistValue({ sublistId, line, fieldId: 'custpage_ship_to_address_line' });
                log.debug({ title: stLogTitle, details: stLineAddress });

                if (!stLineAddress) continue;

                log.debug({ title: stLogTitle, details: `Setting line ${line}` });
                transaction.setSublistValue({ sublistId, line, fieldId: 'shipaddress', value: stLineAddress });
            }
        }
    }

    const getAddressDetails = (customer) => {
        let objReturnValue = {};
        search.create({
            type: 'customer',
            filters:
                [ 'internalid', search.Operator.ANYOF, customer ],
            columns:
                [
                    search.createColumn({
                        name: 'addresslabel',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'addressinternalid',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'country',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'attention',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'addressee',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'addressphone',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'address1',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'address2',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'city',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'state',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'zipcode',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'address',
                        join: 'Address'
                    }),
                    search.createColumn({
                        name: 'custrecord_pli_add_address_to_cust',
                        join: 'Address'
                    })
                ]
        }).run().each(function(result){
            let stAddressId = result.getValue({
                name: 'addressinternalid',
                join: 'Address'
            });

            objReturnValue[stAddressId] = {};
            objReturnValue[stAddressId].override = false;
            objReturnValue[stAddressId].label = result.getValue({
                name: 'addresslabel',
                join: 'Address'
            });
            objReturnValue[stAddressId].country = result.getValue({
                name: 'country',
                join: 'Address'
            });
            objReturnValue[stAddressId].attention = result.getValue({
                name: 'attention',
                join: 'Address'
            });
            objReturnValue[stAddressId].addressee = result.getValue({
                name: 'addressee',
                join: 'Address'
            });
            objReturnValue[stAddressId].addr1 = result.getValue({
                name: 'address1',
                join: 'Address'
            });
            objReturnValue[stAddressId].addr2 = result.getValue({
                name: 'address2',
                join: 'Address'
            });
            objReturnValue[stAddressId].city = result.getValue({
                name: 'city',
                join: 'Address'
            });
            objReturnValue[stAddressId].state = result.getValue({
                name: 'state',
                join: 'Address'
            });
            objReturnValue[stAddressId].zip = result.getValue({
                name: 'zipcode',
                join: 'Address'
            });
            objReturnValue[stAddressId].addrphone = result.getValue({
                name: 'addressphone',
                join: 'Address'
            });
            objReturnValue[stAddressId].addrtext = result.getValue({
                name: 'address',
                join: 'Address'
            });
            objReturnValue[stAddressId].addAddress = result.getValue({
                name: 'custrecord_pli_add_address_to_cust',
                join: 'Address'
            });

            return true;
        });

        log.debug({ title: 'getAddressDetails', details: objReturnValue });
        return objReturnValue;
    }

    const addAddressToCustomer = (transaction, target) => {
        const stLogTitle = 'addAddressToCustomer';

        let recShipAddress = transaction.getSubrecord({
            fieldId: 'shippingaddress'
        });
        let objAddressDetails = getAddressSubrecord(recShipAddress);
        log.debug({ title: stLogTitle, details: objAddressDetails });

        if (objAddressDetails.custrecord_pli_add_address_to_cust == true) {
            let bhasDuplicate = checkDuplicates({
                address: objAddressDetails,
                customer: target
            });

            if (!bhasDuplicate) {
                const sublistId = 'addressbook';
                let recCustomer = record.load({
                    type: record.Type.CUSTOMER,
                    id: target,
                    isDynamic: true
                });
                recCustomer.selectNewLine({ sublistId });
                recCustomer.setCurrentSublistValue({
                    sublistId, fieldId: 'label', value: objAddressDetails.label
                });
                let subrecAddress = recCustomer.getCurrentSublistSubrecord({
                    sublistId, fieldId: 'addressbookaddress'
                });
                for (const [key, value] of Object.entries(objAddressDetails)) {
                    // if (key != 'addAddress' && value != "") subrecAddress.setValue(key, value);
                    if (value != "") subrecAddress.setValue(key, value);
                }
                recCustomer.commitLine({ sublistId });
                recCustomer.save({ ignoreMandatoryFields: true });
                log.audit({ title: stLogTitle, details: 'Customer address has been added' });
            }
        }
    }

    const addLineAddressToCustomer = (transaction, target) => {
        const stLogTitle = 'addLineAddressToCustomer';

        let recTransaction = record.load({
            type: transaction.type,
            id: transaction.id,
            isDynamic: true
        });
        let recCustomer = record.load({
            type: record.Type.CUSTOMER,
            id: target,
            isDynamic: true
        });

        let intLineCount = transaction.getLineCount({ sublistId: 'item' });
        const sublistId = 'addressbook';
        for (let line=0; line < intLineCount; line++) {
            let stLineAddress = transaction.getSublistValue({ sublistId, line, fieldId: 'custpage_ship_to_address_line' });
            log.debug({ title: stLogTitle, details: `Line Address = ${stLineAddress}` });
            if (stLineAddress) continue;

            let stShipTo = transaction.getSublistValue({
                sublistId: 'item', line, fieldId: 'shipaddress'
            });
            log.debug({ title: stLogTitle, details: `Line = ${line}; Ship To = ${stShipTo}` });

            if (stShipTo != '') {
                recTransaction.selectLine({
                    sublistId: 'item',
                    line: line
                })
                let objShipAddress = recTransaction.getCurrentSublistSubrecord({
                    sublistId: 'item', fieldId: 'shippingaddress'
                });
                let objAddressDetails = getAddressSubrecord(objShipAddress);

                if (objAddressDetails.custrecord_pli_add_address_to_cust == true) {
                    let bHasDuplicates = checkDuplicates({
                        address: objAddressDetails,
                        customer: target
                    });

                    if (!bHasDuplicates) {
                        recCustomer.selectNewLine({ sublistId });
                        recCustomer.setCurrentSublistValue({
                            sublistId, fieldId: 'label', value: objAddressDetails.label
                        });
                        let subrecAddress = recCustomer.getCurrentSublistSubrecord({
                            sublistId, fieldId: 'addressbookaddress'
                        });
                        for (const [key, value] of Object.entries(objAddressDetails)) {
                            // if (key != 'addAddress' && value != "") subrecAddress.setValue(key, value);
                            if (value != "") subrecAddress.setValue(key, value);
                        }
                        recCustomer.commitLine({ sublistId });
                        log.debug({ title: stLogTitle, details: `Line = ${line}; Committed.` });
                    }
                }
            }
        }

        recCustomer.save({ ignoreMandatoryFields: true });
        log.audit({ title: stLogTitle, details: 'Customer address has been added' });
    }

    const getAddressSubrecord = (recShipAddress) => {
        let objReturnValue = {};
        // objReturnValue.override = recShipAddress.getValue({
        //     fieldId: 'override'
        // });
        objReturnValue.override = false;
        objReturnValue.label = recShipAddress.getValue({
            fieldId: 'label'
        });
        objReturnValue.country = recShipAddress.getValue({
            fieldId: 'country'
        });
        objReturnValue.attention = recShipAddress.getValue({
            fieldId: 'attention'
        });
        objReturnValue.addressee = recShipAddress.getValue({
            fieldId: 'addressee'
        });
        objReturnValue.addr1 = recShipAddress.getValue({
            fieldId: 'addr1'
        });
        objReturnValue.addr2 = recShipAddress.getValue({
            fieldId: 'addr2'
        });
        objReturnValue.city = recShipAddress.getValue({
            fieldId: 'city'
        });
        objReturnValue.state = recShipAddress.getValue({
            fieldId: 'state'
        });
        objReturnValue.zip = recShipAddress.getValue({
            fieldId: 'zip'
        });
        objReturnValue.addrphone = recShipAddress.getValue({
            fieldId: 'addrphone'
        });
        objReturnValue.addrtext = recShipAddress.getValue({
            fieldId: 'addrtext'
        });
        objReturnValue.custrecord_pli_add_address_to_cust = recShipAddress.getValue({
            fieldId: 'custrecord_pli_add_address_to_cust'
        });
        log.debug('getAddressSubrecord', objReturnValue);

        return objReturnValue;
    }

    const checkDuplicates = ({ address, customer }) => {
        let bReturnValue = false;
        search.create({
            type: 'customer',
            filters: [
                [ 'internalid', search.Operator.ANYOF, customer ],
                'AND',
                [ 'address.attention', search.Operator.IS, address.attention ],
                'AND',
                [ 'address.addressee', search.Operator.IS, address.addressee ],
                'AND',
                [ 'address.addressphone', search.Operator.IS, address.addrphone ],
                'AND',
                [ 'address.address1', search.Operator.IS, address.addr1 ],
                'AND',
                [ 'address.address2', search.Operator.IS, address.addr2 ],
                'AND',
                [ 'address.zipcode', search.Operator.IS, address.zip ],
                'AND',
                [ 'address.city', search.Operator.IS, address.city ],
                'AND',
                [ 'address.state', search.Operator.ANYOF, address.state ],
                'AND',
                [ 'address.country', search.Operator.ANYOF, address.country ],
                // 'AND',
                // [ 'address.address', search.Operator.IS, address ]
            ],
            columns:
                [
                    search.createColumn({
                        name: 'addressinternalid',
                        join: 'Address'
                    })
                ]
        }).run().each(function(result){
            let stAddressId = result.getValue({
                name: 'addressinternalid',
                join: 'Address'
            });

            bReturnValue = true;
        });

        log.debug({ title: 'checkDuplicates', details: bReturnValue });
        return bReturnValue;
    }

    return {beforeLoad, beforeSubmit, afterSubmit};
});