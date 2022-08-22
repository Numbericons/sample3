define(["N/record", "N/task", "N/search", "N/redirect", "SuiteScripts/_work/srvc/design_to_build/code/nts_md_manage_item_master_v200"],
  function (record, task, search, redirect, nts_md_manage_item_master) {
    /**
    *@NApiVersion 2.0
    *@NScriptType UserEventScript
    */

    function afterSubmit(context) {      
      log.debug("newRecord: ", context.newRecord);
      
      var customer = context.newRecord.getValue({
        fieldId: 'custrecord_vel_select_customer'
      })

      var customerTxt = context.newRecord.getText({
        fieldId: 'custrecord_vel_select_customer'
      })

      var domestic = context.newRecord.getValue({
        fieldId: 'custrecord_vel_domestic'
      })

      var international = context.newRecord.getValue({
        fieldId: 'custrecord_vel_international'
      })

      log.audit("newRecord international: ", international);

      var scriptTask = task.create({ taskType: task.TaskType.MAP_REDUCE });
        scriptTask.scriptId = "customscript_vel_mr_create_cust_price_r";
        scriptTask.deploymentId = "customdeploy_vel_mr_create_cust_price_rl";

      scriptTask.params = {
          custscript_customer_id: customer,
          custscript_customer_name: customerTxt,
          custscript_domestic: domestic,
          custscript_international: international
      };

      log.debug('About to submit script')
      scriptTask.submit();
      log.debug('After submit script')

      // redirect.toSearchResult({ search: search });
    }

    return {
      afterSubmit: afterSubmit
    };
  }
);