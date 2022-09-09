/**
 * Copyright (c) 1998-2018 NetSuite, Inc. 2955 Campus Drive, Suite 100, San
 * Mateo, CA, USA 94403-2511 All Rights Reserved.
 *
 * This software is the confidential and proprietary information of NetSuite,
 * Inc. ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the license
 * agreement you entered into with NetSuite.
 */
/**
 * nts_md_manage_item_master.js
 *
 * @NApiVersion 2.x
 */

define(
    [
        'N/currentRecord',
        'N/runtime',
        'N/search',
        'SuiteScripts/_work/srvc/design_to_build/code/nts_md_manage_price_rule',
        'SuiteScripts/_work/srvc/design_to_build/code/nts_md_loaded_cost',
        'N/ui/dialog'],

    function (currentRecord, runtime, search, nts_md_manage_price_rule,
              nts_md_loaded_cost, dialog) {

        var BASE_PRICE_LEVEL = -1;

        var CALC_METHOD = {
            fixed_price: 1,
            markup: 2,
            markdown: 3,
            tiered_pricing_fixed: 5,
            tiered_pricing: 6,
            tiered_pricing_markup: 7
        };

        var CALC_METHOD_LC = {
            standard_cost: 1,
            average_cost: 2
        };

        var TIER_BASIS = {
            quantity: 1,
            amount: 2,
            weight: 3
        };

        /**
         * This process is used to calculate the line item rate using
         * pricing rules specific to the sales order records customer/item.
         *
         * The process starts when the user adds a line item to a sales
         * order
         *
         * The system performs the following: Queries the price rule records
         * using the following criteria: Customer OR Customer Group AND Item
         * OR Item Category, Price rule type = Contract, Tran date >= Start
         * Date, Tran date <= End Date, Ordered by last modified date
         *
         * If a price rule is returned, the system performs the following:
         * Sets the line item rate using the value returned from one of the
         * following calculation methods specified on the price rule record:
         * Fixed Price, Markup, Markdown, Tiered Quantity. Sets the line
         * items price level to Custom Otherwise, the system performs the
         * following: Queries the price rule records using the following
         * criteria: Customer OR Customer Group AND Item OR Item Category,
         * Price rule type = Best Price, Tran date >= Start Date, Tran date <=
         * End Date, Ordered by price rule record priority If a price rule
         * is returned, the system performs the following: Sets the line
         * item rate using the value returned from one of the following
         * calculation methods specified on the price rule record with the
         * highest priority: Fixed Price, Cost Plus, Margin Plus, List Less,
         * Tiered Quantity. Sets the line items price level to Custom
         *
         * The user saves the sales order record
         *
         * The process ends
         */
        function item_pricing(estimate=null, price_rule, trandate) {

            // var customer_id = estimate.getValue('entity');
            // var trandate = estimate.getText('trandate');
            var item_id = price_rule.getValue({
                name: 'custrecord_nts_pr_item'
            });

            // var loaded_cost = nts_md_loaded_cost
            //     .apply_loaded_costing(estimate);

            // var price_rule = nts_md_manage_price_rule.get_price_rule(
            // customer_id, trandate, item_id);

            if (!isEmpty(price_rule)) {
                var alt_price_rule = nts_md_manage_price_rule
                    .get_alt_price_rule(price_rule.id, trandate);

                if (!isEmpty(alt_price_rule)) {
                    handle_alt_price_rule(alt_price_rule, loaded_cost,
                        estimate, item_id, trandate);
                } else {
                    handle_price_rule(price_rule, loaded_cost, estimate,
                        item_id, trandate);
                }
            } 
            // else {
            //     if (!isEmpty(loaded_cost)) {
            //         estimate.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'costestimaterate',
            //             value: parseFloat(loaded_cost),
            //         });
            //         estimate.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'custcol_nts_lc_costestimaterate',
            //             value: parseFloat(loaded_cost),
            //         });
            //     }
            // }

            return estimate;
        }

        function handle_price_rule(price_rule, loaded_cost, estimate,
                                   item_id, trandate, weight) {

            var calc_method = price_rule.getValue({
                name: 'custrecord_nts_pr_calculation_method'
            });

            var calc_details;

            var flRate = '';

            var price_rule_json = {
                custrecord_nts_pr_adjust_pct: price_rule.getValue({
                    name: 'custrecord_nts_pr_adjust_pct'
                }),
                custrecord_nts_pr_adjust_amt: price_rule.getValue({
                    name: 'custrecord_nts_pr_adjust_amt'
                }),
                custrecord_nts_pr_calculation_basis: price_rule.getValue({
                    name: 'custrecord_nts_pr_calculation_basis'
                }),
                custrecord_nts_pr_tier_basis: price_rule.getValue({
                    name: 'custrecord_nts_pr_tier_basis'
                }),
                id: price_rule.id
            };

            var pricing_basis_json;

            var amount; /*= parseFloat(estimate.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'amount'
            }));*/

            pricing_basis_json = {
                quantity: 1
                // estimate.getCurrentSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'quantity'
                // })
                // amount: estimate.getCurrentSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'amount'
                // })
            }

            if (calc_method == CALC_METHOD.tiered_pricing) {

                pricing_basis_json.weight = weight;
                // estimate
                //     .getCurrentSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'weight'
                //     });

                calc_details = nts_md_manage_price_rule.tiered_pricing(
                    price_rule_json, item_id, loaded_cost, trandate,
                    amount, pricing_basis_json);

                // if (isEmpty(calc_details)
                //     || (JSON.stringify(calc_details) === '{}')) {

                //     estimate.setCurrentSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'price',
                //         value: 1
                //     });
                //     return true;
                // }

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);

            }

            if (calc_method == CALC_METHOD.tiered_pricing_markup) {

                pricing_basis_json.weight = weight;
                
                // estimate
                //     .getCurrentSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'weight'
                //     });

                calc_details = nts_md_manage_price_rule
                    .tiered_pricing_markup(price_rule_json, item_id,
                        loaded_cost, trandate, amount,
                        pricing_basis_json);

                // if (isEmpty(calc_details)
                //     || (JSON.stringify(calc_details) === '{}')) {

                //     estimate.setCurrentSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'price',
                //         value: 1
                //     });
                //     return true;
                // }

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);

            }

            if (calc_method == CALC_METHOD.tiered_pricing_fixed) {

                pricing_basis_json.weight = weight;
                
                // estimate
                //     .getCurrentSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'weight'
                //     });

                calc_details = nts_md_manage_price_rule
                    .tiered_pricing_fixed(price_rule_json, item_id,
                        loaded_cost, trandate, amount,
                        pricing_basis_json);

                // if (isEmpty(calc_details)
                //     || (JSON.stringify(calc_details) === '{}')) {

                //     estimate.setCurrentSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'price',
                //         value: 1
                //     });
                //     return true;
                // }

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);

            }

            if (calc_method == CALC_METHOD.fixed_price) {
                calc_details = nts_md_manage_price_rule.fixed_price(
                    price_rule_json, item_id, loaded_cost, trandate,
                    amount, pricing_basis_json);

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);

            }
            if (calc_method == CALC_METHOD.markup) {
                calc_details = nts_md_manage_price_rule.markup(
                    price_rule_json, item_id, loaded_cost, trandate,
                    amount, pricing_basis_json);

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);
            }
            if (calc_method == CALC_METHOD.markdown) {
                calc_details = nts_md_manage_price_rule.markdown(
                    price_rule_json, item_id, loaded_cost, trandate,
                    amount, pricing_basis_json);

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);
            }

            var org_rate = calc_details.base_rate_in;

            var discount_pct = (1 - (calc_details.price / org_rate)) * 100;

            // estimate.setCurrentSublistValue({
            //     sublistId: 'item',
            //     fieldId: 'rate',
            //     value: parseFloat(calc_details.price)
            // });

            var discount;

            if (discount_pct >= 0) {
                // estimate.setCurrentSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'custcol_nts_discount_percent',
                //     value: parseFloat(discount_pct)
                // });
                discount = parseFloat(discount_pct);
            }

            var price = parseFloat(calc_details.price);

            addUpdateCustPriceList(price_list, price_rule_json, price, discount);

            // if (!isEmpty(loaded_cost)) {
            //     estimate.setCurrentSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'costestimaterate',
            //         value: parseFloat(loaded_cost),
            //     });
            //     estimate.setCurrentSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'custcol_nts_lc_costestimaterate',
            //         value: parseFloat(loaded_cost),
            //     });
            // }
        }

        function addUpdateCustPriceList(price_list, price_rule_json, price, discount) {
            var customerPriceList = record.create({
                type: 'customrecord_vel_customer_pr_rule'
            });

            // customerPriceList.setValue({
            //     fieldId: "custrecord_vel_cust_pl_script_id",
            //     value: 
            // })
            
            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_start_date",
                value: price_rule.getValue({
                    name: 'custrecord_nts_pr_start_date'
                })
            })

            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_end_date",
                value: price_rule.getValue({
                    name: 'custrecord_nts_pr_end_date'
                })
            })

            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_customer",
                value: price_rule.getValue({
                    name: 'custrecord_nts_pr_customer'
                })
            })
            
            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_item",
                value: price_rule.getValue({
                    name: 'custrecord_nts_pr_item'
                })
            })

            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_calc_meth",
                value: price_rule.getValue({
                    name: 'custrecord_nts_pr_calculation_basis'
                })
            })

            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_calc_basis",
                value: price_rule_json.custrecord_nts_pr_calculation_basis
            })
            
            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_adjust_pct",
                value: price_rule_json.custrecord_nts_alt_pr_adjust_pct
            })

            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_adjust_amt",
                value: price_rule_json.custrecord_nts_alt_pr_adjust_amt
            })

            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_tier_basis",
                value: price_rule_json.custrecord_nts_pr_tier_basis
            })
            
            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_quantity",
                value: 1
            })

            customerPriceList.setValue({
                fieldId: "discount_percent",
                value: discount
            })
            
            customerPriceList.setValue({
                fieldId: "custrecord_vel_cust_pl_price",
                value: price
            })
        };

        function handle_alt_price_rule(alt_price_rule, loaded_cost,
                                       estimate, item_id, trandate) {

            var calc_method = alt_price_rule.getValue({
                name: 'custrecord_nts_alt_pr_calculation_method'
            });

            var flRate = '';

            var price_rule_json = {
                custrecord_nts_pr_adjust_pct: alt_price_rule.getValue({
                    name: 'custrecord_nts_alt_pr_adjust_pct'
                }),
                custrecord_nts_pr_adjust_amt: alt_price_rule.getValue({
                    name: 'custrecord_nts_alt_pr_adjust_amt'
                }),
                custrecord_nts_pr_calculation_basis: alt_price_rule
                    .getValue({
                        name: 'custrecord_nts_alt_pr_calculation_basis'
                    }),
                custrecord_nts_pr_tier_basis: alt_price_rule.getValue({
                    name: 'custrecord_nts_alt_pr_tier_basis'
                }),
                id: alt_price_rule.id
            };

            var pricing_basis_json;

            var amount = parseFloat(estimate.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'amount'
            }));

            pricing_basis_json = {
                quantity: estimate.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity'
                }),
                amount: estimate.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'amount'
                })
            };

            if (calc_method == CALC_METHOD.tiered_pricing) {

                pricing_basis_json.weight = estimate
                    .getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'weight'
                    });

                var calc_details = nts_md_manage_price_rule
                    .alt_tiered_pricing(price_rule_json, item_id,
                        loaded_cost, trandate, amount,
                        pricing_basis_json);

                if (isEmpty(calc_details)
                    || (JSON.stringify(calc_details) === '{}')) {

                    estimate.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'price',
                        value: 1
                    });
                    return true;
                }

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);

            }

            if (calc_method == CALC_METHOD.tiered_pricing_fixed) {

                pricing_basis_json.weight = estimate
                    .getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'weight'
                    });

                var calc_details = nts_md_manage_price_rule
                    .alt_tiered_pricing_fixed(price_rule_json, item_id,
                        loaded_cost, trandate, amount,
                        pricing_basis_json);

                if (isEmpty(calc_details)
                    || (JSON.stringify(calc_details) === '{}')) {

                    estimate.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'price',
                        value: 1
                    });
                    return true;
                }

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);

            }

            if (calc_method == CALC_METHOD.fixed_price) {
                calc_details = nts_md_manage_price_rule.fixed_price(
                    price_rule_json, item_id, loaded_cost, trandate,
                    amount, pricing_basis_json);

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);

            }
            if (calc_method == CALC_METHOD.markup) {
                calc_details = nts_md_manage_price_rule.markup(
                    price_rule_json, item_id, loaded_cost, trandate,
                    amount, pricing_basis_json);

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);
            }
            if (calc_method == CALC_METHOD.markdown) {
                calc_details = nts_md_manage_price_rule.markdown(
                    price_rule_json, item_id, loaded_cost, trandate,
                    amount, pricing_basis_json);

                handle_post_price_rule(calc_details, estimate,
                    pricing_basis_json);
            }

            var org_rate = calc_details.base_rate_in;

            var discount_pct = (1 - (calc_details.price / org_rate)) * 100;

            estimate.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: parseFloat(calc_details.price)
            });

            if (discount_pct >= 0) {
                estimate.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_nts_discount_percent',
                    value: parseFloat(discount_pct)
                });
            }

            if (!isEmpty(loaded_cost)) {
                estimate.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'costestimaterate',
                    value: parseFloat(loaded_cost),
                });
                estimate.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_nts_lc_costestimaterate',
                    value: parseFloat(loaded_cost),
                });
            }
        }

        function handle_post_price_rule(calc_details, estimate,
                                        pricing_basis_json) {

            // estimate.setCurrentSublistValue({
            //     sublistId: 'item',
            //     fieldId: 'price',
            //     value: BASE_PRICE_LEVEL
            // });
        }

        function results(objSearch) {
            var results_array = [];
            var page = objSearch.runPaged({
                pageSize: 4000
            });

            for (var i = 0; i < page.pageRanges.length; i++) {
                var pageRange = page.fetch({
                    index: page.pageRanges[i].index
                });
                results_array = results_array.concat(pageRange.data);
            }

            return results_array;
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (
                    v) {
                    for (var k in v) {
                        return false;
                    }
                    return true;
                })(stValue)));
        }

        return {
            item_pricing: item_pricing,
        };

    });
