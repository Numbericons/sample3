/**
 * Copyright (c) 2020, Oracle and/or its affiliates.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ('Confidential Information'). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 *
 * Version          Date          Author               Remarks
 * 1.0              2021/1/20      godfrey.sorita          Initial commit
 **/

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(require=> {
    var search = require('N/search');

    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = (scriptContext) => {
        const stLogTitle = 'onRequest';

        try {
            log.debug({ title: stLogTitle, details: scriptContext.request.parameters });
            let arrAddress = getAddresses(scriptContext.request.parameters.customer);

            scriptContext.response.write({
                output: JSON.stringify(arrAddress)
            });
        } catch (error) {
            log.error({ title: stLogTitle, details: error });
        }
    }

    function getAddresses(stCustomer) {
        let arrAddress = [];

        search.create({
            type: search.Type.CUSTOMER,
            filters: [
                ['internalid', search.Operator.ANYOF, stCustomer]
            ],
            columns: [
                search.createColumn({
                    name: 'addressinternalid',
                    join: 'Address',
                    summary: search.Summary.GROUP,
                }),
                search.createColumn({
                    name: 'addresslabel',
                    join: 'Address',
                    summary: search.Summary.GROUP,
                    sort: search.Sort.ASC
                }),
                search.createColumn({
                    name: 'address',
                    join: 'Address',
                    summary: search.Summary.GROUP,
                })
            ]
        }).run().each(result => {
            let stAddressLabel = result.getValue({ name: 'addresslabel', join: 'Address', summary: search.Summary.GROUP });
            let stAddressId = result.getValue({ name: 'addressinternalid', join: 'Address', summary: search.Summary.GROUP });
            let stAddressContent = result.getValue({ name: 'address', join: 'Address', summary: search.Summary.GROUP });
            arrAddress.push({
                value: stAddressId,
                text: stAddressLabel,
                content: stAddressContent
            });

            return true;
        });

        log.debug({ title: 'getAddresses', details: arrAddress });
        return arrAddress;
    }

    return {onRequest}
});