/**
 * VEL_DDC_PeekabooTRF_LIB.js
 *
 * Scope: Create Sales Order from custom record.
 *
 * Author: Kyra Schaefer
 *
 * @NApiVersion 2.x
 */

define(['N/record', 'N/search', 'N/url', 'N/format'],
    /**
     * @param {record}
     *            record
     * @param {search}
     *            search
     */
    function (record, search, url, format) {

        var DELIV_MTD = '7'; // Email
        var CHAIN_FLAG = '2'; // NonChain
        var CASE_STATUS = '2'; // Awaiting Specimens
        var TURN_STANDARD = '4'; // 3W days
        var TURN_PRO = '2'; // 1W days
        var ITEM_STANDARD = '1530'; // Peekaboo (Standard)
        var ITEM_PRO = '1531'; // Peekaboo (Professional)
        var ITEM_EXP = '1556'; // Peekaboo (Expedited)
        var ITEM_RETAIL = '3188'; // Peekaboo Kit (Retail)
        var SVC_STANDARD = '1528'; // Peekaboo Testing Service
        var SVC_PRO = '1529'; // Peekaboo Testing Services (Professional)
        var SVC_RETAIL = '3318'; // Peekaboo Testing Services Retail
        var DEPARTMENT = '22'; // 1001-Revenue
        var PROD_STANDARD = '60'; // 5700-Gender : 5703-Peekaboo DTC
        var PROD_PRO = '59'; // 5700-Gender : 5702-Peekaboo Pro
        var SAMPLE_TYPE = '2'; // Blood
        var CASE_ROLE = '1'; // Mother

        function createSalesOrder(headerVals, headerFlds, lineVals, lineFlds, item, isZero) {

            // Create Sales Order
            var logTitle = 'createSalesOrder';
            log.debug(logTitle, 'Creating Sales Order');

            // Set Body Fields
            var soRec = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true
            });
            soRec = setSalesOrderFlds(headerVals, headerFlds, lineVals, lineFlds, soRec, true, item, isZero);

            // Save Sales Order
            var soId = soRec.save();

            return soId;

        }


        function setSalesOrderFlds(headerVals, headerFlds, lineVals, lineFlds, soRec, isCreate, item, isZero, line, amazonUpdate) {

            // Set Sales Order Fields
            var logTitle = 'setSalesOrderFlds';
            log.debug(logTitle, 'Setting Sales Order Fields');

            // Get service item and turnaround time based on item
            log.debug(logTitle, 'Item: ' + item);
            var itemLookupObj = itemLookup(item);
            var svcItem = itemLookupObj.svcItem;
            var turnaround = itemLookupObj.turnaround;
            var product = itemLookupObj.product;

            log.debug(logTitle, 'Service Item ID: ' + svcItem);

            if (!svcItem) {
                log.error(logTitle, 'Item Id ' + item + ' is not of type Standard or Professional');
                return;
            }

            // Set Sales Order Header Fields
            if (isCreate) {
                var newHeaderFlds = ['entity', 'custbody_vel_order_source'];
                headerFlds = headerFlds.concat(newHeaderFlds);
            } else if (amazonUpdate) {
                var newHeaderFlds = ['entity', 'custbody_vel_order_source'];
                headerFlds = headerFlds.concat(newHeaderFlds);

            }
            var addHeaderFlds = ['custbody_vel_tp_result_email', 'custbody_vel_case_number',
                'custbody_vel_tp_results_email', 'custbody_vel_tp_full_name', 'custbody_vel_tp_phone', 'custbody_vel_due_date',
                'custbody_vel_res_del_meth_all', 'custbody_vel_chain_flag', 'custbody_vel_case_status', 'custbody_vel_turn_time'];


            var addHeaderVals = [DELIV_MTD, CHAIN_FLAG, CASE_STATUS, turnaround];
            headerFlds = headerFlds.concat(addHeaderFlds);
            headerVals = headerVals.concat(addHeaderVals);

            for (var i in headerFlds) {
                soRec.setValue({
                    fieldId: headerFlds[i],
                    value: headerVals[i],
                });
            }

            // Set Sales Order Line Fields
            setSalesOrderLineFlds(lineVals, lineFlds, soRec, svcItem, product, isZero, line, isCreate);

            return soRec;

        }

        function setSalesOrderLineFlds(lineVals, lineFlds, soRec, svcItem, product, isZero, line, isCreate) {

            // Set Sales Order Line Fields
            var logTitle = 'setSalesOrderLineFlds';
            log.debug(logTitle, 'Setting  Sales Order Line Fields');

            var addLineVals = [SAMPLE_TYPE, CASE_ROLE];
            var addLineFlds = ['custcol_vel_tested_party_name_all', 'custcol_vel_report_sign_out_date_2', 'custcolvel_sample_id_all',
                'custcol_vel_menstrual_date', 'custcol_vel_est_delivery_date', 'custcol_vel_sample_type_all', 'custcol_vel_case_role_all'];
            lineVals = lineVals.concat(addLineVals);
            lineFlds = lineFlds.concat(addLineFlds);

            if (isZero) {
                // If free, add custom price level and zero rate
                var zeroLineVals = ['-1', 0];
                var zeroLineFlds = ['price', 'rate'];
                lineVals = lineVals.concat(zeroLineVals);
                lineFlds = lineFlds.concat(zeroLineFlds);
            }

            if (isCreate) {
                // If create, add item
                var createVals = [svcItem, 1, DEPARTMENT, product];
                var createFlds = ['item', 'quantity', 'department', 'cseg_vel_product', 'class'];

                lineVals = createVals.concat(lineVals);
                lineFlds = createFlds.concat(lineFlds);

                log.debug(logTitle, 'Adding New Line');
                soRec.selectNewLine('item');
            } else {

                // If edit, update line
                log.debug(logTitle, 'Updating Line Index: ' + line);
                soRec.selectLine({
                    sublistId: 'item',
                    line: line
                });
            }

            log.debug("Line Fields", lineFlds);
            log.debug("Line Value", lineVals)
            for (var i in lineFlds) {
                
                var val = lineFlds[i].includes('date') ? format.format({value: lineVals[i], type: format.Type.DATE}) : lineVals[i];

                soRec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: lineFlds[i],
                    value: val
                });
            }

            log.debug(logTitle, 'Saving Line');
            soRec.commitLine('item');
            log.debug('Line Commit', 'Commited Line');
            
            return soRec;

        }

        function itemLookup(item) {

            // Get service item and turnaround time based on item
            var svcItem, turnaround, product;

            if (item == ITEM_STANDARD) {
                svcItem = SVC_STANDARD;
                turnaround = TURN_STANDARD;
                product = PROD_STANDARD;
            } else if (item == ITEM_PRO || item == ITEM_EXP) {
                svcItem = SVC_PRO;
                turnaround = TURN_PRO;
                product = PROD_PRO;
            } else if (item == ITEM_RETAIL) {
                svcItem = SVC_RETAIL;
                turnaround = TURN_STANDARD;
                product = PROD_STANDARD;
            }

            return {
                svcItem: svcItem,
                turnaround: turnaround,
                product: product
            };

        }

        return {
            createSalesOrder: createSalesOrder,
            setSalesOrderFlds: setSalesOrderFlds
        };

    });