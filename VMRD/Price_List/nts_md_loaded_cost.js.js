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
 * nts_md_manage_price_rule.js
 * 
 * @NApiVersion 2.x
 */
define(
		[ 'N/record', 'N/runtime', 'N/search' ],

		function(record, runtime, search) {

			var PRICE_RULE_SEARCH = 'customsearch_nts_ss_list_price_rules';

			var CALC_BASIS = {
				base_price : 1,
				average_cost : 2,
				standard_cost : 3
			};

			var TIER_BASIS = {
				quantity : 1,
				amount : 2,
				weight : 3
			};

			var CALC_METHOD = {
				fixed_price : 1,
				markup : 2,
				markdown : 3,
				tiered_pricing_fixed : 5,
				tiered_pricing : 6,
				tiered_pricing_markup : 7
			};

			var CALC_DETAILS = {
				type : '',
				quantity : '',
				percent : '',
				amount : '',
				price : '',
			}

			/**
			 * The system calculates the line item rate as follows: Returns the
			 * fixed price on the price rule record
			 */
			function fixed_price(priceRule, itemId, base_rate_in, trandate,
					amount, pricing_basis_json) {

				var base_rate = base_rate_in;

				var calc_basis = priceRule.custrecord_nts_pr_calculation_basis;

				if (isEmpty(base_rate)) {
					base_rate = get_calc_basis(calc_basis, itemId);
				}

				var calc_details_json = {
					type : 'fixed_price',
					quantity : '',
					price : parseFloat(priceRule.custrecord_nts_pr_adjust_amt),
					percent : '',
					amount : '',
					base_rate_in : base_rate
				};

				return calc_details_json;

			}

			/**
			 * The system calculates the line item rate as follows:Checks if
			 * there is a Adjust % value if so, perform the following: Sets the
			 * Markup value to the Base Price * (1 + the Adjust %) Checks if
			 * there is a Adjust $ value if so, perform the following: Adds the
			 * Adjust $ to the Markup value Returns the Markup value
			 */
			function markup(priceRule, itemId, base_rate_in, trandate, amount,
					pricing_basis_json) {
				var markup_rate = '';
				var base_rate = base_rate_in;

				var calc_basis = priceRule.custrecord_nts_pr_calculation_basis;

				if (isEmpty(base_rate)) {
					base_rate = get_calc_basis(calc_basis, itemId);
				}

				markup_rate = base_rate;

				if ((!isEmpty(priceRule.custrecord_nts_pr_adjust_pct))
						&& (!isNaN(parseFloat(priceRule.custrecord_nts_pr_adjust_pct)))) {
					var markup_pct = parseFloat(priceRule.custrecord_nts_pr_adjust_pct) / 100;
					markup_rate = parseFloat(base_rate)
							* (1 + parseFloat(markup_pct));
				}

				if ((!isEmpty(priceRule.custrecord_nts_pr_adjust_amt))
						&& (!isNaN(priceRule.custrecord_nts_pr_adjust_amt))) {
					markup_rate = parseFloat(markup_rate)
							+ parseFloat(priceRule.custrecord_nts_pr_adjust_amt);
				}

				var calc_details_json = {
					type : 'markup',
					quantity : '',
					price : markup_rate,
					percent : '',
					amount : '',
					base_rate_in : base_rate
				};

				return calc_details_json;
			}

			/**
			 * The system calculates the line item rate as follows:Checks if
			 * there is a Adjust % value if so, perform the following: Sets the
			 * Markdown value to the Base Price * (1 - the Adjust %) Checks if
			 * there is a Adjust $ value if so, perform the following: Subtracts
			 * the Adjust $ to the Markdown value Returns the Markdown value
			 */
			function markdown(priceRule, itemId, base_rate_in, trandate,
					amount, pricing_basis_json) {
				var markdown_rate = '';
				var base_rate = base_rate_in;

				var calc_basis = priceRule.custrecord_nts_pr_calculation_basis;

				if (isEmpty(base_rate)) {
					base_rate = get_calc_basis(calc_basis, itemId);
				}

				markdown_rate = base_rate;

				if ((!isEmpty(priceRule.custrecord_nts_pr_adjust_pct))
						&& (!isNaN(parseFloat(priceRule.custrecord_nts_pr_adjust_pct)))) {
					var markdown_pct = parseFloat(priceRule.custrecord_nts_pr_adjust_pct) / 100;
					markdown_rate = parseFloat(base_rate)
							* (1 - parseFloat(markdown_pct));
				}

				if ((!isEmpty(priceRule.custrecord_nts_pr_adjust_amt))
						&& (!isNaN(priceRule.custrecord_nts_pr_adjust_amt))) {
					markdown_rate = parseFloat(markdown_rate)
							- parseFloat(priceRule.custrecord_nts_pr_adjust_amt);
				}

				var calc_details_json = {
					type : 'markdown',
					quantity : '',
					price : markdown_rate,
					percent : '',
					amount : '',
					base_rate_in : base_rate
				};

				return calc_details_json;
			}

			/**
			 * Queries Price Rule Quantity Tier records using the following:
			 * Price Rule Ordered by starting quantity For each Price Rule
			 * Quantity Tier record, the system performs the following: Checks
			 * if the starting quantity on the quantity tier record is > the
			 * quantity on the line item If so, the system performs the
			 * following: Selects the previous quantity tier record Sets the
			 * Tiered Quantity value to the quantity price on the quantity tier
			 * record Otherwise, the system performs the following: Checks if
			 * the quantity tier record is the last quantity tier record If so,
			 * the system performs the following: Sets the Tiered Quantity value
			 * to the quantity price on the quantity tier record Returns the
			 * Tiered Quantity value
			 */

			function tiered_pricing(price_rule_json, itemId, base_rate_in,
					trandate, amount, pricing_basis_json) {

				var tier_basis = price_rule_json.custrecord_nts_pr_tier_basis;
				var pricing_basis;
				var base_rate = base_rate_in;

				if (tier_basis == TIER_BASIS.quantity) {
					pricing_basis = pricing_basis_json.quantity;
				}
				if (tier_basis == TIER_BASIS.amount) {
					pricing_basis = pricing_basis_json.amount;
				}
				if (tier_basis == TIER_BASIS.weight) {
					pricing_basis = pricing_basis_json.weight;
				}

				var calc_basis = price_rule_json.custrecord_nts_pr_calculation_basis;

				if (isEmpty(base_rate)) {
					base_rate = get_calc_basis(calc_basis, itemId);
				}

				var tiered_details = get_tiered_details(price_rule_json.id);

				var calc_details_json;
				var tier_price;
				var index;

				for (var tier = 0; tier < tiered_details.length; tier++) {

					if (pricing_basis >= tiered_details[tier].tierqty) {

						index = tier;
					}
				}

				if (!isEmpty(index)) {
					calc_details_json = {
						type : 'tiered_pricing',
						quantity : tiered_details[index].tierqty,
						price : tiered_details[index].price,
						percent : parseFloat(tiered_details[index].percent),
						amount : tiered_details[index].amount,
						base_rate_in : base_rate
					};

					tier_price = parseFloat(base_rate);

					if ((!isEmpty(calc_details_json.percent))
							&& (!isNaN(calc_details_json.percent))) {
						var discount = parseFloat(calc_details_json.percent) / 100;
						tier_price = parseFloat(tier_price) * (1 - discount);
					}

					if ((!isEmpty(calc_details_json.amount))
							&& (!isNaN(calc_details_json.amount))) {
						tier_price = parseFloat(tier_price)
								- parseFloat(calc_details_json.amount);
					}

					calc_details_json.price = tier_price;
				}

				return calc_details_json;
			}

			function tiered_pricing_markup(price_rule_json, itemId,
					base_rate_in, trandate, amount, pricing_basis_json) {

				var tier_basis = price_rule_json.custrecord_nts_pr_tier_basis;
				var pricing_basis;
				var base_rate = base_rate_in;

				if (tier_basis == TIER_BASIS.quantity) {
					pricing_basis = pricing_basis_json.quantity;
				}
				if (tier_basis == TIER_BASIS.amount) {
					pricing_basis = pricing_basis_json.amount;
				}
				if (tier_basis == TIER_BASIS.weight) {
					pricing_basis = pricing_basis_json.weight;
				}

				var calc_basis = price_rule_json.custrecord_nts_pr_calculation_basis;

				if (isEmpty(base_rate)) {
					base_rate = get_calc_basis(calc_basis, itemId);
				}

				var tiered_details = get_tiered_details(price_rule_json.id);

				var calc_details_json;
				var tier_price;
				var index;

				for (var tier = 0; tier < tiered_details.length; tier++) {

					if (pricing_basis >= tiered_details[tier].tierqty) {

						index = tier;
					}
				}

				if (!isEmpty(index)) {
					calc_details_json = {
						type : 'tiered_pricing',
						quantity : tiered_details[index].tierqty,
						price : tiered_details[index].price,
						percent : parseFloat(tiered_details[index].percent),
						amount : tiered_details[index].amount,
						base_rate_in : base_rate
					};

					tier_price = parseFloat(base_rate);

					if ((!isEmpty(calc_details_json.percent))
							&& (!isNaN(calc_details_json.percent))) {
						var discount = parseFloat(calc_details_json.percent) / 100;
						tier_price = parseFloat(tier_price) * (1 + discount);
					}

					if ((!isEmpty(calc_details_json.amount))
							&& (!isNaN(calc_details_json.amount))) {
						tier_price = parseFloat(tier_price)
								+ parseFloat(calc_details_json.amount);
					}

					calc_details_json.price = tier_price;
				}

				return calc_details_json;
			}

			function tiered_pricing_fixed(price_rule_json, itemId,
					base_rate_in, trandate, amount, pricing_basis_json) {

				var tier_basis = price_rule_json.custrecord_nts_pr_tier_basis;
				var pricing_basis;
				var base_rate = base_rate_in;

				if (tier_basis == TIER_BASIS.quantity) {
					pricing_basis = pricing_basis_json.quantity;
				}
				if (tier_basis == TIER_BASIS.amount) {
					pricing_basis = pricing_basis_json.amount;
				}
				if (tier_basis == TIER_BASIS.weight) {
					pricing_basis = pricing_basis_json.weight;
				}

				var calc_basis = price_rule_json.custrecord_nts_pr_calculation_basis;

				if (isEmpty(base_rate)) {
					base_rate = get_calc_basis(calc_basis, itemId);
				}

				var tiered_details = get_tiered_details(price_rule_json.id);

				var calc_details_json;
				var tier_price;
				var index;

				for (var tier = 0; tier < tiered_details.length; tier++) {

					if (pricing_basis >= tiered_details[tier].tierqty) {

						index = tier;
					}
				}

				if (!isEmpty(index)) {
					calc_details_json = {
						type : 'tiered_pricing',
						quantity : tiered_details[index].tierqty,
						price : tiered_details[index].price,
						percent : tiered_details[index].percent,
						amount : tiered_details[index].amount,
						base_rate_in : base_rate
					};

					if ((!isEmpty(calc_details_json.amount))
							&& (!isNaN(calc_details_json.amount))) {
						tier_price = parseFloat(calc_details_json.amount);
					}

					calc_details_json.price = tier_price;
				}

				return calc_details_json;
			}

			function get_tiered_details(intPriceRuleId) {

				var tierQtySearchObj = search.create({
					type : "customrecord_nts_price_rule_qty_tier",
					filters : [ [ "custrecord_nts_prqt_price_rule.internalid",
							"anyof", intPriceRuleId ] ],
					columns : [ "name", "internalid",
							"custrecord_nts_prqt_price_rule",
							search.createColumn({
								name : "custrecord_nts_prqt_starting_quantity",
								sort : search.Sort.ASC
							}), 'custrecord_nts_pr_tier_percent',
							'custrecord_nts_pr_tier_amount' ]
				});

				var searchResults = results(tierQtySearchObj)

				var arrTierQty = [];
				for (var i = 0; i < searchResults.length; i++) {

					var objQtyTier = {};
					objQtyTier.internalid = searchResults[i]
							.getValue('internalid');
					objQtyTier.pricerule = searchResults[i]
							.getValue('custrecord_nts_prqt_price_rule');
					objQtyTier.tierqty = searchResults[i]
							.getValue('custrecord_nts_prqt_starting_quantity');
					objQtyTier.percent = searchResults[i]
							.getValue('custrecord_nts_pr_tier_percent');
					objQtyTier.amount = searchResults[i]
							.getValue('custrecord_nts_pr_tier_amount');

					arrTierQty.push(objQtyTier);
				}

				return arrTierQty;
			}

			function alt_tiered_pricing(price_rule_json, itemId, base_rate_in,
					trandate, amount, pricing_basis_json) {

				var tier_basis = price_rule_json.custrecord_nts_pr_tier_basis;
				var pricing_basis;
				var base_rate = base_rate_in;

				if (tier_basis == TIER_BASIS.quantity) {
					pricing_basis = pricing_basis_json.quantity;
				}
				if (tier_basis == TIER_BASIS.amount) {
					pricing_basis = pricing_basis_json.amount;
				}
				if (tier_basis == TIER_BASIS.weight) {
					pricing_basis = pricing_basis_json.weight;
				}

				var calc_basis = price_rule_json.custrecord_nts_pr_calculation_basis;

				if (isEmpty(base_rate)) {
					base_rate = get_calc_basis(calc_basis, itemId);
				}

				var tiered_details = get_alt_tiered_details(price_rule_json.id);

				var calc_details_json;
				var tier_price;
				var index;

				for (var tier = 0; tier < tiered_details.length; tier++) {

					if (pricing_basis >= tiered_details[tier].tierqty) {

						index = tier;
					}
				}

				if (!isEmpty(index)) {
					calc_details_json = {
						type : 'tiered_pricing',
						quantity : tiered_details[index].tierqty,
						price : tiered_details[index].price,
						percent : parseFloat(tiered_details[index].percent),
						amount : tiered_details[index].amount,
						base_rate_in : base_rate
					};

					tier_price = parseFloat(base_rate);

					if ((!isEmpty(calc_details_json.percent))
							&& (!isNaN(calc_details_json.percent))) {
						var discount = parseFloat(calc_details_json.percent) / 100;
						tier_price = parseFloat(tier_price) * (1 - discount);
					}

					if ((!isEmpty(calc_details_json.amount))
							&& (!isNaN(calc_details_json.amount))) {
						tier_price = parseFloat(tier_price)
								- parseFloat(calc_details_json.amount);
					}

					calc_details_json.price = tier_price;
				}

				return calc_details_json;
			}

			function alt_tiered_pricing_fixed(price_rule_json, itemId,
					base_rate_in, trandate, amount, pricing_basis_json) {

				var tier_basis = price_rule_json.custrecord_nts_pr_tier_basis;
				var pricing_basis;
				var base_rate = base_rate_in;

				if (tier_basis == TIER_BASIS.quantity) {
					pricing_basis = pricing_basis_json.quantity;
				}
				if (tier_basis == TIER_BASIS.amount) {
					pricing_basis = pricing_basis_json.amount;
				}
				if (tier_basis == TIER_BASIS.weight) {
					pricing_basis = pricing_basis_json.weight;
				}

				var calc_basis = price_rule_json.custrecord_nts_pr_calculation_basis;

				if (isEmpty(base_rate)) {
					base_rate = get_calc_basis(calc_basis, itemId);
				}

				var tiered_details = get_alt_tiered_details(price_rule_json.id);

				var calc_details_json;
				var tier_price;
				var index;

				for (var tier = 0; tier < tiered_details.length; tier++) {

					if (pricing_basis >= tiered_details[tier].tierqty) {

						index = tier;
					}
				}

				if (!isEmpty(index)) {
					calc_details_json = {
						type : 'tiered_pricing',
						quantity : tiered_details[index].tierqty,
						price : tiered_details[index].price,
						percent : parseFloat(tiered_details[index].percent),
						amount : tiered_details[index].amount,
						base_rate_in : base_rate
					};

					if ((!isEmpty(calc_details_json.amount))
							&& (!isNaN(calc_details_json.amount))) {
						tier_price = parseFloat(calc_details_json.amount);
					}

					calc_details_json.price = tier_price;
				}

				return calc_details_json;
			}

			function get_alt_tiered_details(intPriceRuleId) {

				var tierQtySearchObj = search.create({
					type : "customrecord_nts_alt_price_rule_tier",
					filters : [ [ "custrecord_nts_alt_price_rule.internalid",
							"anyof", intPriceRuleId ] ],
					columns : [ "name", "internalid",
							"custrecord_nts_alt_price_rule",
							search.createColumn({
								name : "custrecord_nts_alt_pr_starting_tier",
								sort : search.Sort.ASC
							}), 'custrecord_nts_alt_pr_tier_percent',
							'custrecord_nts_alt_pr_tier_amount' ]
				});

				var searchResults = results(tierQtySearchObj)

				var arrTierQty = [];
				for (var i = 0; i < searchResults.length; i++) {

					var objQtyTier = {};
					objQtyTier.internalid = searchResults[i]
							.getValue('internalid');
					objQtyTier.pricerule = searchResults[i]
							.getValue('custrecord_nts_alt_price_rule');
					objQtyTier.tierqty = searchResults[i]
							.getValue('custrecord_nts_alt_pr_starting_tier');
					objQtyTier.percent = searchResults[i]
							.getValue('custrecord_nts_alt_pr_tier_percent');
					objQtyTier.amount = searchResults[i]
							.getValue('custrecord_nts_alt_pr_tier_amount');

					arrTierQty.push(objQtyTier);
				}

				return arrTierQty;
			}

			function get_calc_basis(calc_basis, item_id) {
				var base_rate;

				if (calc_basis == CALC_BASIS.base_price) {
					base_rate = get_base_price(item_id);
				}
				if (calc_basis == CALC_BASIS.average_cost) {
					base_rate = get_average_cost(item_id);
				}
				if (calc_basis == CALC_BASIS.standard_cost) {
					base_rate = get_standard_cost(item_id);
				}
				if (calc_basis == CALC_BASIS.last_purchase_price) {
					base_rate = get_last_purchase_price(item_id);
				}

				return base_rate;
			}

			function get_base_price(intItem) {
				var base_price = 0;
				var itemSearchObj = search.create({
					type : "item",
					filters : [ [ "internalid", "anyof", intItem ], "AND",
							[ "pricing.pricelevel", "anyof", "1" ] ],
					columns : [ search.createColumn({
						name : "unitprice",
						join : "pricing"
					}) ]
				});
				var searchObj = itemSearchObj.run().getRange(0, 1);

				if (searchObj.length > 0) {
					base_price = searchObj[0].getValue({
						name : "unitprice",
						join : "pricing"
					}) || 0;
				}
				return base_price;
			}

			function get_last_purchase_price(intItem) {
				var itemSearchObj = search.create({
					type : "item",
					filters : [ [ "internalid", "anyof", intItem ] ],
					columns : [ "lastpurchaseprice" ]
				});
				var searchObj = itemSearchObj.run().getRange(0, 1);

				return searchObj[0].getValue({
					name : 'lastpurchaseprice'
				}) || 0;
			}

			function get_average_cost(intItem) {
				var itemSearchObj = search.create({
					type : "item",
					filters : [ [ "internalid", "anyof", intItem ], "AND",
							[ "pricing.pricelevel", "anyof", "1" ] ],
					columns : [ search.createColumn({
						name : "averagecost"
					}) ]
				});
				var searchObj = itemSearchObj.run().getRange(0, 1);

				return searchObj[0].getValue({
					name : "averagecost",
				}) || 0;
			}

			function get_standard_cost(intItem) {
				var itemSearchObj = search.create({
					type : "item",
					filters : [ [ "internalid", "anyof", intItem ], "AND",
							[ "pricing.pricelevel", "anyof", "1" ] ],
					columns : [ search.createColumn({
						name : "currentstandardcost"
					}) ]
				});
				var searchObj = itemSearchObj.run().getRange(0, 1);

				return searchObj[0].getValue({
					name : "currentstandardcost",
				}) || 0;
			}

			function get_price_rule(intCustomerId, stDate, intItemId) {

				var customerFilter = [ "custrecord_nts_pr_customer", "anyof",
						intCustomerId ];

				var itemFilter = [ "custrecord_nts_pr_item", "anyof", intItemId ];

				var objPriceRuleSearchObj = search.create({
					type : 'customrecord_nts_price_rule',
					filters : [
							[ customerFilter ],
							"AND",
							[ itemFilter ],
							"AND",
							[ "isinactive", "is", "F" ],
							"AND",
							[ "custrecord_nts_pr_start_date", "onorbefore",
									stDate ],
							"AND",
							[
									[ "custrecord_nts_pr_end_date",
											"onorafter", "today" ],
									"OR",
									[ "custrecord_nts_pr_end_date", "isempty",
											"" ] ] ],
					columns : [ "internalid",
							"custrecord_nts_pr_calculation_method",
							"custrecord_nts_pr_calculation_basis",
							"custrecord_nts_pr_customer",
							"custrecord_nts_pr_item",
							"custrecord_nts_pr_end_date",
							"custrecord_nts_pr_start_date",
							"custrecord_nts_pr_adjust_pct",
							"custrecord_nts_pr_adjust_amt",
							'custrecord_nts_pr_tier_basis' ]
				});

				var searchObj = objPriceRuleSearchObj.run().getRange(0, 1);
				var objPriceResult;

				if (searchObj.length > 0) {
					objPriceResult = searchObj[0];
				}

				return objPriceResult;
			}

			function get_alt_price_rule(price_rule_id, effective_date) {
				var search_results;
				var search_result;
				var search_obj = search.create({
					type : "customrecord_nts_alt_price_rule",
					filters : [
							[ "custrecord_nts_alt_pr_price_rule.internalid",
									"anyof", price_rule_id ],
							"AND",
							[ "custrecord_nts_alt_pr_start_date", "onorbefore",
									effective_date ],
							"AND",
							[ "custrecord_nts_alt_pr_end_date", "onorafter",
									effective_date ], "AND",
							[ "isinactive", "is", "F" ] ],
					columns : [ search.createColumn({
						name : "scriptid",
						sort : search.Sort.ASC,
						label : "Script ID"
					}), search.createColumn({
						name : "custrecord_nts_alt_pr_start_date",
						label : "Start Date"
					}), search.createColumn({
						name : "custrecord_nts_alt_pr_end_date",
						label : "End Date"
					}), search.createColumn({
						name : "custrecord_nts_alt_pr_calculation_method",
						label : "Calculation Method"
					}), search.createColumn({
						name : "custrecord_nts_alt_pr_calculation_basis",
						label : "Calculation Basis"
					}), search.createColumn({
						name : "custrecord_nts_alt_pr_adjust_pct",
						label : "Adjust %"
					}), search.createColumn({
						name : "custrecord_nts_alt_pr_adjust_amt",
						label : "Adjust $"
					}), search.createColumn({
						name : "custrecord_nts_alt_pr_tier_basis",
						label : "Tier Basis"
					}) ]
				});

				search_results = results(search_obj);
				if (search_results.length > 0) {
					search_result = search_results[0];
				}

				return search_result;
			}

			function find_price_rule(intCustomerId, intItemId) {

				var customerFilter = [ "custrecord_nts_pr_customer", "anyof",
						intCustomerId ];

				var itemFilter = [ "custrecord_nts_pr_item", "anyof", intItemId ];

				var objPriceRuleSearchObj = search.create({
					type : 'customrecord_nts_price_rule',
					filters : [ [ customerFilter ], "AND", [ itemFilter ],
							"AND", [ "isinactive", "is", "F" ], ],
					columns : [ "internalid",
							"custrecord_nts_pr_calculation_method",
							"custrecord_nts_pr_calculation_basis",
							"custrecord_nts_pr_customer",
							"custrecord_nts_pr_item",
							"custrecord_nts_pr_end_date",
							"custrecord_nts_pr_start_date",
							"custrecord_nts_pr_adjust_pct",
							"custrecord_nts_pr_adjust_amt",
							'custrecord_nts_pr_tier_basis' ]
				});

				var searchObj = objPriceRuleSearchObj.run().getRange(0, 1);
				var objPriceResult;

				if (searchObj.length > 0) {
					objPriceResult = searchObj[0];
				}

				return objPriceResult;
			}

			function isEmpty(stValue) {
				return ((stValue === '' || stValue == null || stValue == undefined)
						|| (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(
						v) {
					for ( var k in v)
						return false;
					return true;
				})(stValue)));
			}

			function results(objSearch) {
				var results_array = [];
				var page = objSearch.runPaged({
					pageSize : 4000
				});

				for (var i = 0; i < page.pageRanges.length; i++) {
					var pageRange = page.fetch({
						index : page.pageRanges[i].index
					});
					results_array = results_array.concat(pageRange.data);
				}

				return results_array;
			}

			return {
				fixed_price : fixed_price,
				markup : markup,
				markdown : markdown,
				tiered_pricing : tiered_pricing,
				tiered_pricing_markup : tiered_pricing_markup,
				tiered_pricing_fixed : tiered_pricing_fixed,
				alt_tiered_pricing : alt_tiered_pricing,
				alt_tiered_pricing_fixed : alt_tiered_pricing_fixed,
				get_price_rule : get_price_rule,
				find_price_rule : find_price_rule,
				get_alt_price_rule : get_alt_price_rule
			};

		});