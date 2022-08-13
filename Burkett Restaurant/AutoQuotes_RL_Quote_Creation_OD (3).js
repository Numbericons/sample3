//
// Copyright 2018 Velosio, LLC ALL RIGHTS RESERVED
//

/**
 * @NApiVersion 2.0
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', './vel_lib_SalesTax'],
	/**
	 * @param {record} record
	 * @param {runtime} runtime
	 * @param {search} search
	 */
	function (record, runtime, search, salestaxlib) {

		// Sandbox Script URL: https://system.sandbox.netsuite.com/app/common/scripting/script.nl?id=492
		// Production Script URL: https://system.na2.netsuite.com/app/common/scripting/script.nl?id=624
		// 
		// Sales Order List menu path: Transactions > Sales > Enter Sales Order > List
		//
		// parameters:
		// Default vendor to use on item creation if mfg does not have a vendor specified: custscript_soc1_ue_so_default_vendor


		/**
		 * Function called upon sending a GET request to the RESTlet.
		 *
		 * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
		 * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
		 * @since 2015.1
		 */
		function doGet(requestParams) {

		}

		/**
		 * Function called upon sending a PUT request to the RESTlet.
		 *
		 * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
		 * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
		 * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
		 * @since 2015.2
		 */
		function doPut(request) {

			try {
				log.debug({
					title: 'Data sent in',
					details: request
				});

				// retrieve our customers.
				//data = retrieveCustomers(request.StartingId);
				ProcessProjects(request);
			}
			catch (e) {

				if (e instanceof nlobjError) {
					request.excp = JSON.parse(e);
				}
				else {
					//throw e;
					log.debug({
						title: 'excp',
						details: e + ' ' + e.stack
					});

					request.excp = e;
				}
			}
			finally {

				var scriptObj = runtime.getCurrentScript();
				log.debug({
					title: "Remaining governance units: ",
					details: scriptObj.getRemainingUsage()
				});
				request.UsageRemaining = scriptObj.getRemainingUsage();
			}


			//request.data = data;

			return request;
		}
		function ProcessProjects(request) {

			var projects = request.projects;
			var ProjectCount = projects.length;


			//log.debug({
			//	title: 'Project',
			//	details: projects
			//});

			for (var i = 0; i < ProjectCount; i++) {
				var projectData = projects[i];
				ProcessProject(projectData);
			}


		}

		function ProcessProject(projectData) {

			var projectId = projectData.ProjectId;
			var projectName = projectData.ProjectName;
			var projectCreateDate = projectData.CreateDate;
			//var CustomerID = projectData.Totals.CustomerId;

			var salesRepFirstName = null;
			var salesRepLastName = null;
			if (projectData.SalesRepAddress != null) {
				salesRepFirstName = projectData.SalesRepAddress.FirstName;
				salesRepLastName = projectData.SalesRepAddress.LastName;
			}
			var salesRepName = findSalesRep(salesRepFirstName, salesRepLastName);

			// declare a customer object
			var customer = {
				entityid: '',
				customerid: 0,
				companyname: '',
				memo: '',
				phone: '',
				leadsource: '',
				email: '',
				category: '',
				salesrep: salesRepName
			};



			findCustomer(projectName, customer, salesRepName, projectData);
			log.debug({
				title: 'Found customer',
				details: customer
			});

			var isTaxable = salestaxlib.isCustomerTaxable(customer.customerid);
			log.debug({
				title: 'Is Taxable',
				details: isTaxable
			});


			//Iterating thru all the Items to make sure they all exist in NS, if not create them

			// declare a flag that we'll use so we know if all the items in the project item array exist.
			var doAllItemsExist = true;

			//log.debug({
			//	title: 'Items exist',
			//	details: 'Make sure all the items passed in exist'
			//});

			var dtStart;

			dtStart = Date();
			log.debug({
				title: 'Ensuring Line Items Exist',
				details: 'Line item count: ' + projectData.LineItems.length + ', time: ' + dtStart
			});

			for (lineidx = 0; lineidx < projectData.LineItems.length; lineidx++) {
				var lineItem = projectData.LineItems[lineidx];

				log.debug({
					title: 'Calling EnsureItemExists()',
					details: lineItem
				});

				//log.debug({
				//	title: 'Calling EnsureItemExists()',
				//	details: 'line idx: ' + lineidx + ', model: ' + lineItem.Model
				//});

				// make sure the line item exists. If not create it. If the item could not be created, function returns false.
				var doesItemExist = EnsureItemExists(lineItem);
				if (!doesItemExist) {
					// this particular item does not exist and could not be created. 
					// set flag so we know not to create the sales order / opportunity
					doAllItemsExist = false;
				}
			}
			//log.debug({
			//	title: 'Call to Ensuring Line Items Exist complete',
			//	details: projectData.LineItems
			//});

			//Create search to pull results of Opportunities to see if it exists



			// ------------------------------------------------------------------------------
			//
			//
			// If we get here, we need to create the Sales Order Record
			// Everytime they click the JSON Export button in AQ it will create the Sales Order
			//
			//
			// ------------------------------------------------------------------------------
			var newSalesOrder = null;

			if (projectData.AppendToExisting && projectData.InternalId_NS > 0) {
				dtStart = Date();
				log.debug({
					title: 'Loading an existing order',
					details: 'Time: ' + dtStart
				});

				// flag is set to TRUE, we want to append these line items to the existing project.
				// load the record
				newSalesOrder = record.load({
					type: record.Type.SALES_ORDER,
					id: projectData.InternalId_NS,
					isDynamic: true
				});
			}
			else {
				dtStart = Date();
				log.debug({
					title: 'Create a new sales order',
					details: 'Time: ' + dtStart
				});
				// create a new sales order
				var newSalesOrder = record.create({
					//
					type: record.Type.SALES_ORDER,
					isDynamic: true

				});

				log.debug({
					title: 'sales order cust ',
					details: customer.entityid
				});
				newSalesOrder.setText('entity', customer.entityid);
				//var todaysDate = today.getDate();
				//newSalesOrder.setText('trandate', todaysDate);//projectCreateDate);
				//newSalesOrder.setValue('externalid', projectId);
				newSalesOrder.setValue('custbody_soc1_aq_project_info', 'The projectID for this Project in Autoquotes is: ' + projectId);
				newSalesOrder.setValue('title', projectName);
				newSalesOrder.setText('salesrep', salesRepName);

				// get the freight totals
				var freightTotal = 0;
				if (projectData.Totals != null) {
					for (var idx = 0; idx < projectData.Totals.length; idx++) {
						freightTotal += projectData.Totals[idx].FreightSell;
					}
				}
				newSalesOrder.setValue('shippingcost', freightTotal);
				//		newOpportunity.setValue
				//		newOpportunity.setValue
				//		newOpportunity.setValue
				//		newOpportunity.setValue
			}


			log.debug({
				title: 'line item count in project',
				details: projectData.LineItems.length
			});

			//if (projectData.CalculatedTotal) {
			//	log.debug({
			//		title: 'calculated subtotal',
			//		details: projectData.CalculatedTotal
			//	});
			//}

			dtStart = Date();
			log.debug({
				title: 'Adding Line Items',
				details: 'Line item count: ' + projectData.LineItems.length + ', time: ' + dtStart
			});


			// iterate through each of the line items in the project
			for (var idx = 0; idx < projectData.LineItems.length; idx++) {

				var lineItem = projectData.LineItems[idx];
				// no line item? skip to next
				if (!lineItem) continue;

				log.debug({
					title: 'line idx',
					details: 'index: ' + idx + ', item: ' + lineItem.Model
				});


				//NEED TO COMPLETELY REPLACE ALL DATA IN THE ITEMS
				var itemSublist = newSalesOrder.getSublist({
					sublistId: 'item'
				});


				//THIS IS IF THE RECORD IS IN DYNAMIC MODE
				newSalesOrder.selectNewLine({
					sublistId: 'item'
				});

				//log.debug({
				//	title: 'item on line',
				//	details: lineItem.Model
				//});

				//// set the item 
				//newSalesOrder.setCurrentSublistText({
				//	sublistId: 'item',
				//	fieldId: 'item',
				//	text: lineItem.Model,
				//	ignoreFieldChange: true	//NEED TO EITHER SET THIS BASED ON THE NEW ITEM CREATED OR THE ONE SENT FROM AQ
				//});
				// set the item 
				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'item',
					value: lineItem.internalID,
					ignoreFieldChange: true	//NEED TO EITHER SET THIS BASED ON THE NEW ITEM CREATED OR THE ONE SENT FROM AQ
				});

				log.debug({
					title: 'Adding item to Sales Order',
					details: 'Idx: ' + idx + ', item: ' + lineItem.Model + ', internal id: ' + lineItem.internalID + ', Unit Name: ' + lineItem.UnitName
				});


				// get the item value.
				var newitem = newSalesOrder.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'item'
					//value: itemModel//NEED TO EITHER SET THIS BASED ON THE NEW ITEM CREATED OR THE ONE SENT FROM AQ
				});

				//                log.debug({
				//                	title: 'item on line',
				//                	details : lineItem.Model
				//                });

				// set the Quantity
				newSalesOrder.setCurrentSublistText({
					sublistId: 'item',
					fieldId: 'quantity',
					text: String(lineItem.Quantity)
				});

				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_soc1_itemdescription',
					value: lineItem.Spec
				});

				// set the Price Level
				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'price',
					value: '-1'
				});

				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_soc1_aq_freight_net',
					value: String(lineItem.FreightNet)
				});



				// 9-22-2017, #436- set the 'units' field
				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'units',
					value: lineItem.saleunit
				});

				log.debug({
					title: 'units',
					details: lineItem.saleunit
				});



				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_soc1_aq_installation_net',
					value: String(lineItem.InstallationNet)
				});

				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_soc1_item_freight_sell',
					value: String(lineItem.FreightSell)
				});

				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_soc1_aq_item_install_sell',
					value: String(lineItem.InstallationSell)
				});

				// 7-19-2019, MSambhu, set burkett increment per Joe.
				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_burkett_increment',
					value: lineItem.burkett_increment
				});
				// 1/3/2021, Joe Reetz, set burkett Serial per Joe.
				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_burkett_serial_item',
					value: lineItem.burkett_Serial
				});

				log.debug({
				title: 'Serial Line Item',
				details: lineItem.burkett_Serial
				});
				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_soc1_item_food_service_exempt',
					//value: true
					value: (lineItem.CategoryOHF ? true : false)
				});

				// build the AQ Line number
				var aqLineNum = String(lineItem.LineIdx) + '.' + String(lineItem.SublineIdx);


				// set the Unit Price
				var unitPrice;
				unitPrice = lineItem.SellPrice;
				unitPrice = unitPrice.toFixed(2);	// 9-22-2017, MSambhu - round to 2 decimal places
				log.debug({
					title: 'Unit Price',
					details: 'Unit price: ' + unitPrice + ', AQ Line: ' + aqLineNum
				});

				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'rate',
					value: unitPrice
				});


				unitPrice = lineItem.NetPrice;	// per Matt McCans, send this to 'Expected Cost'
				newSalesOrder.setCurrentSublistText({
					sublistId: 'item',
					fieldId: 'custcol2',
					//fieldId: 'costestimate',
					//fieldId: 'costestimaterate',
					text: String(unitPrice)
				});


				// 9-22-2017, MSambhu- #437
				// set the cost estimate type
				newSalesOrder.setCurrentSublistText({
					sublistId: 'item',
					fieldId: 'costestimatetype',
					text: lineItem.costestimatetype
				});

				//AutoQuotes import rejected it based on text, updated to be a value TD 4-25-18
				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'location',
					value: 1
				});

				// set the tax code for non taxable, for now.
			//JR	var taxcode = -8;
				var taxcode = 503004;
				
				// set the tax schedule for the item
				log.debug({
					title: 'Item Tax Schedule',
					details: lineItem.taxschedule
				});

				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'taxcode',
					value: taxcode
				});
				//newSalesOrder.setCurrentSublistText({
				//	sublistId: 'item',
				//	fieldId: 'taxcode',
				//	text: '-Non Taxable-'
				//});


				newSalesOrder.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol4',
					value: aqLineNum
				});




				{
					// do the PO Vendor thing- #412
					// 9-22-2017- MSambhu, per Matt McCanns, always set the 'povendor' field.
					//		Set the 'createpo' field based on the status of the 'isdropship' & 'isspecialorderitem' flags.
					//		If both flags are false, set to be an empty string.

					if (lineItem.vendor) {
						newSalesOrder.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'povendor',
							value: lineItem.vendor
						});
					}
					else {
						newSalesOrder.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'povendor',
							value: ''
						});
					}

					// if item has the 'isdropshipitem' field set to true,
					// set the 'createpo' field on the line to be 'Drop Shipment'.
					// if the item has the 'isspecialorderitem' field set to true,
					// set the 'createpo' field on the line to be 'Special Order'
					if (lineItem.isdropshipitem) {
						log.debug({
							title: 'Drop ship item',
							details: 'Drop ship item'
						});

						newSalesOrder.setCurrentSublistText({
							sublistId: 'item',
							fieldId: 'createpo',
							text: 'Drop Shipment'
						});
					}
					else if (lineItem.isspecialorderitem) {
						log.debug({
							title: 'Special order item',
							details: 'Special order item'
						});

						newSalesOrder.setCurrentSublistText({
							sublistId: 'item',
							fieldId: 'createpo',
							text: 'Special Order'
						});
					}
					else {
						//log.debug({
						//	title: 'Not Drop Ship or Special order item',
						//	details: 'Not Drop Ship or Special order item'
						//});

						newSalesOrder.setCurrentSublistText({
							sublistId: 'item',
							fieldId: 'createpo',
							text: ''
						});
					}

					// if either are true, set the 'povendor' column to be the value from the 'vendor' list where the 'ispreferred' flag is true.


				}


				// set the GSA items on the line item			
				{
					// set the tax schedule for the item
					log.debug({
						title: 'GSA Field Values',
						details: {
							'gsa_listed': lineItem.gsa_listed,
							'gsa_sin': lineItem.gsa_sin,
							'procurementmethod': lineItem.procurementmethod,
							'itemcondition': lineItem.itemcondition
						}
					});


					// GSA Listed
					newSalesOrder.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_burkett_itmcol_gsa_listed',
						value: lineItem.gsa_listed
					});

					// GSA SIN
					newSalesOrder.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_burkett_itemcol_gsa_sin',
						value: lineItem.gsa_sin
					});

					// Procurment Method
					newSalesOrder.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcolburkett_procurement_method_ord',
						value: lineItem.procurementmethod
					});

					// Item Condition
					newSalesOrder.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_vel_itemcon',
						value: lineItem.itemcondition
					});



					// Planned Margin
					if (lineItem.plannedmargin != null) {
						newSalesOrder.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_burkett_planned_margin',
							value: parseFloat(lineItem.plannedmargin)
						});
					}
				}


				//                log.debug({
				//                	title: 'aq line',
				//                	details: lineIdx + SublineIdx
				//                });
				newSalesOrder.commitLine({
					sublistId: 'item'
				});
			}



			dtStart = Date();
			log.debug({
				title: 'About to save sales order',
				details: dtStart
			});

			//newSalesOrder.save();
			var SalesOrderInternalId = newSalesOrder.save();


			dtStart = Date();
			log.debug({
				title: 'Sales Order Saved',
				details: 'Sales Order ID: ' + SalesOrderInternalId + ', time: ' + dtStart
			});

			projectData.InternalId_NS = SalesOrderInternalId;
		}



		function EnsureItemExists(lineItem) {

			var doesItemExist = false;

			log.debug({
				title: 'item search',
				details: lineItem.Model
			});

			// replace the '<' & '>' characters for the search.
			var itemModelSearch = lineItem.Model.replace('<', '&lt;').replace('>', '&gt;');

			//Need to see if the Item On the Quote Exists.
			var itemSearch = search.create({
				type: search.Type.ITEM,//'ITEM',	//Item Saved Search,
				filters: [
					search.createFilter({
						name: 'itemid',
						operator: search.Operator.IS,
						values: itemModelSearch
					})],
				columns: [
					search.createColumn({ name: 'internalid' }),
					search.createColumn({ name: 'type' }),
					search.createColumn({ name: 'itemid' }),
					search.createColumn({ name: 'displayname' }),
					search.createColumn({ name: 'vendorname' }),
					search.createColumn({ name: 'isinactive' }),
					search.createColumn({ name: 'isdropshipitem' }),
					search.createColumn({ name: 'isspecialorderitem' }),
					search.createColumn({ name: 'saleunit' }),
					search.createColumn({ name: 'costestimatetype' }),
					search.createColumn({ name: 'custitem_soc1_food_serv_exemption' }),
					search.createColumn({ name: 'custitem_burkett_increment' }),
					search.createColumn({ name: 'custitem_burkett_serial_item' }),
					search.createColumn({ name: 'custitem_burkett_itm_gsa_listed' }),
					search.createColumn({ name: 'custitem_burkett_item_gsa_sin' }),
					search.createColumn({ name: 'custitem_procurementmethod' }),
					search.createColumn({ name: 'custitem_magentoitemcondition' }),
					search.createColumn({ name: 'custitem_burkett_planned_margin' })

				]
			});

			var itemSearchRange = itemSearch.run().getRange({
				start: 0,
				end: 10
			});

			var itemCount = itemSearchRange.length;

			//log.debug({
			//	title: 'item Count: ',
			//	details: itemCount
			//});

			//Create Item if doesn't exist and item model is not blank
			if (itemCount === 0) {

				// Item NOT found, need to create it.

				log.debug({
					title: 'item NOT found',
					details: lineItem.Model
				});

				// ------------------------------------------------------------------------------
				//
				//
				// If we get here, there is no Item created for this Project.
				// 
				//
				//
				// ------------------------------------------------------------------------------

				var CategoryOHF = false;
				var categoryInternalID = null;
				var CategorySerialized = false;
				var CategoryAvaTaxCode = '';
				var CategoryItemCommonality = '';
				var CategoryItemCategory = '';
				var CategoryItemCommodity = '';

				if (!lineItem.Category) {
					log.debug({
						title: 'Category search',
						details: 'Item category is blank'
					});

					CategorySerialized = false;
					CategoryOHF = false;
				}
				else {

					log.debug({
						title: 'category search',
						details: lineItem.Category
					});

					var aqCategorySearch = search.create({
						type: 'customrecord_soc1_aq_category_listing',	//'CUSTOMRECORD_SOC1_AQ_MFG_LIST',
						filters: [
							search.createFilter({
								name: 'custrecord_soc1_aq_category',
								operator: search.Operator.IS,
								values: lineItem.Category
							})],
						columns: [
							search.createColumn({ name: 'internalid' }),
							search.createColumn({ name: 'custrecord_soc1_aq_category' }),
							search.createColumn({ name: 'custrecord_soc1_category_serialization' }),
							search.createColumn({ name: 'custrecord_soc1_category_ohf' }),

							// 6-27-2019, MSambhu, added
							search.createColumn({ name: 'custrecord_soc1_item_commonality' }),	// item commonality
							search.createColumn({ name: 'custrecord_soc1_item_category' }),	// item category
							search.createColumn({ name: 'custrecord_soc1_item_commodity' }),	// item commodity
							search.createColumn({ name: 'custrecord_burkett_category_ava_tax' })	// AVA Tax code
						]
					});


					// perform the search
					var CategorySearchRange = aqCategorySearch.run().getRange({
						start: 0,
						end: 10
					});

					// get the number of results- should only be 0 or 1 items returned.
					var CategorySearchCount = CategorySearchRange.length;

					if (CategorySearchCount > 0) {
						log.debug({
							title: 'Category search',
							details: 'found record'
						});

						var CategoryResult = CategorySearchRange[0];

						// get some values from the mfg search result
						categoryInternalID = CategoryResult.getValue({ name: 'internalid' });
						CategoryOHF = CategoryResult.getValue({ name: 'custrecord_soc1_category_ohf' });
						CategorySerialized = CategoryResult.getValue({ name: 'custrecord_soc1_category_serialization' });

						// 6-27-2019, MSambhu, added
						CategoryAvaTaxCode = CategoryResult.getValue({ name: 'custrecord_burkett_category_ava_tax' });
						CategoryItemCommonality = CategoryResult.getValue({ name: 'custrecord_soc1_item_commonality' });
						CategoryItemCategory = CategoryResult.getValue({ name: 'custrecord_soc1_item_category' });
						CategoryItemCommodity = CategoryResult.getValue({ name: 'custrecord_soc1_item_commodity' });

						log.debug({
							title: 'AVA Code',
							details: CategoryAvaTaxCode
						});
					}
					else if (CategorySearchCount === 0) {
						log.debug({
							title: 'Category search',
							details: 'category record not found'
						});

						CategorySerialized = false;
					}
				}

				log.debug({
					title: 'mfg search',
					details: lineItem.MfgInternalID
				});

				// create a search to get the manufacturer tied to the item
				// Need to find if the Manufacturer is Serialized so we can decide whether to make Item Serialized
				var mfgSearch = search.create({
					type: 'customrecord_soc1_aq_mfg_list',	//'CUSTOMRECORD_SOC1_AQ_MFG_LIST',
					filters: [
						search.createFilter({
							name: 'internalid',
							operator: search.Operator.ANYOF,
							values: lineItem.MfgInternalID
						})],
					columns: [
						search.createColumn({ name: 'internalid' }),
						search.createColumn({ name: 'custrecord_soc1_aq_mfg_id' }),
						search.createColumn({ name: 'custrecord_soc1_aq_mfg_number' }),
						search.createColumn({ name: 'custrecord_soc1_aq_mr_mfg_name' }),
						search.createColumn({ name: 'custrecord_soc1_aq_mfg_nickname' }),
						search.createColumn({ name: 'custrecord_soc1_aq_mfg_shortname' }),
						search.createColumn({ name: 'custrecord_soc1_aq_mfg_number' }),
						search.createColumn({ name: 'custrecord_soc1_mfg_ven_ref' }),
						search.createColumn({ name: 'custrecord_soc1_mfg_serialized' }),
						search.createColumn({ name: 'custrecord_soc1_aq_mfg_item_prefix' }),
						search.createColumn({ name: 'custrecord_soc1_aq_mfg_process_flag' })
					]
				});


				// perform the search
				var mfgSearchRange = mfgSearch.run().getRange({
					start: 0,
					end: 10
				});

				// get the number of results- should only be 0 or 1 items returned.
				var mfgSearchCount = mfgSearchRange.length;

				var mfgVendorReference = null;

				if (mfgSearchCount > 0) {
					// we found a record, get the 1st item from the search            	
					var result = mfgSearchRange[0];

					// get some values from the mfg search result
					var internalID = result.getValue({ name: 'internalid' });
					mfgVendorReference = result.getValue({ name: 'custrecord_soc1_mfg_ven_ref' });
					var mfgProcessed = result.getValue({ name: 'custrecord_soc1_aq_mfg_process_flag' });
					var mfgSerialized = result.getValue({ name: 'custrecord_soc1_mfg_serialized' });

					//TD added as per David request 4-25-18
					var mfgName = result.getValue({ name: 'custrecord_soc1_aq_mr_mfg_name' });
					var mfgNum = result.getValue({ name: 'custrecord_soc1_aq_mfg_number' });
					var mfgPrefix = result.getValue({ name: 'custrecord_soc1_aq_mfg_item_prefix' });

					log.debug({
						title: 'mfgVendor Reference',
						details: mfgVendorReference
					});
					log.debug({
						title: 'mfgVendor Prefix',
						details: mfgPrefix
					});
				}
				else {
					log.debug({
						title: 'mfg search',
						details: 'mfg not found'
					});
				}
				// get a reference to the script object
				var scriptRef = runtime.getCurrentScript();
				// 9-21-2017, MSambhu, if the mfg vendor reference is not set at this point, get the default value from the script parameter
				if (!mfgVendorReference) {

					// get the parameter value
					mfgVendorReference = scriptRef.getParameter({
						name: 'custscript_soc1_ue_so_default_vendor'
					});
				}


				// determine what the item type will be for this item
				// Serialized: record.Type.SERIALIZED_INVENTORY_ITEM;
				if (mfgSerialized == true && CategorySerialized == true) {
					itemType = record.Type.SERIALIZED_INVENTORY_ITEM;
				}
				else if (mfgSearchCount == 0) {
					itemType = record.Type.INVENTORY_ITEM;

				}
				else if (mfgProcessed == false) {
					itemType = record.Type.INVENTORY_ITEM;

				}
				else {
					itemType = record.Type.INVENTORY_ITEM;
				}

				log.debug({
					title: 'Item Type',
					details: itemType
				});
				//end of AQ Serialized OHf

				var newItemRecord = record.create({
					// ALWAYS WILL BE A SERIALIZED ITEM
					type: itemType,
					isDynamic: true
					//type: record.Type.INVENTORY_ITEM
				});


				newItemRecord.setValue('itemid', lineItem.Model);
				newItemRecord.setValue('purchasedescription', lineItem.Spec);
				newItemRecord.setValue('salesdescription', lineItem.Spec);
				newItemRecord.setValue('cost', lineItem.NetPrice);
				newItemRecord.setValue('price1', lineItem.ListPrice);
				newItemRecord.setValue('tracklandedcost', true);
				newItemRecord.setValue('usebins', true);
				newItemRecord.setValue('custitem_soc1_aq_freight_class', lineItem.FreightClass);
				newItemRecord.setValue('preferredlocation', 1);
				newItemRecord.setValue('copydescription', true);
				newItemRecord.setValue('custitem_soc1_aq_managed', false);	// #802 - Item Managed flag backwards on import. MSambhu - change to false, per Joe.
				newItemRecord.setValue('upccode', lineItem.GTIN);
				newItemRecord.setValue('custitem_soc1_min_purch_qty', '0');
				newItemRecord.setValue('custitem_soc1_max_purchase_quantity', '0');
				newItemRecord.setValue('custitem_soc1_max_total_amount', '0');
				newItemRecord.setValue('custitem_soc1_min_total_amount', '0');
				newItemRecord.setValue('custitem_soc1_food_serv_exemption', CategoryOHF);


				// 6-27-2019, MSambhu, AQ Import tweaks, June 2019
				//newItemRecord.setValue('custitem_ava_taxcode', CategoryAvaTaxCode);
				newItemRecord.setValue('custpage_ava_taxcodemapping', CategoryAvaTaxCode);
				newItemRecord.setText('custitem_itemcommonality', CategoryItemCommonality);
				//log.debug({
				//	title: 'About to set item category',
				//	details: CategoryItemCategory
				//});
				newItemRecord.setText('custitem_soc1_itemcategory', CategoryItemCategory);
				newItemRecord.setText('custitem_itemcommodity', CategoryItemCommodity);
				newItemRecord.setValue('custitem_soc1_aq_category', lineItem.Category);
				newItemRecord.setValue('custitem_pacejet_item_height', lineItem.Height);
				newItemRecord.setValue('custitem_pacejet_item_width', lineItem.Width);
				newItemRecord.setValue('custitem_pacejet_item_length', lineItem.Depth);
				newItemRecord.setValue('weight', lineItem.Weight);
				newItemRecord.setValue('custitem_soc1_aq_freight_class', lineItem.FreightClass);
				//if (lineItem.SubLineItems != null) {
				//	if (lineItem.SubLineItems.length > 0) {
				//		// get the 1st item in the array
				//		var subLineItem = lineite
				//	}
				//}


				// get the food service exemption flag and store it into our item structure
				lineItem.CategoryOHF = CategoryOHF;


				//TD to prevent having to implement new version of integration, setting MPN 
				var mpnVal = lineItem.Model.replace(mfgPrefix, '');
				mpnVal = mpnVal.replace('-', '');
				log.audit('mpnVal', mpnVal);
				newItemRecord.setValue('mpn', mpnVal);
				newItemRecord.setValue('vendorname', mpnVal);
				//TD uncommented manufacturer setting, not sure why it was commented out TD 4-25-18
				newItemRecord.setValue('manufacturer', mfgName);


				// get a reference to the script object
				//var scriptRef = runtime.getCurrentScript();
				lineItem.taxschedule = scriptRef.getParameter({ name: 'custscript_soc1_rl_quote_od_tax_schedule' });

				newItemRecord.setValue('taxschedule', lineItem.taxschedule);	// Taxable
				newItemRecord.setValue('cogsaccount', scriptRef.getParameter({ name: 'custscript_soc1_rl_quote_od_cogacnt' }));	// 5000 COGS - new
				newItemRecord.setValue('incomeaccount', scriptRef.getParameter({ name: 'custscript_soc1_rl_quote_od_sales_new' }));	// 4000 Sales - new
				newItemRecord.setValue('assetaccount', scriptRef.getParameter({ name: 'custscript_soc1_rl_quote_od_asset_inv' }));	// 1200 Inventory

				lineItem.isdropshipitem = false;
				lineItem.isspecialorderitem = false;
				newItemRecord.setValue('isdropshipitem', lineItem.isdropshipitem);
				newItemRecord.setValue('isspecialorderitem', lineItem.isspecialorderitem);
				newItemRecord.setValue('custitem_burkett_increment', '');
				if (mfgSerialized == true && CategorySerialized == true) {
					newItemRecord.setValue('custitem_burkett_serial_item', true);
                  	lineItem.burkett_Serial = true;
                  	log.debug({
					title: 'Serial New Item',
					details: 'True'
					});
				}
				else {
					newItemRecord.setValue('custitem_burkett_serial_item', false);
                  lineItem.burkett_Serial = false;
                  log.debug({
					title: 'Serial New Item',
					details: 'False'
					});
				}
				lineItem.saleunit = '';
              //added purchase purchase order rate 7-9-20 JR
				//lineItem.costestimatetype = '';
              	lineItem.costestimatetype = 'Purchase Order Rate';


				// set the mfg vendor
				getNewItemVendor(newItemRecord, lineItem, mfgVendorReference, mpnVal);


				var binNumberSublist = newItemRecord.getSublist({
					sublistId: 'binnumber'
				});


				// create a new line in the bin number sublist for the item
				//THIS IS IF THE RECORD IS IN DYNAMIC MODE
				newItemRecord.selectNewLine({
					sublistId: 'binnumber'
				});

				/*TD set text wasn't working, found internal ID for these values 4-13-18
				newItemRecord.setCurrentSublistText({
					  sublistId: 'binnumber',
					  fieldId: 'location',
					  //line: numLines,
					  text: '01 - Distribution'
				  });
  
				newItemRecord.setCurrentSublistText({
					  sublistId: 'binnumber',
					  fieldId: 'binnumber',
					  //line: numLines,
					  text: '01.Staging'
				  });
				*/
				//hardcoded value to location "01 - Distribution"
				newItemRecord.setCurrentSublistValue({
					sublistId: 'binnumber',
					fieldId: 'location',
					//line: numLines,
					value: 1
				});

				//hardcoded to 01.Staging
				newItemRecord.setCurrentSublistValue({
					sublistId: 'binnumber',
					fieldId: 'binnumber',
					//line: numLines,
					value: 2701
				});

			

				newItemRecord.commitLine({
					sublistId: 'binnumber'
				});

				recordId = newItemRecord.save();
				lineItem.internalID = recordId;

				// save the GSA field values.
				lineItem.gsa_listed = false;
				lineItem.gsa_sin = null;
				lineItem.procurementmethod = null;
				lineItem.itemcondition = null;
				lineItem.plannedmargin = null;
				lineItem.burkett_increment = '';
			//	lineItem.burkett_Serial = false;

				doesItemExist = true;

			}
			else {
				// item found
				log.debug({
					title: 'item found',
					details: lineItem.Model
				});

				var foundItem = itemSearchRange[0];
				log.debug({
					title: 'Found Item',
					details: foundItem
				});

				var itemId = foundItem.getValue('itemid');
				var itemDisplayName = foundItem.getValue('displayname');

				//if (lineItem.Model != itemId) {
				//	log.debug({
				//		title: 'item search',
				//		details: 'looking for item: ' + lineItem.Model + ', found item: ' + itemId + ', display name: ' + itemDisplayName
				//	});
				//}
				lineItem.internalID = foundItem.getValue('internalid');

				// get the food service exemption flag and store it into our item structure
				lineItem.CategoryOHF = foundItem.getValue('custitem_soc1_food_serv_exemption');

				//log.debug({
				//	title: 'item found',
				//	details: lineItem.Model + ', found item: ' + foundItem.getValue('itemid')
				//});

				var isInactive = foundItem.getValue('isinactive');
				if (isInactive) {
					log.debug({
						title: 'Inactive item found',
						details: 'Search item: ' + lineItem.Model + ', found INACTIVE item: ' + foundItem.getValue('itemid')
					});
				}

				lineItem.isdropshipitem = foundItem.getValue('isdropshipitem');
				lineItem.isspecialorderitem = foundItem.getValue('isspecialorderitem');
				lineItem.saleunit = foundItem.getValue('saleunit');
				lineItem.costestimatetype = foundItem.getValue('costestimatetype');

				// get & save the GSA fields.
				lineItem.gsa_listed = foundItem.getValue('custitem_burkett_itm_gsa_listed');
				lineItem.gsa_sin = foundItem.getValue('custitem_burkett_item_gsa_sin');
				lineItem.procurementmethod = foundItem.getValue('custitem_procurementmethod');
				//lineItem.itemcondition = foundItem.getValue('custitem_magentoitemcondition');
				lineItem.itemcondition = foundItem.getText('custitem_magentoitemcondition');
				lineItem.plannedmargin = foundItem.getValue('custitem_burkett_planned_margin');
				lineItem.burkett_increment = foundItem.getValue('custitem_burkett_increment');
				lineItem.burkett_Serial = foundItem.getValue('custitem_burkett_serial_item');

				// clear the vendor field.
				lineItem.vendor = null;
				//if (lineItem.isdropshipitem || lineItem.isspecialorderitem) {
				//	// we have a drop ship or a special order item.
				//}
				// 9-22-2017, MSambhu, always get the preferred vendor
				// load the item record so we can get the preferred vendor
				var itemRec = record.load({
					type: foundItem.recordType,
					id: foundItem.getValue('internalid')
				});
				var lineNumber = itemRec.findSublistLineWithValue({
					sublistId: 'itemvendor',
					fieldId: 'preferredvendor',
					value: true
				});
				if (lineNumber >= 0) {
					// set the vendor field
					lineItem.vendor = itemRec.getSublistValue({
						sublistId: 'itemvendor',
						fieldId: 'vendor',
						line: lineNumber
						//value: 53092//mfgVendorReference
					});

					lineItem.taxschedule = itemRec.getValue('taxschedule');

					//lineItem.vendor = itemRec.getCurrentSublistValue({
					//	sublistId: 'itemvendor',
					//	fieldId: 'vendor',
					//	line: lineNumber
					//	//value: 53092//mfgVendorReference
					//});
				}


				//ItemData.vendor = mfgVendorReference;

				log.debug({
					title: 'Planned Margin',
					details: lineItem.plannedmargin
				});


				var parentItem = foundItem.getText('parent');
				if (parentItem) {
					lineItem.Model = parentItem + ' : ' + lineItem.Model;
				}
				doesItemExist = true;
				//lineItem.Model = itemSearchRange[0].getValue('internalid');
			}

			return doesItemExist;


		}

		function getNewItemVendor(newItemRecord, ItemData, mfgVendorReference, mfgVendorCode) {


			//Create Preferred Vendor Subrecord

			// determine if the mfg/vendor that we found in the previous search
			// already exists in the vendor sublist of the item.
			var lineNumber = newItemRecord.findSublistLineWithValue({
				sublistId: 'itemvendor',
				fieldId: 'vendor',
				value: mfgVendorReference
			});

			log.debug({
				title: 'vendor sublist line number',
				details: lineNumber
			});

			if (lineNumber == -1) {
				// we did NOT find the mfg / vendor in the vendor sublist for the item.

				//Get the number of lines in the Sublist
				var numLines = newItemRecord.getLineCount({
					sublistId: 'itemvendor'
				});

				log.debug({
					title: 'item vendor count',
					details: numLines
				});


				//				// create a new line in the vendor sublist for the item
				//THIS IS IF THE RECORD IS IN DYNAMIC MODE
				//				existingItem.selectNewLine({
				//					sublistId: 'itemvendor'
				//				});

				//				 var vendsublist = existingItem.getSublist({
				//					sublistId: 'itemvendor'
				//				});
				var vendorSublist = newItemRecord.getSublist({
					sublistId: 'itemvendor'
				});


				// create a new line in the vendor sublist for the item
				//THIS IS IF THE RECORD IS IN DYNAMIC MODE
				newItemRecord.selectNewLine({
					sublistId: 'itemvendor'
				});
				//				
				//THIS IS IF THE RECORD IS IN STANDARD MODE THEN USE INSERT LINE
				//				existingItem.insertLine({
				//				    sublistId: 'itemvendor',
				//				    line: 2//numLines
				//				    //line: numLines + 1
				//				});



				newItemRecord.setCurrentSublistValue({
					sublistId: 'itemvendor',
					fieldId: 'vendor',
					line: numLines,
					value: mfgVendorReference//53092//
				});

				//TD as per David's request
				var venref = newItemRecord.setCurrentSublistValue({
					sublistId: 'itemvendor',
					fieldId: 'vendorcode',
					line: numLines,
					value: mfgVendorCode
				});

				log.debug({
					title: 'Ven',
					details: venref
				});

				ItemData.vendor = mfgVendorReference;


				newItemRecord.setCurrentSublistValue({
					sublistId: 'itemvendor',
					fieldId: 'preferredvendor',
					line: numLines,
					value: true
				});

				//existingItem.commitLine('itemvendor');

				var getpreffered = newItemRecord.getCurrentSublistValue({
					sublistId: 'itemvendor',
					fieldId: 'preferredvendor',
					line: numLines
					//value: true
				});

				log.debug({
					title: 'Pref',
					details: getpreffered
				});



				var vendorPrices = newItemRecord.getCurrentSublistSubrecord({
					sublistId: 'itemvendor',
					fieldId: 'itemvendorprice'
					//line: numLines
				});


				log.debug({
					title: 'VPrices',
					details: vendorPrices
				});


				//Add a line to the subrecord's Vendor Prices sublist.
				vendorPrices.insertLine({
					sublistId: 'itemvendorpricelines',
					line: 0
				});


				vendorPrices.setCurrentSublistText({
					sublistId: 'itemvendorpricelines',
					fieldId: 'vendorcurrency',
					line: 0,
					text: 'USA'
				});

				vendorPrices.setCurrentSublistText({
					sublistId: 'itemvendorpricelines',
					fieldId: 'vendorprice',
					line: 0,
					text: String(ItemData.NetPrice)
				});

				vendorPrices.commitLine({
					sublistId: 'itemvendorpricelines'
				});

				newItemRecord.commitLine({
					sublistId: 'itemvendor'
				});

			}
			else {
				// we DID find the mfg / vendor in the vendor sublist for the item.

				log.debug({
					title: 'line number of found vendor',
					details: lineNumber
				});

				newItemRecord.selectLine({
					sublistId: 'itemvendor',
					line: lineNumber
				});


				//				existingItem.setCurrentSublistValue({
				//					sublistId: 'itemvendor',
				//					fieldId: 'vendor',
				//					//line: lineNumber,
				//					value: mfgVendorReference,
				//					ignoreFieldChange: true
				//				});

				// set the [preferred] flag on the sublist record to be true
				newItemRecord.setCurrentSublistValue({
					sublistId: 'itemvendor',
					fieldId: 'preferredvendor',
					//line: lineNumber,
					value: true
				});
				//				var price = existingItem.getSublistValue({
				//					sublistId: 'itemvendor',
				//					fieldId: 'purchaseprice',
				//					line: lineNumber					
				//				});

				//								
				// doesn't blow up, but doesn't appear to return anything
				//				var ivp = existingItem.getSublist({
				//					sublistId: 'itemvendorprice'
				//				});

				//				var itemVendorSublist = existingItem.getCurrentSublist({
				//					sublistId: 'itemvendor',
				//					fieldId: 'itemvendorprice',
				//					line: lineNumber
				//				}); // returns: {"id":"itemvendor","type":"inlineeditor","isChanged":true,"isDisplay":true}


				var vendorPrices = newItemRecord.getCurrentSublistSubrecord({
					sublistId: 'itemvendor',
					fieldId: 'itemvendorprice'
					//line: lineNumber
				});

				//				var lineNumber4 = existingItem.hasSublistSubrecord({
				//					sublistId: 'itemvendor',
				//				    fieldId: 'itemvendorprice',
				//				    line: 0
				//					
				//				}); // THIS WORKS RETURNS TRUE

				var hasVendorPrices = newItemRecord.hasCurrentSublistSubrecord({
					sublistId: 'itemvendor',
					fieldId: 'itemvendorprice'
					//line: lineNumber
				});

				if (hasVendorPrices) {
					// update the existing vendor purchase price

					vendorPrices.selectLine({
						sublistId: 'itemvendorpricelines',
						line: 0
					});

					vendorPrices.setCurrentSublistText({
						sublistId: 'itemvendorpricelines',
						fieldId: 'vendorcurrency',
						//line : 0,
						text: 'USA'
					});



					vendorPrices.setCurrentSublistText({
						sublistId: 'itemvendorpricelines',
						fieldId: 'vendorprice',
						//line : 0,
						text: String(ItemData.NetPrice)
					});

					var venprice34 = vendorPrices.getCurrentSublistText({
						sublistId: 'itemvendorpricelines',
						fieldId: 'vendorprice'
						//line : 0,
						//text: '12.56'//String(ItemData.NetPrice)
					});

					log.debug({
						title: 'vendor price',
						details: venprice34
					});

					vendorPrices.commitLine({
						sublistId: 'itemvendorpricelines'
					});

					newItemRecord.commitLine({
						sublistId: 'itemvendor'
					});

				}
			}
		}

		function findSalesRep(salesRepFirstName, salesRepLastName) {
			// get a reference to the script object
			var scriptRef = runtime.getCurrentScript();

			//CHANGE IN PRODUCTION DURING GO LIVE. THIS IS THE AQ ERROR EMPLOYEE
			//var salesRepInternalID = 80252;	// for sandbox
			//var salesRepInternalID = 57818;	// for production
			var salesRepInternalID = scriptRef.getParameter({ name: 'custscript_soc1_rl_quote_od_error_emp' });
			var salesRepName = 'AQ Error';

			//Need to find the SalesRep
			if (!salesRepLastName) {
				return salesRepName;
			}
			else {
				var salesRepSearch = search.create({
					type: 'EMPLOYEE',
					filters: [
						search.createFilter({
							name: 'entityid',
							operator: search.Operator.CONTAINS,
							values: salesRepLastName//salesRepFirstName + ' ' + salesRepLastName
						}),
						search.createFilter({
							name: 'salesrep',
							operator: search.Operator.IS,
							values: true
						})],
					columns: [
						search.createColumn({ name: 'internalid' }),
						search.createColumn({ name: 'entityid' })
					]
				});

				var salesRepSearchRange = salesRepSearch.run().getRange({
					start: 0,
					end: 10
				});

				var salesRepCount = salesRepSearchRange.length;

				log.debug({
					title: 'Sales Rep: ',
					details: salesRepCount
				});

				var salesRepResult = salesRepSearchRange[0];

				if (salesRepCount == 0) {

					return salesRepName;
				}
				else {
					salesRepInternalID = salesRepResult.getValue({ name: 'internalid' });
					salesRepName = salesRepResult.getValue({ name: 'entityid' });

					return salesRepName;
				}
			}
		}

		function findCustomer(projectName, customer, salesRepName, projectData) {

			// get a reference to the script object
			var scriptRef = runtime.getCurrentScript();

			log.debug({
				title: 'inside of findCustomer()',
				details: 'Project Name: ' + projectName + ', Sales Rep: ' + salesRepName
			});

			var filter = [
				["entityid", "contains", projectName],
				"OR",
				["custentity_soc1_aq_customer_project_name", "contains", projectName],
				"OR",
				["entityid", "contains", salesRepName]
			];
			var CustomerId = '';
			if (projectData.Customers != null && projectData.Customers.length > 0 && projectData.Customers[0].ExportId != '') {
				CustomerId = projectData.Customers[0].ExportId;

				filter.push("OR");
				filter.push(["entityid", "contains", CustomerId]);
			}
			log.debug({
				title: 'findCustomer() search filter',
				details: filter
			});

			//Search for Customer. Still need to turn that ID to Customer Name
			var customerLookup = search.create({
				type: search.Type.CUSTOMER,
				filters: filter,

				columns: [
					search.createColumn({ name: 'entityid' }),
					search.createColumn({ name: 'altname' }),
					search.createColumn({ name: 'companyname' }),
					search.createColumn({ name: 'internalid' }),
				]
			});

			var customerSearchRange = customerLookup.run().getRange({
				start: 0,
				end: 10
			});

			var CustomerCount = customerSearchRange.length;



			//            var customerInternalID = CustomerResult.getValue({ name: 'internalid' });
			//            var customerName = CustomerResult.getValue({ name: 'entityid' });

			//Create Customer if  they do not exist
			if (CustomerCount > 0) {
				// get a reference to the customer record we found
				var CustomerResult = customerSearchRange[0];
				var entityid = CustomerResult.getValue({ name: 'entityid' });
				var companyName = CustomerResult.getValue({ name: 'altname' });
				customer.entityid = entityid + ' ' + companyName;
				customer.customerid = CustomerResult.getValue({ name: 'internalid' });

				log.debug({
					title: 'Entity Id',
					details: customer.entityid
				});

				// set the values of our customer object from the customer record
				//customer.companyname = customerName;
			} else {

				// ------------------------------------------------------------------------------
				//
				//
				// If we get here, there is no customer created for this Project.
				// We need to create a generic customer with the name of the Sales Rep
				//
				//
				// ------------------------------------------------------------------------------

				var newCustomer = record.create({

					type: record.Type.CUSTOMER,
					isDynamic: true
					//type: record.Type.INVENTORY_ITEM
				});

				log.debug({
					title: 'Sales Rep',
					details: customer.salesrep
				});

				// set the values on our customer object.
				customer.companyname = customer.salesrep + '-AQCUSTOMER';
				customer.memo = 'The ProjectName for this Customer in AutoQuotes is: ' + projectName;
				customer.phone = '000-000-0000';
				//customer.leadsource = 'AUTOQUOTES NEW CUSTOMER';
				customer.leadsource = scriptRef.getParameter({ name: 'custscript_soc1_rl_quote_od_leadsource' });
				customer.email = 'error@burket.com';
				//customer.category = 'AutoQuotes Error';
				customer.category = scriptRef.getParameter({ name: 'custscript_soc1_rl_quote_od_cus_category' });
				//customer.salesrep = salesRepName;


				//STILL NEED TO GET SALES REPS NAME and set that as Customer name; Ex: JOHNSMITH-AUTOQUOTESCUSTOMER
				//newCustomer.setValue('isperson', false);
				newCustomer.setText('companyname', customer.companyname);
				newCustomer.setText('custentity_soc1_aq_customer_project_name', projectName);
				newCustomer.setValue('memo', customer.memo);
				newCustomer.setValue('phone', customer.phone);
				newCustomer.setText('leadsource', customer.leadsource);
				newCustomer.setValue('email', customer.email);
				newCustomer.setText('category', customer.category);
				// NEED TO GET THE SALES REPS NAME
				newCustomer.setText('salesrep', customer.salesrep);

				//customer.entityid = newCustomer.save();
				var custtemp = newCustomer.save();
				customer.entityid = custtemp;
				customer.customerid = 0;


				var customerCreated = record.load({
					type: record.Type.CUSTOMER,
					id: custtemp
					//isDynamic: true
					//type: record.Type.INVENTORY_ITEM
				});

				var entity = customerCreated.getValue('entityid');


				log.debug({
					title: 'new Customer',
					details: entity
				});


				//Get this ID if newly created Customer or use the one that returned from the search

				customer.entityid = entity;
			}

		}



		/**
		 * Function called upon sending a POST request to the RESTlet.
		 *
		 * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
		 * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
		 * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
		 * @since 2015.2
		 */
		function doPost(requestBody) {

		}

		/**
		 * Function called upon sending a DELETE request to the RESTlet.
		 *
		 * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
		 * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
		 * @since 2015.2
		 */
		function doDelete(requestParams) {

		}

		return {
			'get': doGet,
			put: doPut,
			post: doPost,
			'delete': doDelete
		};

	});