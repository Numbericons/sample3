// Copyright 2021, All rights reserved, ERP Business Solutions, LLC.
// No part of this file may be copied or used without express, written consent of ERP Business Solutions, LLC.
/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
// This M/R script will update the store location's custom NSPBCS records with forecasting data for NSPBCS reports
// Set to run on schedule in custom record (NSPBCS settings) at every morning at 1 AM PST
// This collection of NSPBCS M/R scripts will be executed in order:
// 1. nsg_NSPBCS_update_stores_MR.js
// 2. nsg_NSPBCS_warehouse_transfers_MR.js
// 3. nsg_NSPBCS_update_warehouses_MR.js



define(['N/runtime' ,'N/record' ,'N/error' ,'N/search' ],

    function(runtime ,record ,error ,search ) {
        var scriptName = "nsg_NSPBCS_update_stores_MR.js -> ";
        var verbose_logging = false;


        //**************************************************************************************************************
        /**
         * 1. Get the settings from the NSPBCS settings custom record
         * 2. Update the timeframe in the settings appropriately
         * 3. Send to MAP the search object to iterate over each NSPBCS item record
         * @return {object} native netsuite search results object
         */
        function getInputData() {
            var funcName = scriptName + "getInputData";


            // get the weeks setting e.g. 12 weeks
            var settings_fields_lookup = search.lookupFields({
                type: 'customrecord_nspbcs_settings',
                id: '1',
                columns: ['custrecord_nspbcs_weeks_history']
            });
            var weeks = settings_fields_lookup["custrecord_nspbcs_weeks_history"]


            // update the dates to be used before starting
            // date range = most recent Sunday - weeks (e.g. 12 weeks) to the following Sunday
            var today = new Date();
            var today_weekday = today.getDay() // 1-7
            log.debug("today", "today="+today+" today_weekday="+today_weekday)


            // most recent previous Sunday
            var sunday = new Date();
            sunday.setDate(today.getDate() - today_weekday );
            log.debug("most recent sunday =", sunday )
            var start_date = new Date()
            start_date.setDate(sunday.getDate() - weeks * 7 );
            log.debug("date range", "start="+start_date+"\n end date ="+sunday)


            // set the new date range
            var id = record.submitFields({
                type: "customrecord_nspbcs_settings",
                id: 1,
                values: {
                    "custrecord_nspbcs_start_date" : start_date,
                    "custrecord_nspbcs_end_date" : sunday
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields : true
                }
            });


            // get the settings data now that we've updated to the appropriate date range
            var settings_fields_lookup = search.lookupFields({
                type: 'customrecord_nspbcs_settings',
                id: '1',
                columns: ['custrecord_nspbcs_start_date', 'custrecord_nspbcs_end_date', 'custrecord_nspbcs_weeks_history']
            });
            var date_starting = settings_fields_lookup["custrecord_nspbcs_start_date"] //"6/13/2021"
            var date_ending = settings_fields_lookup["custrecord_nspbcs_end_date"]
            var weeks = settings_fields_lookup["custrecord_nspbcs_weeks_history"]
            log.audit(funcName, "Process is starting for the past "+weeks+" weeks, date range = "+date_starting+" - "+date_ending );


            // get all the nspbcs_item record with associated item record details
            var customrecord_nspbcs_itemsSearchObj = search.create({
                type: "customrecord_nspbcs_items",
                filters:
                    [
                        ["formulanumeric: case when {custrecord_nspbcs_item_record.inventorylocation} = {custrecord_nspbcs_item_location} then 1 else 0 end","equalto","1"],
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({name: "custrecord_nspbcs_item_record", label: "Item Record"}),
                        search.createColumn({name: "custrecord_nspbcs_item_location", label: "Item Location"}),
                        search.createColumn({name: "custrecord_nspbcs_days_min", label: "Days Min"}),
                        search.createColumn({name: "custrecord_nspbcs_days_max", label: "Days Max"}),
                        search.createColumn({name: "custrecord_nspbcs_qty_min_override", label: "Quantity Min Override"}),
                        search.createColumn({name: "custrecord_nspbcs_qty_max_override", label: "Quantity Max Override"}),
                        search.createColumn({name: "custrecord_nspbcs_display_min", label: "Display Min"}),
                        search.createColumn({name: "custrecord_nspbcs_reorder_multiple", label: "Reorder Multiple"}),
                        search.createColumn({name: "custrecord_nspbcs_daily_avg_forecast", label: "Daily Average Forecast"}),
                        search.createColumn({
                            name: "inventorylocation",
                            join: "CUSTRECORD_NSPBCS_ITEM_RECORD",
                            label: "Inventory Location"
                        }),
                        search.createColumn({
                            name: "locationquantityavailable",
                            join: "CUSTRECORD_NSPBCS_ITEM_RECORD",
                            label: "Location Available"
                        }),
                        search.createColumn({
                            name: "locationquantityonorder",
                            join: "CUSTRECORD_NSPBCS_ITEM_RECORD",
                            label: "Location On Order"
                        }),
                        search.createColumn({
                            name: "locationquantityonhand",
                            join: "CUSTRECORD_NSPBCS_ITEM_RECORD",
                            label: "Location On Hand"
                        }),
                        search.createColumn({
                            name: "custitem_discontinued",
                            join: "CUSTRECORD_NSPBCS_ITEM_RECORD",
                            label: "Discontinued"
                        }),
                        search.createColumn({
                            name: "isinactive",
                            join: "CUSTRECORD_NSPBCS_ITEM_RECORD",
                            label: "Inactive"
                        }),
                        search.createColumn({
                            name: "custitemcus_field_item_strat",
                            join: "CUSTRECORD_NSPBCS_ITEM_RECORD",
                            label: "Item Distribution Strategy"
                        }),
                        search.createColumn({
                            name: "custitem_non_replenishment_cb",
                            join: "CUSTRECORD_NSPBCS_ITEM_RECORD",
                            label: "Non Replenishment"
                        })
                    ]
            });
            var searchResultCount = customrecord_nspbcs_itemsSearchObj.runPaged().count;
            log.debug("customrecord_nspbcs_itemsSearchObj result count",searchResultCount);


            return customrecord_nspbcs_itemsSearchObj;
        }



        //**************************************************************************************************************
        //********************************************** MAP ***********************************************************
        //**************************************************************************************************************
        /**
         * Recieve each nspbcs_item record and add to it the item data &  trx data
         * 1. get settings data and NSPBCS record variables
         * 2. get item at location's quantity on order currently
         * 3. get item at location's quantity sold within date range
         * 4. execute logic to determine how much to purchase ( suggested PO qty ) this week & update NSPBCS record
         * @param context {object} the search object containing all the NSPBCS records we are updating
         * @returns context.write {object?} sends the NSPBCS record id and if successful or not to summarize
         */
        function map(context) {
            var funcName = scriptName + " -- map ";
            var success = "success";


            // get the settings data we updated in Map phase
            var settings_fields_lookup = search.lookupFields({
                type: 'customrecord_nspbcs_settings',
                id: '1',
                columns: ['custrecord_nspbcs_start_date', 'custrecord_nspbcs_end_date', 'custrecord_nspbcs_weeks_history']
            });
            var date_starting = settings_fields_lookup["custrecord_nspbcs_start_date"] //"6/13/2021"
            var date_ending = settings_fields_lookup["custrecord_nspbcs_end_date"]
            var weeks = settings_fields_lookup["custrecord_nspbcs_weeks_history"]


            try {
                var obj = JSON.parse(context.value);


                // get variables from the context (NSPBCS record from search results)
                var nspbcs_rec_id = obj.id; // item record id
                var currDatetime = new Date();
                funcName = funcName + "id:" + nspbcs_rec_id + " time:" + currDatetime.getTime();
                if (verbose_logging){
                    log.debug("map-"+funcName, context );
                    log.debug("map JSON.parse(context.value)", JSON.parse(context.value) )
                }
                var item_rec  = obj.values["custrecord_nspbcs_item_record"].value;
                var item_loc  = obj.values["custrecord_nspbcs_item_location"].value;
                var days_min  = obj.values["custrecord_nspbcs_days_min"];
                var days_max  = obj.values["custrecord_nspbcs_days_max"];
                var qty_min_override  = Number(obj.values["custrecord_nspbcs_qty_min_override"]);
                var qty_max_override  = Number(obj.values["custrecord_nspbcs_qty_max_override"]);
                var display_min  = obj.values["custrecord_nspbcs_display_min"];
                var reorder_multiple  = obj.values["custrecord_nspbcs_reorder_multiple"];
                if (!reorder_multiple){ reorder_multiple = 1 }
                var daily_avg_forecast  = obj.values["custrecord_nspbcs_daily_avg_forecast"];
                var item_avail = obj["values"]["locationquantityavailable.CUSTRECORD_NSPBCS_ITEM_RECORD"]
                var item_on_order = obj["values"]["locationquantityonorder.CUSTRECORD_NSPBCS_ITEM_RECORD"]
                var item_inactive = obj["values"]["isinactive.CUSTRECORD_NSPBCS_ITEM_RECORD"]
                var item_discontinued = obj["values"]["custitem_discontinued.CUSTRECORD_NSPBCS_ITEM_RECORD"]
                var item_nonreplenishment = obj["values"]["custitem_non_replenishment_cb.CUSTRECORD_NSPBCS_ITEM_RECORD"]
                var qty_sold = 0


                // If we have an item then let's figure out the demand planning for it
                if ( item_rec ){
                    if (verbose_logging) {
                        log.debug('Updating Info for - ', JSON.stringify(item_rec));
                    }


                    // Call the functions to get the search results data here ******************************************
                    //**************************************************************************************************
                    item_on_order = getOnOrderQty(item_rec, item_loc);


                    //**************************************************************************************************
                    qty_sold = getQtySoldInDateRange(date_starting, date_ending, item_rec, item_loc);
                    if (!qty_sold){qty_sold=0;}

                    //**************************************************************************************************


                    if (verbose_logging){
                        log.debug("****verbose", "qty_sold="+qty_sold+" item_on_order="+item_on_order+" item_avail="+item_avail+" ")
                        log.debug("transaction results", "item_id="+item_id+" location_sold="+location_sold+" qty_sold="+qty_sold+" nspbcs="+nspbcs_rec_id+" item_avail="+item_avail+" item_on_order="+item_on_order);
                    }



                    // *************************************************************************************************
                    // *    BUSINESS LOGIC BEGINS HERE     *************************************************************
                    // *************************************************************************************************


                    // daily avg forecast = {custrecord_nspbcs_qty_sold_in_date_range}/(e.g. 12 weeks * 7)
                    daily_avg_forecast_calc = qty_sold / (weeks * 7)


                    // custrecord_nspbcs_qty_min = ( Daily Average Forecast)*Min Days )
                    var qty_min = Math.ceil(daily_avg_forecast_calc * days_min)
                    var qty_max = Math.ceil(daily_avg_forecast_calc * days_max)


                    // Override calculated values if we have any override values set (can be 0)
                    if (qty_min_override > -1){ qty_min = qty_min_override;}
                    if (qty_max_override > -1){ qty_max = qty_max_override;}


                    // make sure we dont have null values
                    if (!qty_sold){qty_sold=0;}
                    if (!item_avail){item_avail=0;}
                    if (!item_on_order){item_on_order=0;}
                    if (!daily_avg_forecast_calc){daily_avg_forecast_calc=0;}


                    // current_qty = qty we have available + qty on order to us
                    var current_qty = Number(item_avail) + Number(item_on_order);
                    if (verbose_logging){log.debug("A. verbose", "current_qty="+current_qty+ " daily_avg_forecast_calc="+daily_avg_forecast_calc+ "  qty_max="+qty_max+ " qty_min="+qty_min +" item_avail="+item_avail+" item_on_order="+item_on_order+ " reorder_multiple="+reorder_multiple+" display_min="+display_min+" qty_sold="+qty_sold)}


                    // if current_qty < qty_min then increase it to meet the qty_maxBusiness Logic updated by Robert & Chelsey 10/15/2021
                    //
                    // We need at least the display_min always.
                    // If that's met, then we need at least qty_min, and no more than qty_max
                    //
                    // example:
                    // display min 5, qty min 2, qty max 3
                    // have 1 on hand, suggest order = 4 to meet display min
                    //
                    // qty min = our trigger if it falls below this then we need to meet qty max
                    // display min = always need at least this much
                    // qty max = our number to order up to hit
                    //
                    // NSPBCS RULES
                    // 1. We always want at least the Display Min
                    // 2. If we have our display min then we want to order to get our qty max
                    // 3. qty min is our TRIGGER POINT = falls below our qty min we NEED to Order to get the qty Max
                    // start new logic

                    // STEP 0 - which variable tells us how much we really need
                    var need_this_many;
                    if (current display_qtymin <>= qty_minmax ){
                        if (verbose_logging){log.debug("B. verbose", " is current_qty("+current_qty+") < qty_min("+qty_min+")"+ Boolean(current_qty < qty_min)+",  "  + qty_max +" - "+ item_avail +" - "+ item_on_order +   " is  (qty_max - item_avail- item_on_order )  = "+  (qty_max - item_avail- item_on_order ) )}need_this_many = display_min;
                    }
                    if ( display_min < qty_max ){
                        var orderneed_qtythis_reqmany = (qty_max - item_avail - item_on_order );;
                    }

                    // STEP 1 - need at }least elsethe {display min
                    if (display_min && var( ordercurrent_qty_req = 0
                        < display_min) ) {  //
                    }      order_qty_req = (need_this_many - current_qty  );
                    // In case there is a Display Min, but no Qty}
                    Min:
                        at least order to satisfy the display min             // STEP 2 - if we have a ifdisplay (!qty_min && display_min && ( current_qty < display_min) ){
                    and are less than qty min
                    if (verbose_logging){log.debug("C. verbose", " order_qty_req = display_min("+display_min+") - current_qty("+current_qty+")"   )}display_min && ( current_qty >= display_min) && ( current_qty < qty_min ) ) {  //
                        order_qty_req = display_min(need_this_many - current_qty );
                    }


                    // STEP 3 - if we need at least the displaydon't have a display min and are less than qty min
                    if (order!display_min && ( current_qty_req < displayqty_min ) ) {  //
                        order_qty_req = display_min(need_this_many - current_qty );
                    }

                    // end new business logic update block


                    // no negatives
                    if (order_qty_req < 0){order_qty_req=0}


                    // multiples of reorder qty: rounds up to meet the multiple
                    var delta = order_qty_req % reorder_multiple
                    if (verbose_logging){log.debug("D.verbose", "delta="+delta+  " order_qty_req="+order_qty_req+ "  :  qty_max="+qty_max+ " qty_min="+qty_min +" item_avail="+item_avail+" item_on_order="+item_on_order+ " reorder_multiple="+reorder_multiple)}

                    if ( delta != 0 && order_qty_req != 0 ){
                        var suggest_po_qty = order_qty_req + (reorder_multiple - delta)
                    } else {
                        var suggest_po_qty = order_qty_req
                    }
                    if (suggest_po_qty<0){
                        suggest_po_qty = 0
                    }
                    if (verbose_logging){log.debug("E. verbose", "delta="+delta+ " suggest_po_qty="+suggest_po_qty+ " order_qty_req="+order_qty_req )}


                    // for debugging at this point with specific location
                    if (verbose_logging) {
                        if (item_loc == 23){
                            log.audit("23**** transaction results", "item_id="+item_id+" location_sold="+location_sold+" qty_sold="+qty_sold+" nspbcs="+nspbcs_rec_id+" item_avail="+item_avail+" item_on_order="+item_on_order);
                            log.audit("23**** vars","daily_avg_forecast_calc="+daily_avg_forecast_calc+" order_qty_req="+order_qty_req+" suggest_po_qty="+suggest_po_qty)
                        }
                    }


                    // clean up anything we may have missed/bad data with 0 value & round up order_qty_req
                    if (!qty_sold){qty_sold=0;}
                    if (!item_avail){item_avail=0;}
                    if (!item_on_order){item_on_order=0;}
                    if (!daily_avg_forecast_calc){daily_avg_forecast_calc=0;}
                    if (!order_qty_req){order_qty_req=0;}
                    if (!suggest_po_qty){suggest_po_qty=0;}
                    order_qty_req = Math.ceil(order_qty_req)


                    log.debug("attempting id = "+ nspbcs_rec_id,"trxcount="+transactionSearchObjSearchResultCount+" po count="+purchaseorderSearchObjSearchResultCount+"\n" + "qty_sold="+qty_sold+" item_avail="+item_avail+" item_on_order="+item_on_order+" daily_avg="+daily_avg_forecast_calc+" order_qty_req="+order_qty_req+" suggest_po_qty="+suggest_po_qty);


                    // Finally, submit the fields to the update NSPBCS record
                    var id = record.submitFields({
                        type: "customrecord_nspbcs_items",
                        id: nspbcs_rec_id,
                        values: {
                            "custrecord_nspbcs_item_inactive" : item_inactive,
                            "custrecord_nspbcs_item_discontinued" : item_discontinued,
                            "custrecord_nspbcs_item_nonreplenishment" : item_nonreplenishment,
                            "custrecord_nspbcs_qty_sold_in_date_range" : qty_sold,
                            "custrecord_nspbcs_item_available_loc" : item_avail,
                            "custrecord_nspbcs_on_order" : item_on_order,
                            "custrecord_nspbcs_daily_avg_forecast" : daily_avg_forecast_calc,
                            "custrecord_nspbcs_order_qty_required" : order_qty_req,
                            "custrecord_nspbcs_suggested_po_qty" : suggest_po_qty,
                            "custrecord_nspbcs_reorder_multiple" : reorder_multiple
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields : true
                        }
                    });

                    log.debug("submitted id = "+ nspbcs_rec_id, "qty_sold="+qty_sold+" item_avail="+item_avail+" item_on_order="+item_on_order+" daily_avg="+daily_avg_forecast_calc+" order_qty_req="+ order_qty_req +" suggest_po_qty="+suggest_po_qty+" ")

                }   // end if (item_rec)

            }catch(e) {
                log.error(funcName, "ERR exception: " + e);
            }


            // *************************************************************************************************
            // * END BUSINESS LOGIC, FUNCTIONS BELOW
            // *************************************************************************************************



            /**
             * get the Correct "ON ORDER" qty from the POs:Pending Receipt:
             * @param item_rec {number} id of item record
             * @param item_loc {number} id of location
             * @return {number} item_on_order
             */
            function getOnOrderQty(item_rec, item_loc){
                var purchaseorderSearchObj = search.create({
                    type: "purchaseorder",
                    filters:
                        [
                            ["item.internalid","anyof", item_rec ], // e.g. 20698
                            "AND",
                            ["location.internalid","anyof",item_loc], // e.g. 23
                            "AND",
                            ["type","anyof","PurchOrd"],
                            "AND",
                            ["status","anyof","PurchOrd:B"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "quantity",
                                summary: "SUM",
                                label: "Quantity"
                            })
                        ]
                });
                if (verbose_logging) {
                    var purchaseorderSearchObjSearchResultCount = purchaseorderSearchObj.runPaged().count;
                    log.debug("purchaseorderSearchObj result count", purchaseorderSearchObjSearchResultCount);
                }

                purchaseorderSearchObj.run().each(function(result){
                    item_on_order = result.getValue({
                        name: 'quantity',
                        summary: "SUM"
                    });
                    return true;
                });
                return item_on_order;
            }



            /**
             * Get the trx data over time for the item record at a particular location
             * @param date_starting {string} e.g. "1/1/2021"
             * @param date_ending {string} e.g. "4/1/2021"
             * @param item_rec {number} item record id
             * @param item_loc {number} location id
             * @return qty_sold {number} qty_sold on trx within date range
             */
            function getQtySoldInDateRange(date_starting, date_ending, item_rec, item_loc){
                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters:
                        [
                            ["type","anyof","CashSale","CustInvc","CustCred"],
                            "AND",
                            ["trandate","within", date_starting , date_ending],
                            "AND",
                            ["accounttype","anyof","Income"],
                            "AND",
                            ["posting","is","T"],
                            "AND",
                            ["item.internalid","anyof", item_rec ], // 20698
                            "AND",
                            ["location.internalid","anyof", item_loc] // 23
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "item",
                                summary: "GROUP",
                                label: "Item"
                            }),
                            search.createColumn({
                                name: "location",
                                summary: "GROUP",
                                label: "Location"
                            }),
                            search.createColumn({
                                name: "internalid",
                                join: "location",
                                summary: "GROUP",
                                label: "Internal ID"
                            }),
                            search.createColumn({
                                name: "quantity",
                                summary: "SUM",
                                label: "qty sold in date range"
                            })
                        ]
                });
                if (verbose_logging) {
                    var transactionSearchObjSearchResultCount = transactionSearchObj.runPaged().count;
                    log.debug("transactionSearchObjSearchResultCount result count", transactionSearchObjSearchResultCount);
                }
                transactionSearchObj.run().each(function(result){
                    qty_sold = result.getValue({
                        name: 'quantity',
                        summary: "SUM"
                    });
                    return true;
                });
                return qty_sold;
            }


            context.write(nspbcs_rec_id, success);
        }





        //**************************************************************************************************************
        //* SUMMARIZE
        //**************************************************************************************************************
        function summarize(summary) {
            var funcName = scriptName + " summarize";

            // get the settings data
            var settings_fields_lookup = search.lookupFields({
                type: 'customrecord_nspbcs_settings',
                id: '1',
                columns: ['custrecord_nspbcs_start_date', 'custrecord_nspbcs_end_date', 'custrecord_nspbcs_weeks_history']
            });
            var date_starting = settings_fields_lookup["custrecord_nspbcs_start_date"] // e.g. "6/13/2021"
            var date_ending = settings_fields_lookup["custrecord_nspbcs_end_date"]
            var weeks = settings_fields_lookup["custrecord_nspbcs_weeks_history"]

            log.audit(funcName, "summary for "+weeks+" weeks ("+date_starting+"-"+date_ending+") "+ JSON.stringify(summary) );
        }


        //**************************************************************************************************************
        //**************************************************************************************************************
        return { getInputData: getInputData
            ,map: map
            ,summarize: summarize
        };

    });