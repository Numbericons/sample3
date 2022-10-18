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
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 */
define(function(require) {
    var currentRecord = require('N/currentRecord');
    var https = require('N/https');

    var objRecord, arrAddress;
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        try {
            objRecord = currentRecord.get();
            toggleCustomAddress();
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        try {
            if (scriptContext.fieldId === 'custbody_pli_shipto_end_user') {
                populateCustomAddress();
            } else if (scriptContext.fieldId === 'ismultishipto') {
                toggleCustomAddress();
            }
        } catch (error) {
            console.log(error);
        }
    }

    function populateCustomAddress() {
        var fldHeaderShipTo = objRecord.getField({
            fieldId: 'custpage_ship_to_address'
        });
        fldHeaderShipTo.removeSelectOption({
            value: null,
        });
        if (objRecord.getLineCount({ sublistId: 'item' }) > 0) {
            var fldLineShipTo = objRecord.getSublistField({
                sublistId: 'item',
                fieldId: 'custpage_ship_to_address_line',
                line: 0
            });
            fldLineShipTo.removeSelectOption({
                value: null,
            });
        }

        var stShipTo = objRecord.getValue({ fieldId: 'custbody_pli_shipto_end_user' });
        console.log('stShipTo = ' + stShipTo);

        if (isEmpty(stShipTo)) return;

        var stSuiteletUrl = objRecord.getValue({ fieldId: 'custpage_suitelet_url' });
        console.log(stSuiteletUrl);
        var objResponse = https.get({ url: stSuiteletUrl + '&customer=' + stShipTo });
        console.log(objResponse);

        if (objResponse && objResponse.body !== '[]') {
            arrAddress = JSON.parse(objResponse.body);
            fldHeaderShipTo.insertSelectOption({
                value: '',
                text:  ' - Please Select - '
            });
            arrAddress.forEach(function(address){
                fldHeaderShipTo.insertSelectOption({
                    value: address.value,
                    text: address.text
                });
            });

            if (fldLineShipTo) {
                fldLineShipTo.insertSelectOption({
                    value: '',
                    text:  ' - Please Select - '
                });
                arrAddress.forEach(function(address){
                    fldLineShipTo.insertSelectOption({
                        value: address.value,
                        text: address.text
                    });
                });
            }
        }
    }

    function toggleCustomAddress() {
        var bIsMultiShip = objRecord.getValue({ fieldId: 'ismultishipto' });

        var fldHeaderShipTo = objRecord.getField({
            fieldId: 'custpage_ship_to_address'
        });
        if (bIsMultiShip) {
            fldHeaderShipTo.isDisplay = false;
        } else {
            fldHeaderShipTo.isDisplay = true;
        }
        populateCustomAddress();
    }

    function isEmpty(value) {
        return (value === '' || value === null || value === undefined);
    }

    function saveAndEdit() {
        objRecord.setValue({
            fieldId: 'custpage_action',
            value: 'saveAndEdit'
        });

        document.getElementById('btn_multibutton_submitter').click();
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveAndEdit: saveAndEdit
    };
});