/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(
  [
    "N/record",
    "N/runtime",
    "N/search",
    "N/format",
    "SuiteScripts/_work/srvc/design_to_build/code/nts_md_manage_price_rule",
    "SuiteScripts/_work/srvc/design_to_build/code/nts_md_manage_item_master",
  ],
  function (
    record,
    runtime,
    search,
    format,
    nts_md_manage_price_rule,
    nts_md_manage_item_master,
  ) {
    var ITEM_TYPES = {
      Assembly: record.Type.ASSEMBLY_ITEM,
      InvtPart: record.Type.INVENTORY_ITEM,
      Kit: record.Type.KIT_ITEM,
      NonInvtPart: record.Type.NON_INVENTORY_ITEM,
      Service: record.Type.SERVICE_ITEM,
    };

    function doGet(requestParams) {
      try {
        var jsonObj = {
          method: "doGet",
        };

        return JSON.stringify({
          test_item_pricing: test_item_pricing(),
        },);
      } catch (error) {
        log.error(
          error.name,
          "msg: " + error.message + " stack: " + error.stack,
        );
        return error.message;
      }
    }

    function test_item_pricing() {
      var requestBody = {
        command: "item_pricing",
        customer: "117",
        location: "4",
      };

      jsonString = doPost(requestBody);

      return jsonString;
    }

    function doPut(requestBody) {
      try {
        var jsonObj = {
          method: "doPut",
        };

        return JSON.stringify(jsonObj);
      } catch (error) {
        log.error(
          error.name,
          "msg: " + error.message + " stack: " + error.stack,
        );
        return error.message;
      }
    }

    function doPost(requestBody) {
      try {
        var jsonObj = null;

        switch (requestBody["command"]) {
          case "generate_price_list_dom":
            jsonObj = generate_price_list_dom(requestBody);
            break;
          case "generate_price_list_int":
            jsonObj = generate_price_list_int(requestBody);
            break;
          default:
            jsonObj = handle_no_command(requestBody);
        }

        return jsonObj;
      } catch (error) {
        log.error(
          error.name,
          "msg: " + error.message + " stack: " + error.stack,
        );
        return error.message;
      }
    }

    function doDelete(requestParams) {
      try {
        var jsonObj = {
          method: "doDelete",
        };

        return JSON.stringify(jsonObj);
      } catch (error) {
        log.error(
          error.name,
          "msg: " + error.message + " stack: " + error.stack,
        );
        return error.message;
      }
    }

    function generate_price_list_dom(requestBody) {
      var customer = requestBody["customer"];
      var location = requestBody["location"];
      var estimate_results = {
        estimate_id: "",
      };
      var price_rule;

      var price_rule_results = query_price_rules_dom(
        customer,
        date_to_string(new Date()),
      );

      if (price_rule_results.length > 0) {
        var estimate = record.create({
          type: record.Type.ESTIMATE,
          isDynamic: true,
        },);

        estimate.setValue({
          fieldId: "customform",
          value: 165,
        },);
        estimate.setValue({
          fieldId: "entity",
          value: customer,
        },);
        estimate.setValue({
          fieldId: "location",
          value: location,
        },);

        estimate.setValue({
          fieldId: "custbody_nts_is_price_list",
          value: true,
        },);
        log.debug(price_rule_results.length);
        for (var i = 0; i < price_rule_results.length; i++) {
          price_rule = price_rule_results[i];

          var valtopush = price_rule.getValue({
            name: "custrecord_nts_pr_item",
          },);
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
          }
        }

        estimate_results.estimate_id = estimate.save();
      }

      return estimate_results;
    }

    function generate_price_list_int(requestBody) {
      var customer = requestBody["customer"];
      var location = requestBody["location"];
      var estimate_results = {
        estimate_id: "",
      };
      var price_rule;

      var price_rule_results = query_price_rules_int(
        customer,
        date_to_string(new Date()),
      );

      if (price_rule_results.length > 0) {
        var estimate = record.create({
          type: record.Type.ESTIMATE,
          isDynamic: true,
        },);

        estimate.setValue({
          fieldId: "customform",
          value: 165,
        },);
        estimate.setValue({
          fieldId: "entity",
          value: customer,
        },);
        estimate.setValue({
          fieldId: "location",
          value: location,
        },);
        estimate.setValue({
          fieldId: "custbody_nts_is_price_list",
          value: true,
        },);

        for (var i = 0; i < price_rule_results.length; i++) {
          price_rule = price_rule_results[i];

          var valtopush = price_rule.getValue({
            name: "custrecord_nts_pr_item",
          },);
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
          }
        }

        estimate_results.estimate_id = estimate.save();
      }

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

    function query_price_rules_int(customer, trandate) {
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
          ["custrecord_nts_pr_item.custitem_vmrd_international", "is", "T"],
          "AND",
          ["custrecord_nts_pr_item.custitem_vmrd_sellable", "is", "T"],
        ],
        columns: [
          search.createColumn({
            name: "name",
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
        ],
      },);

      return results(search_obj);
    }

    function query_price_rules(customer) {
      var search_obj = search.create({
        type: "customrecord_nts_price_rule",
        filters: [
          ["isinactive", "is", "F"],
          "AND",
          ["custrecord_nts_pr_customer", "anyof", customer],
        ],
        columns: [
          search.createColumn({
            name: "name",
            sort: search.Sort.ASC,
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

    function isEmpty(value) {
      if (value === null) {
        return true;
      } else if (value === undefined) {
        return true;
      } else if (value === "") {
        return true;
      } else if (value === " ") {
        return true;
      } else if (value === "null") {
        return true;
      } else {
        return false;
      }
    }

    return {
      get: doGet,
      put: doPut,
      post: doPost,
      delete: doDelete,
    };
  },
);
