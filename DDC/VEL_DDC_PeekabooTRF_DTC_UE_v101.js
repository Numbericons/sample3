/**
 * Record Type: DTC Peekaboo Test Request Form
 *
 * Scope: 1) Link Serial Number custom record to the registration form. 2)
 * Create or update Sales Order from custom record.
 *
 * Author: Kyra Schaefer
 *
 * Edits by: Bobby Stevens
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', './VEL_DDC_PeekabooTRF_LIB', 'N/url', 'N/email'],
    /**
     * @param {record}
     *            record
     * @param {search}
     *            search
     */
    function (record, search, library, url, email) {

        // var ORDER_SRC_AMZ = '5'; // Amazon
        var SUBSIDIARY = '9'; // DNA Diagnostics Center, Inc.
        var GEOGRAPHY = '17'; // 701-Total DDC value
        // var CHANNEL_AMZ = '3'; // 03-Amazon

        function searchSerial(serial, trfId, newRec) {

            // Query the Serial Number custom record to link to registration
            var logTitle = 'searchSerial';
            // var resultTrf;
            var soId, itemId, custId, previousId;
            var serialSearchObj = search.create({
                type: "customrecord_vel_kit_serial_number",
                filters: [["formulatext: {custrecord_vel_kit_serial_number}", "is", serial]],
                columns: ["internalid", "custrecord_vel_salesorder_customer", "custrecord_vel_kit_item_id", "custrecord_vel_salesorder_item_sold_on", "custrecord_vel_link_to_dtc_registration",
                    search.createColumn({
                        name: "created",
                        sort: search.Sort.DESC,
                        label: "Date Created"
                    })
                ]
            });
            serialSearchObj.run().each(function (result) {

                // Link the serial number record to the registration
                // form if not a duplicate
                log.audit(logTitle, 'Kit Serial Number Tracking ID: ' + result.id);
                previousId = result.getValue('custrecord_vel_link_to_dtc_registration');
                if (previousId) {
                    // if (!previousId) {
                    //     previousId = false;
                    // }
                    log.audit(logTitle, 'Previous Order: ' + previousId);
                } else {
                    itemId = result.getValue('custrecord_vel_kit_item_id');
                    record.submitFields({
                        type: 'customrecord_vel_kit_serial_number',
                        id: result.id,
                        values: {
                            custrecord_vel_link_to_dtc_registration: trfId
                        }
                    });
                }

                // Link the registration form to the sales order
                // soId = result.getValue('custrecord_vel_salesorder_item_sold_on');
                // // custId = result.getValue('custrecord_vel_salesorder_customer');
                // resultTrf = result.id;
                return false;
            });

            return {
                // soId: soId,
                itemId: itemId,
                // custId: custId,
                // previousId: previousId
                // kitTrackingId: resultTrf,
                previousTrf: previousId
            };

        }

        function searchSalesOrder(serial) {

            var soId;

            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["custbody_vel_case_number", "is", serial],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        "internalid",
                        "tranid",
                        search.createColumn({
                            name: "datecreated",
                            sort: search.Sort.DESC
                        })
                    ]
            });
            salesorderSearchObj.run().each(function (result) {
                soId = result.id;
                return false;
            });

            return soId;

        }

        // function createCustomer(testedPartyName, firstName, lastName, email, newRec) {
        //     // Create new Customer
        //     log.audit("Record Creation", "Creating New Customer...");
        //     var address = newRec.getValue('custrecord_vel_dtc_address');
        //     var zip = newRec.getValue('custrecord_vel_dtc_zip');
        //     var country = newRec.getText('custrecord_vel_country');
        //     var state = newRec.getText('custrecord_vel_state');
        //     var phone = newRec.getText('custrecord_vel_phone_number');
        //     var geography;
        //     if (!country && !state) {
        //         geography = GEOGRAPHY;
        //     } else {
        //         geography = getGeography(country, state);
        //     }
        //     var custVals = [testedPartyName, SUBSIDIARY, geography, CHANNEL_AMZ, email, phone];
        //     var custFlds = ['companyname', 'subsidiary', 'cseg_vel_geography', 'custentity_vel_channel_customer', 'email', 'phone'];
        //     var addrVals = [address, state, zip];
        //     var addrFlds = ['addr1', 'state', 'zip'];
        //
        //     var custRec = record.create({
        //         type: record.Type.CUSTOMER,
        //         isDynamic: true
        //     });
        //     custRec.setValue({
        //         fieldId: "isperson",
        //         value: "T"
        //     });
        //     custRec.setValue({
        //         fieldId: "firstname",
        //         value: firstName
        //     });
        //     custRec.setValue({
        //         fieldId: "lastname",
        //         value: lastName
        //     });
        //
        //     for (var i in custFlds) {
        //         custRec.setValue({
        //             fieldId: custFlds[i],
        //             value: custVals[i]
        //         });
        //     }
        //
        //     // Customer address
        //     custRec.selectNewLine({
        //         sublistId: 'addressbook'
        //     });
        //     var addressSubrecord = custRec.getCurrentSublistSubrecord({
        //         sublistId: 'addressbook',
        //         fieldId: 'addressbookaddress'
        //     });
        //     addressSubrecord.setText({
        //         fieldId: 'country',
        //         value: country
        //     });
        //     for (var j in addrFlds) {
        //         addressSubrecord.setValue({
        //             fieldId: addrFlds[j],
        //             value: addrVals[j]
        //         });
        //     }
        //     custRec.commitLine({
        //         sublistId: 'addressbook'
        //     });
        //
        //     var custId = custRec.save();
        //     return custId;
        // }


        function updateSalesOrder(soId, headerVals, lineVals, item, amazonUpdate) {
            // Identify and update the service line
            var soRec = record.load({
                type: record.Type.SALES_ORDER,
                id: soId,
                isDynamic: true
            });
            var soLines = soRec.getLineCount('item');

            for (var i = 0; i < soLines; i++) {

                // Item Type = Service
                var itemType = soRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemtype',
                    line: i
                });
                if (itemType != 'Service')
                    continue;
                // Update Sales Order
                library.setSalesOrderFlds(headerVals, [], lineVals, [], soRec, false, item, false, i, amazonUpdate);

            }
            log.debug('About to save SO w/ ID: ', soId)
            log.debug('fields: ' + soRec.getFields());
            log.debug('fields: ' + soRec.getSublistFields({
                sublistId: 'item'
            }));
            log.debug('soRec: ' + soRec);

            soRec.save();
        }


        // function getGeography(country, state) {
        //     var geography = GEOGRAPHY;
        //     if (country == 'United States') {
        //         geography = searchGeography(state);
        //
        //     } else {
        //         geography = searchGeography(country);
        //     }
        //
        //     return geography;
        //
        // }

        // function searchGeography(text) {
        //     var geography = GEOGRAPHY;
        //     var geographySearchObj = search.create({
        //         type: "customrecord_cseg_vel_geography",
        //         filters: [["name", "contains", text]],
        //         columns: [search.createColumn({
        //             name: "name",
        //             sort: search.Sort.ASC
        //         }), "scriptid"]
        //     });
        //     geographySearchObj.run().each(function (result) {
        //         geography = result.id;
        //         return false;
        //     });
        //     return geography;
        // }


        // function searchPrevRecords(testedPartyName, testedPartyEmail, sampleId) {
        //
        //
        //     var splitEmail = testedPartyEmail.split("@");
        //     var emailPrefix = splitEmail[0];
        //     var lastName;
        //     var nameSplit = testedPartyName.split(" ");
        //     if (nameSplit.length == 2) {
        //         lastName = nameSplit[1];
        //     } else if (nameSplit.length > 2) {
        //         lastName = nameSplit[nameSplit.length - 1];
        //     } else if (nameSplit.length < 2) {
        //         lastName = nameSplit[0];
        //     } else {
        //         lastName = nameSplit[0];
        //     }
        //     var newCusId = "";
        //     var createCustomer = false;
        //     var createSalesOrder = false;
        //
        //     log.debug("Last name", lastName);
        //     log.debug("emailPrefix", emailPrefix);
        //     //Search for previous customers
        //     var customerSearchObj = search.create({
        //         type: "customer",
        //         filters:
        //             [
        //                 ["entityid", "contains", lastName],
        //                 "AND",
        //                 ["email", "contains", emailPrefix]
        //             ],
        //         columns:
        //             [
        //                 "internalid"
        //             ]
        //     });
        //     var searchResultCount = customerSearchObj.runPaged().count;
        //     log.debug("Customer Count", searchResultCount);
        //     customerSearchObj.run().each(function (result) {
        //         newCusId = result.getValue("internalid");
        //         return true;
        //     });
        //
        //
        //     //If no results found, create customer
        //     if (searchResultCount < 1) {
        //         createCustomer = true;
        //     }
        //
        //
        //     //look for precious sampleId's
        //     var lowerSampleId = sampleId.toLowerCase();
        //     var previousSerialId = 0;
        //     var prevSalesOrderCustomer;
        //     var prevSalesOrderStatus;
        //     var salesorderSearchObj = search.create({
        //         type: "salesorder",
        //         filters:
        //             [
        //                 ["type", "anyof", "SalesOrd"],
        //                 "AND",
        //                 ["formulatext: case when Lower({custbody_vel_case_number}) = '" + lowerSampleId + "' then 'yes' else 'no' end ", "is", "yes"],
        //                 "AND",
        //                 ["mainline", "is", "T"]
        //             ],
        //         columns:
        //             [
        //                 "internalid",
        //                 search.createColumn({name: "formulatext", formula: "{customer.altname}"}),
        //                 "statusref",
        //                 search.createColumn({name: "custentity_vel_channel_customer", join: "customer"})
        //             ]
        //     });
        //
        //     //If amazon is in the or if the channel is amazon, and status in
        //
        //
        //     var salesOrderCount = salesorderSearchObj.runPaged().count;
        //     // var updateAmazonOrder = {};
        //     // updateAmazonOrder.updateOrder = false;
        //     salesorderSearchObj.run().each(function (result) {
        //         previousSerialId = result.getValue("internalid");
        //         prevSalesOrderCustomer = result.getValue({name: "formulatext", formula: "{customer.altname}"});
        //         prevSalesOrderStatus = result.getValue("statusref");
        //         prevCustomerChannel = result.getValue({name: "custentity_vel_channel_customer", join: "customer"});
        //         return true;
        //     });
        //     if (salesOrderCount < 1) {
        //         createSalesOrder = true;
        //     } else {
        //
        //         log.debug("Channel", prevCustomerChannel);
        //         if (prevSalesOrderCustomer.indexOf('amazon') > -1 || prevCustomerChannel == 3 && prevSalesOrderStatus == 'pendingBilling') {
        //             updateAmazonOrder.updateOrder = true;
        //             updateAmazonOrder.salesOrderNumber = previousSerialId;
        //             updateAmazonOrder.salesOrderStatus = prevSalesOrderStatus;
        //             updateAmazonOrder.prevCustChan = prevCustomerChannel;
        //         }
        //         log.audit("Previous Records", "Previous Sales Order Found with ID: " + previousSerialId);
        //     }
        //
        //
        //     log.debug("Amazon Object", updateAmazonOrder)
        //     return {
        //         CustomerCreation: createCustomer,
        //         SalesOrderCreation: createSalesOrder,
        //         customerId: newCusId,
        //         salesOrderId: previousSerialId
        //         // updateSalesOrder: updateAmazonOrder
        //     };
        //
        // }

        // function sendPrevRegEmail(serialNumber, internalid, link) {
        //     var subject = 'Amazon Kit Registration Notification';
        //     var recip = ['jwilhite@dnacenter.com', 'ddougherty@dnacenter.com', 'bstevens@dnacenter.com']
        //     var salesOrderNumber;
        //     try {
        //         var salesLookup = search.lookupFields({
        //             type: search.Type.SALES_ORDER,
        //             id: internalid,
        //             columns: ['tranid']
        //         });
        //         salesOrderNumber = salesLookup.tranid
        //     } catch (err) {
        //         salesOrderNumber = internalid
        //     }
        //     email.send({
        //         author: 443592,
        //         recipients: recip,
        //         subject: subject,
        //         body: '<p>Hi Donna & Jennifer!<br></p><p>An Amazon customer has just registered a kit that has already been asessioned.</p><br> Sales Order:' + salesOrderNumber + ', containing sample: ' + serialNumber.toUpperCase() + ', has been updated with new information',
        //     });
        // }

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

        function afterSubmit(scriptContext) {
            var logTitle = 'afterSubmit';
            var type = scriptContext.type;
            // If trigger type is create or edit
            if (type == scriptContext.UserEventType.CREATE || type == scriptContext.UserEventType.EDIT || type == scriptContext.UserEventType.XEDIT) {
                try {
                    var currentRec = scriptContext.newRecord;
                    var recType = currentRec.type;
                    var trfId = currentRec.id;
                    var newRec = record.load({
                        type: recType,
                        id: trfId
                    });
                    var dtcSo = newRec.getValue('custrecord_vel_dtc_salesorder');
                    var serial = newRec.getValue('custrecord_vel_prod_id');
                    var email = newRec.getValue('custrecord_vel_email_reg');
                    var dob = newRec.getValue('custrecord_vel_dob_reg');
                    var phone = newRec.getValue('custrecord_vel_phone_number');
                    var estDeliveryDate = newRec.getValue('custrecord_vel_tp_delivery_date');
                    var lastMenstrualDate = newRec.getValue('custrecord_vel_tp_menstrual_date');
                    var testedPartyName = newRec.getValue('custrecord_vel_first_name_reg') + ' ' + newRec.getValue('custrecord_vel_last_name_reg');
                    // var firstName = newRec.getValue('custrecord_vel_first_name_reg');
                    // var lastName = newRec.getValue('custrecord_vel_last_name_reg');
                    var headerVals = [email, serial, true, testedPartyName, phone, estDeliveryDate];
                    var lineVals = [testedPartyName, dob, serial, lastMenstrualDate, estDeliveryDate];
                    log.audit(logTitle, 'DTC Peekaboo TRF ID: ' + trfId);

                    // If Sales Order not yet created
                    if (dtcSo) return;

                    // Find sales order with serial
                    var soId = searchSalesOrder(serial);
                    if (!soId) return;

                    // Check for duplicate. If not, link registration to serial
                    var searchSerialObj = searchSerial(serial, trfId);
                    if (searchSerialObj.previousTrf) return;
                    var itemId = searchSerialObj.itemId;

                    // var kitSerialId = searchSerialObj.kitTrackingId;
                    // var custId = searchSerialObj.custId;
                    // log.debug(logTitle, 'Serial Number record values: ' + JSON.stringify(searchSerialObj));


                    // Check if Customer: Channel = Amazon
                    // if (custId && soId && itemId) {
                    //     var newCustId;
                    //     var custLookup = search.lookupFields({
                    //         type: search.Type.CUSTOMER,
                    //         id: custId,
                    //         columns: ['custentity_vel_channel_customer', 'altname']
                    //     });
                    //     log.debug(logTitle, 'Customer lookup Channel: ' + JSON.stringify(custLookup));
                    //     var custChannel = custLookup.custentity_vel_channel_customer[0].value;
                    //     var customerName = custLookup.altname.toLowerCase();
                    //
                    //     log.debug("CustomerName", customerName);
                    //     log.debug("Item ID", itemId);
                    //
                    //     //Check for Amazon Order
                    //     if (customerName.indexOf('amazon') > -1) {
                    //         log.debug("AMAZON", "Amazon Purchase Detected")
                    //         var lowerName = testedPartyName.toLowerCase();
                    //         var lowerSerial = serial.toLowerCase();
                    //         var lowerEmail = email.toLowerCase();
                    //
                    //         //Check if Previos Customer or Sales Order exists
                    //         var checkPrevRecords = searchPrevRecords(lowerName, lowerEmail, lowerSerial);
                    //         if (checkPrevRecords.SalesOrderCreation) {
                    //
                    //             //Create new Customer Record if one does not exists
                    //             if (checkPrevRecords.CustomerCreation) {
                    //
                    //                 log.debug("AMAZON", "No Previous Tparty found. Creating New Customer...")
                    //                 newCustId = createCustomer(testedPartyName, firstName, lastName, email, newRec);
                    //             } else {
                    //                 log.debug("AMAZON", "Previous Tparty Found as Customer. No Need to Create New Customer")
                    //                 newCustId = checkPrevRecords.customerId;
                    //             }
                    //             log.debug("AMAZON", "No Previous Sales Order Found. Creating New Sales Order")
                    //
                    //             //Create new sales order
                    //             var newHeaderVals = [newCustId, ORDER_SRC_AMZ];
                    //             var newLineVals = [CHANNEL_AMZ];
                    //             headerVals = newHeaderVals.concat(headerVals);
                    //             lineVals = newLineVals.concat(lineVals);
                    //             soId = library.createSalesOrder(headerVals, [], lineVals, [], itemId, true);
                    //
                    //             //Set Value of sales order field on current TRF as the new sales order
                    //             newRec.setValue({
                    //                 fieldId: 'custrecord_vel_dtc_salesorder',
                    //                 value: soId
                    //             });
                    //             newRec.save();
                    //         } else { //Previous Sales order exists with sample ID
                    //             if (checkPrevRecords.updateSalesOrder.updateOrder) {//If customer is still Amazon on sales order
                    //                 log.debug("AMAZON", "Previous sales order found as 'Amazon' as the customer..updating previous sales order")
                    //
                    //                 if (checkPrevRecords.CustomerCreation) {
                    //                     log.debug("AMAZON", "No Previous Tparty found. Creating New Customer...")
                    //                     newCustId = createCustomer(testedPartyName, firstName, lastName, email, newRec);
                    //                 } else {
                    //                     log.debug("AMAZON", "Previous Tparty Found as Customer. No Need to Create New Customer")
                    //                     newCustId = checkPrevRecords.customerId;
                    //                 }
                    //                 var newHeaderVals = [newCustId, ORDER_SRC_AMZ];
                    //                 headerVals = newHeaderVals.concat(headerVals);
                    //                 updateSalesOrder(checkPrevRecords.updateSalesOrder.salesOrderNumber, headerVals, lineVals, itemId, true);
                    //                 newRec.setValue({
                    //                     fieldId: 'custrecord_vel_dtc_salesorder',
                    //                     value: checkPrevRecords.updateSalesOrder.salesOrderNumber
                    //                 });
                    //                 var output = url.resolveRecord({
                    //                     recordType: 'salesorder',
                    //                     recordId: checkPrevRecords.updateSalesOrder.salesOrderNumber,
                    //                     isEditMode: false
                    //                 });
                    //                 log.debug("AMAZON", "Previous sales order updated with new information. Sales Order: " + output + " .")
                    //                 newRec.save();
                    //                 sendPrevRegEmail(serial, checkPrevRecords.updateSalesOrder.salesOrderNumber, output)
                    //                 return;
                    //             }
                    //
                    //             //Add Previous TRF Back to Kit serial #
                    //             record.submitFields({
                    //                 type: 'customrecord_vel_kit_serial_number',
                    //                 id: kitSerialId,
                    //                 values: {
                    //                     custrecord_vel_link_to_dtc_registration: trfId
                    //                 }
                    //             });
                    //             newRec.save();
                    //             return;
                    //         }
                    //
                    //     } else {
                    // if (!previousTrf && soId && itemId) {
                    updateSalesOrder(soId, headerVals, lineVals, itemId, null);
                    newRec.setValue({
                        fieldId: 'custrecord_vel_dtc_salesorder',
                        value: soId
                    });
                    newRec.save();
                    // }
                    // }
                } catch
                    (e) {
                    log.error(logTitle, e.message);
                }
            }

        }

        return {
            afterSubmit: afterSubmit
        };
    });
