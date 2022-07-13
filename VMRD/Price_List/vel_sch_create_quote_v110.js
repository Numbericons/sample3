/**
 *@NModuleScope Public
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 *@Author  Zachary Oliver
 */
/***********************************************************************
 * File:        vel_sch_create_quote_v100.js
 * Date:        7/12/2022
 * Summary:
 * Author:      Zachary Oliver
 * Copyrights:  Zachary Oliver
 * Updates:     Change to recursively call itself to continue processing [Zach]
 ***********************************************************************/

define(["N/record", "N/search", "N/task", "N/runtime", "N/error", "N/format", "SuiteScripts/_work/srvc/design_to_build/code/nts_md_manage_item_master"],
  function (record, search, task, runtime, error, format, nts_md_manage_item_master) {
    function execute(context) {
      log.debug('enter execute');
      try {
        var scriptObj = runtime.getCurrentScript();

        const customer = scriptObj.getParameter({
          name: "custscript_sch_price_list_customer"
        });

        const location = scriptObj.getParameter({
          name: "custscript_sch_price_list_location"
        });

        log.debug('customer: ', customer);
        
        const estimateId = scriptObj.getParameter({
          name: "custscript_sch_price_list_estimate"
        });

        log.debug('Got estimate id in execute: ', estimateId);

        updateEstimate(customer, location, estimateId);
      } catch (e) { log.debug("Error in Execute Function", e.toString() + " >>> END <<< "); }
    }

    function updateEstimate(cust, loc, estimate) {
      log.debug('enter updateEstimate');
      try {
        const priceList = generate_price_list_dom(cust, loc, estimate);
      } catch (e) {
        log.debug('', 'Error in updateEstimate: ' + e.toString());
      }
    }

    function generate_price_list_dom(customer, location, estimateId) {
      var estimate, price_rule;
      var start_idx = 0;
      //nintyPercent is <90% of the limit of governance before a usage error would trigger (i is max 459)
      const nintyPercent = 100;
      log.debug('Estimate Id in generate_pl function: ', estimateId);
      
      var price_rule_results = query_price_rules_dom(
        customer,
        date_to_string(new Date())
      );

      log.debug("price rule results idx 0: ", price_rule_results[0]);

      if (price_rule_results.length > 0) {
        if (estimateId) {
          estimate = record.load({
            type: record.Type.ESTIMATE,
            isDynamic: true,
            id: estimateId
          });

          start_idx = estimate.getValue({ fieldId: 'custbody_vel_price_list_idx' });
          log.debug('Start Idx after record load: ', start_idx)
        } else {
          estimate = record.create({
            type: record.Type.ESTIMATE,
            isDynamic: true
          });

          estimate.setValue({
            fieldId: "customform",
            value: 165
          });
          estimate.setValue({
            fieldId: "entity",
            value: customer
          });
          estimate.setValue({
            fieldId: "location",
            value: location
          });
          estimate.setValue({
            fieldId: "custbody_nts_is_price_list",
            value: true
          });
        }

        var numLines = price_rule_results.length - start_idx;
        if (numLines > nintyPercent) numLines = nintyPercent;

        for (var i = start_idx; i < start_idx + numLines; i++) {
          log.debug('Current idx: ', i);
          log.debug('Total length: ', price_rule_results.length);
          price_rule = price_rule_results[i];

          var valtopush = price_rule.getValue({
            name: "custrecord_nts_pr_item",
          });
          log.debug("valtopush", valtopush);

          var itemlookup = search.lookupFields({
            type: search.Type.ITEM,
            id: valtopush,
            columns: ["isinactive"]
          });
          log.debug("itemlookup", itemlookup.isinactive);

          if (!itemlookup.isinactive) {
            estimate.selectNewLine({
              sublistId: "item",
              line: i
            });

            estimate.setCurrentSublistValue({
              sublistId: "item",
              fieldId: "item",
              value: price_rule.getValue({
                name: "custrecord_nts_pr_item",
              }),
              forceSyncSourcing: true
            });

            estimate.setCurrentSublistValue({
              sublistId: "item",
              fieldId: "price",
              value: -1
            });
            estimate.setCurrentSublistValue({
              sublistId: "item",
              fieldId: "quantity",
              value: 1
            });

            estimate = nts_md_manage_item_master.item_pricing(estimate, price_rule);

            estimate.commitLine("item");
            log.debug("estimate line committed");
          }
        }

        log.debug('Next idx val: ', start_idx + nintyPercent);

        estimate.setValue({
          fieldId: "custbody_vel_price_list_idx",
          value: start_idx + nintyPercent
        });

        nxtIdx = estimate.getValue({
          fieldId: "custbody_vel_price_list_idx"
        });

        log.debug('nxtIdx value set: ', nxtIdx);

        log.debug("Estimate about to save");
        estimateId = estimate.save({
          enableSourcing: true,
          ignoreMandatoryFields: true
        });
      }
      
      if (price_rule_results.length - start_idx > nintyPercent) {
        log.debug('Recursive Call to continue building estimate: ', estimateId);
        var scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
        scriptTask.scriptId = 'customscript_vel_sch_get_price_lists';
        scriptTask.deploymentId = 'customdeploy_vel_sch_get_price_lists';
        scriptTask.params = { tt
          custscript_sch_price_list_customer: customer,
          custscript_sch_price_list_location: location,
          custscript_sch_price_list_estimate: estimateId
        };
        var scriptTaskId = scriptTask.submit();
      } else {
        estimate.setValue({
          fieldId: "custbody_vel_price_list_script_done",
          value: true
        });

        log.debug("Estimate finished, saving");
        estimate.save({
          enableSourcing: true,
          ignoreMandatoryFields: true
        });
      }
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
          ["custrecord_nts_pr_item.custitem_vmrd_sellable", "is", "T"]
        ],
        columns: [
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
        ]
      });

      return results(search_obj);
    }

    function recursiveDeploy(scriptId, recId) {
      const params = {};
      params.custscript_mr_po_ids = recId;
      var deploymentId = runtime.getCurrentScript().deploymentId;

      mhiLibTask.createMRTaskAndSubmit(scriptId, deploymentId, params);
    }

    function results(search_obj) {
      var results_array = [];
      var page = search_obj.runPaged({
        pageSize: 4000,
      });

      for (var i = 0; i < page.pageRanges.length; i++) {
        var pageRange = page.fetch({
          index: page.pageRanges[i].index,
        });
        results_array = results_array.concat(pageRange.data);
      }

      return results_array;
    }

    function date_to_string(date_instance) {
      var date_string = format.format({
        value: date_instance,
        type: format.Type.DATE,
      });

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
      execute: execute
    };
  }
);