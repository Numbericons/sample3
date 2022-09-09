/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 *@Author  
*/
/***********************************************************************
 * File:        SK_ZO_MHI_Update_Inventory_Detail_V2.js
 * Date:        3/4/2021
 * Summary:
 * Author:       Zachary Oliver
 * Updates:     Clean up code
 ***********************************************************************/
define(['N/record', 'N/search', 'N/runtime', 'N/error', 'N/task', 'N/file'], (record, search, runtime, error, task, file) => {
  const getInputData = (context) => {
    try {
      var scriptObj = runtime.getCurrentScript();
      const customer = scriptObj.getParameter({ name: 'custscript_price_list_customer' });
      const location = scriptObj.getParameter({ name: 'custscript_price_list_location' });
      var bodyObj = {};
      bodyObj.properties = [];
      bodyObj.properties.push({ customer: customer, location: location });
      return { reduceValues: bodyObj };

    } catch (e) { log.debug("Error in getInputData Function", e.toString() + " >>> END <<< "); }
  };

  // const map = (map) => { };

  const reduce = (context) => {
    const obj = JSON.parse(context.values);
    log.debug('obj: ', obj);
    log.debug('obj props: ', obj.properties[0]);
    log.debug('Customer: ', obj.properties[0].customer);
    log.debug('Location: ', obj.properties[0].location);
    log.debug('Estimate: ', obj.properties[0].estimateId);

    const priceList = generate_price_list_dom(obj.properties[0].customer, obj.properties[0].location, obj.properties[0].estimateId);

    context.write({
      key: obj.properties[0].customer,
      value: priceList,
    },);

    return true;
  };

  const summarize = (summary) => {
    try {
      summary.output.iterator().each(function (key, value) {
        log.audit({
          title: ' PO: ' + key,
          details: value
        });
        const reduceValues = JSON.parse(value);
        log.debug('1st Object', reduceValues.values[0]);
        // const finished = updateInventoryDetails(reduceValues.values[0].poParentId, reduceValues);

        // if (finished) updatePo(reduceValues.values[0].poParentId);
        return true;
      });

      log.audit({ title: 'Reduce Time Total (seconds)', details: summary.reduceSummary.seconds });
      log.audit({ title: 'Max Concurrency Utilized ', details: summary.reduceSummary.concurrency });
      log.audit({ title: 'END', details: '<---------------------------------END--------------------------------->' });
    } catch (errorObj) {
      log.error({ title: '(Summary) You were so close Error', details: errorObj.toString() });
      throw errorObj;
    }
  };

  function generate_price_list_dom(customer, location, estimate) {
    var estimate_results = {
      estimate_id: "",
    };
    var price_rule;

    var price_rule_results = query_price_rules_dom(
      customer,
      date_to_string(new Date()),
    );

    if (price_rule_results.length > 0) {
      // var estimate = record.create({
      //   type: record.Type.ESTIMATE,
      //   isDynamic: true,
      // },);

      var estimate = record.load({
        type: record.Type.ESTIMATE,
        id: estimate,
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

  ////////////// Helper Functions ///////////////////

  // const recursiveDeploy = (scriptId, recId) => {
  //   const params = {};
  //   params.custscript_mr_po_ids = recId;
  //   var deploymentId = runtime.getCurrentScript().deploymentId;

  //   mhiLibTask.createMRTaskAndSubmit(scriptId, deploymentId, params);
  // }

  // const submitTask = (scriptId, params, scheduled) => {
  //   if (scheduled) {
  //     return mhiLibTask.createSchedTaskAndSubmit(scriptId, null, params);
  //   } else {
  //     return mhiLibTask.createMRTaskAndSubmit(scriptId, null, params);
  //   }
  // }

  // const deployScript = (scriptId, recId, scheduled) => {
  //   const params = {};
  //   params.custscript_po_id = recId;

  //   var stScriptTaskId = submitTask(scriptId, params, scheduled);
    
  //   // if no available deployment, create deployment record and submit
  //   if (stScriptTaskId == 'NO_DEPLOYMENTS_AVAILABLE') {
      
  //     // create deployment record by copying default deployment
  //     const stDeploymentSID = mhiLibTask.copyDeploymentRecord(scriptId);
      
  //     // trigger script using new deployment
  //     submitTask(scriptId, params, scheduled);
  //   }
  // }
  
  function getUsageInfo() {
    var script = runtime.getCurrentScript();
    log.debug({
      "title": "Governance Monitoring",
      "details": "Remaining Usage = " + script.getRemainingUsage()
    });
  }

  function isEmpty(stValue) {
    if ((stValue == '') || (stValue == null) || (stValue == undefined)) {
      return true;
    } else {
      if (stValue instanceof String) {
        if ((stValue == '')) {
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
    reduce,
    summarize
  };
});