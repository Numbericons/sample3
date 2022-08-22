  /**
   *@NApiVersion 2.1
  *@NScriptType MapReduceScript
  *@Author  
  */
  /***********************************************************************
   * File:        SK_ZO_MHI_Update_Inventory_Detail_V2.js
   * Date:        8/18/2018
   * Summary:
   * Author:       Zachary Oliver
   * Updates:     
   ***********************************************************************/
  define(
    ["N/record", "N/search", "N/runtime", "N/error", "N/task", "N/file", "N/format", "SuiteScripts/_work/srvc/design_to_build/code/nts_md_manage_item_master_v200"],
    (record, search, runtime, error, task, file, format, nts_md_manage_item_master) => {
      // item_pricing(estimate, price_rule, trandate, domestic, international, customerTxt)
      const getInputData = (context) => {
        try {
          var scriptObj = runtime.getCurrentScript();
          const customerId = scriptObj.getParameter({
            name: "custscript_customer_id",
          },);
          
          const customerName = scriptObj.getParameter({
            name: "custscript_customer_name",
          },);

          const domestic = scriptObj.getParameter({
            name: "custscript_domestic",
          },);

          const international = scriptObj.getParameter({
            name: "custscript_international",
          },);

          log.debug('Logging customer id and name:', customerId + " " + customerName);
          log.debug('Logging domestic and international:', domestic + " " + international);

          var search = createSearch(customerId, domestic, international);

          var count = search.runPaged().count;
          log.debug('Count of search results : ' + count);

          return search;
        } catch (e) {
          log.debug(
            "Error in getInputData Function",
            e.toString() + " >>> END <<< ",
          );
        }
      };

      const map = (context) => {
        let result = context.value;
        log.debug('JSON.parse(result) values: ', JSON.parse(result).values);

        const id = JSON.parse(result).values["internalid"].value;
        log.debug('id : ', id);

        const weight = JSON.parse(result).values["weight.CUSTRECORD_NTS_PR_ITEM"];
        const customerTxt = JSON.parse(result).values["altname.CUSTRECORD_NTS_PR_CUSTOMER"];
        const trandate = dateFormat();

        const booleanArr = JSON.parse(result).values["formulatext"].split(" ");
        log.debug('booleanArr : ', booleanArr);
        const domestic = booleanArr[1];
        log.debug('domestic : ', domestic);
        const international = booleanArr[3];
        log.debug('international : ', international);

        log.debug('domestic, international : ' + domestic) + " , " + international;

        const priceRule = record.load({
          type: "customrecord_nts_price_rule",
          id: id
        });

        nts_md_manage_item_master.item_pricing(null, priceRule, trandate, domestic, international, customerTxt, weight);

        return true;
      };

      const summarize = (summary) => {
        try {
          summary.output.iterator().each(function (key, value) {
            log.audit({
              title: " PO: " + key,
              details: value,
            },);
            const reduceValues = JSON.parse(value);
            log.debug("1st Object", reduceValues.values[0]);
            
            return true;
          },);

          log.audit({
            title: "END",
            details:
              "<---------------------------------END--------------------------------->",
          },);
        } catch (errorObj) {
          log.error({
            title: "(Summary) You were so close Error",
            details: errorObj.toString(),
          },);
          throw errorObj;
        }
      };

      function dateFormat() {
        var date = new Date

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        if (month.toString().length === 1) month = '0' + month.toString();
        if (day.toString().length === 1) day = '0' + day.toString();

        return month + "/" + day + "/" + year;
      }

      function addFilter(string) {
        if (string === "domestic") return ["custrecord_nts_pr_item.custitem_vmrd_domestic", "is", true]
        if (string === "international") return ["custrecord_nts_pr_item.custitem_vmrd_international", "is", false]
      }

      function setFilters(cust, domestic, international, date) {
        var filters =  [
          ["isinactive", "is", "F"],
          "AND",
          ["custrecord_nts_pr_customer", "anyof", cust],
          "AND",
          ["custrecord_nts_pr_start_date", "onorbefore", date],
          "AND",
          [
            ["custrecord_nts_pr_end_date", "isempty", ""],
            "OR",
            ["custrecord_nts_pr_end_date", "onorafter", date],
          ],
          "AND",
          ["custrecord_nts_pr_item.custitem_vmrd_sellable", "is", "T"],
          "AND",
          ["custrecord_nts_pr_item.isinactive","is","F"]
        ]

        log.debug('setFilters value for dom: ', domestic);
        log.debug('setFilters value for dom typeOf: ', typeof domestic);
        log.debug('setFilters value for int: ', international);
        
        if (domestic === "true") {
          filters.push("AND");
          filters.push(addFilter("domestic"));
        }

        if (international === "true") {
          filters.push("AND");
          filters.push(addFilter("international"));
        }

        log.debug('filters : ', filters);

        return filters;
      }

      function createSearch(cust, dom, int) {
        var date = dateFormat();

        var search_obj = search.create({
          type: "customrecord_nts_price_rule",
          filters: setFilters(cust, dom, int, date),
          columns: [
            search.createColumn({
              name: "internalid",
              label: "Internal ID"
            }),
            search.createColumn({
              name: "name",
              label: "Name"
            }),
            search.createColumn({
              name: "scriptid",
              label: "Script ID"
            }),
            search.createColumn({
              name: "custrecord_nts_pr_start_date",
              label: "Start Date"
            }),
            search.createColumn({
              name: "custrecord_nts_pr_end_date",
              label: "End Date"
            }),
            search.createColumn({
              name: "custrecord_nts_pr_customer",
              label: "Customer"
            }),
            search.createColumn({
              name: "custrecord_nts_pr_item",
              sort: search.Sort.ASC,
              label: "Item"
            }),
            search.createColumn({
              name: "custrecord_nts_pr_calculation_method",
              label: "Calculation Method"
            }),
            search.createColumn({
              name: "custrecord_nts_pr_calculation_basis",
              label: "Calculation Basis"
            }),
            search.createColumn({
              name: "custrecord_nts_pr_adjust_pct",
              label: "Adjust %"
            }),
            search.createColumn({
              name: "custrecord_nts_pr_adjust_amt",
              label: "Adjust $"
            }),
            search.createColumn({
              name: "custrecord_nts_pr_tier_basis",
              label: "Tier Basis"
            }),
            search.createColumn({
              name: "weight",
              join: "CUSTRECORD_NTS_PR_ITEM",
              label: "Weight"
            }),
            search.createColumn({
              name: "formulatext",
              formula: "'" + "Domestic: " + dom + " International: " + int + "'",
              label: "Domestic"
            }),
            search.createColumn({
              name: "altname",
              join: "CUSTRECORD_NTS_PR_CUSTOMER",
              label: "customerName"
            })
          ]
        });
        return search_obj;
      }

      function generate_price_list_dom(customer, location) {
        var estimate_results = {
          estimate_id: "",
        };
        var price_rule;
        
        var price_rule_results = query_price_rules_dom(
          customer,
          date_to_string(new Date()),
        );

        log.debug("price rule results idx 0: ", price_rule_results[0]);

        if (price_rule_results.length > 0) {
          var estimate = record.create({
            type: record.Type.ESTIMATE,
            isDynamic: true,
          });

          estimate.setValue({
            fieldId: "customform",
            value: 165,
          });
          estimate.setValue({
            fieldId: "entity",
            value: customer,
          });
          estimate.setValue({
            fieldId: "location",
            value: location,
          });

          estimate.setValue({
            fieldId: "custbody_nts_is_price_list",
            value: true,
          });
          log.debug(price_rule_results.length);
          for (var i = 0; i < price_rule_results.length; i++) {
            price_rule = price_rule_results[i];

            var valtopush = price_rule.getValue({
              name: "custrecord_nts_pr_item",
            });
            log.debug("valtopush", valtopush);

            var itemlookup = search.lookupFields({
              type: search.Type.ITEM,
              id: valtopush,
              columns: ["isinactive"],
            },);
            log.debug("itemlookup", itemlookup.isinactive);

            if (!itemlookup.isinactive) {
              estimate.selectNewLine({
                sublistId: "item",
                line: i,
              },);

              estimate.setCurrentSublistValue({
                sublistId: "item",
                fieldId: "item",
                value: price_rule.getValue({
                  name: "custrecord_nts_pr_item",
                },),
                forceSyncSourcing: true,
              },);

              estimate.setCurrentSublistValue({
                sublistId: "item",
                fieldId: "price",
                value: -1,
              },);
              estimate.setCurrentSublistValue({
                sublistId: "item",
                fieldId: "quantity",
                value: 1,
              },);

              estimate =
                nts_md_manage_item_master.item_pricing(estimate, price_rule);

              estimate.commitLine("item");
              log.debug("estimate line committed");
            }
          }
          log.debug("Estimate about to save");

          estimate_results.estimate_id = estimate.save();
        }

        log.debug("Estimate id: ", estimate_results.estimate_id);
        return estimate_results;
      }

      function query_price_rules_dom(customer, trandate) {
        var search_obj = search.create({
          type: "customrecord_nts_price_rule",
          filters: [
            ["isinactive", "is", "F"],
            "AND",
            ["custrecord_nts_pr_customer", "anyof", customer],
            "AND",
            ["custrecord_nts_pr_start_date", "onorbefore", trandate],
            "AND",
            [
              ["custrecord_nts_pr_end_date", "isempty", ""],
              "OR",
              ["custrecord_nts_pr_end_date", "onorafter", trandate],
            ],
            "AND",
            ["custrecord_nts_pr_item.custitem_vmrd_domestic", "is", "T"],
            "AND",
            ["custrecord_nts_pr_item.custitem_vmrd_sellable", "is", "T"],
          ],
          columns: [
            search.createColumn({
              name: "name",
              label: "Name",
            },),
            search.createColumn({
              name: "scriptid",
              label: "Script ID",
            },),
            search.createColumn({
              name: "custrecord_nts_pr_start_date",
              label: "Start Date",
            },),
            search.createColumn({
              name: "custrecord_nts_pr_end_date",
              label: "End Date",
            },),
            search.createColumn({
              name: "custrecord_nts_pr_customer",
              label: "Customer",
            },),
            search.createColumn({
              name: "custrecord_nts_pr_item",
              sort: search.Sort.ASC,
              label: "Item",
            },),
            search.createColumn({
              name: "custrecord_nts_pr_calculation_method",
              label: "Calculation Method",
            },),
            search.createColumn({
              name: "custrecord_nts_pr_calculation_basis",
              label: "Calculation Basis",
            },),
            search.createColumn({
              name: "custrecord_nts_pr_adjust_pct",
              label: "Adjust %",
            },),
            search.createColumn({
              name: "custrecord_nts_pr_adjust_amt",
              label: "Adjust $",
            },),
            search.createColumn({
              name: "custrecord_nts_pr_tier_basis",
              label: "Tier Basis",
            },),
          ],
        },);

        return results(search_obj);
      }

      function handle_no_command(requestBody) {
        var jsonObj = {
          command: "none",
          status: "request error",
          error: "no command",
        };

        return jsonObj;
      }

      function results(search_obj) {
        var results_array = [];
        var page = search_obj.runPaged({
          pageSize: 4000,
        },);

        for (var i = 0; i < page.pageRanges.length; i++) {
          var pageRange = page.fetch({
            index: page.pageRanges[i].index,
          },);
          results_array = results_array.concat(pageRange.data);
        }

        return results_array;
      }

      function date_to_string(date_instance) {
        var date_string = format.format({
          value: date_instance,
          type: format.Type.DATE,
        },);

        return date_string;
      }

      function isEmpty(stValue) {
        if ((stValue == "") || (stValue == null) || (stValue == undefined)) {
          return true;
        } else {
          if (stValue instanceof String) {
            if (stValue == "") {
              return true;
            }
          } else if (stValue instanceof Array) {
            if (stValue.length == 0) {
              return true;
            }
          }
          return false;
        }
      }

      return {
        getInputData,
        map,
        summarize,
      };
    },
  );