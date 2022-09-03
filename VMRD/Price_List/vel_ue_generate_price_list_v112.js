define(["N/record", "N/task", "N/search", "N/redirect", "SuiteScripts/_work/srvc/design_to_build/code/nts_md_manage_item_master_v200"],
  function (record, task, search, redirect, nts_md_manage_item_master) {
    /**
    *@NApiVersion 2.0
    *@NScriptType UserEventScript
    */

    function afterSubmit(context) {      
      log.debug("newRecord: ", context.newRecord);
      
      var id = context.newRecord.getValue({
        fieldId: 'id'
      })

      var customer = context.newRecord.getValue({
        fieldId: 'custrecord_vel_select_customer'
      })

      var custRec = record.load({
        type: record.Type.CUSTOMER,
        id: customer
      });

      var customerTxt = custRec.getValue({
        fieldId: 'altname'
      })
      log.debug('customerTxt : ', customerTxt);

      submitDelete();

      submitCreate();
      // redirect.toSearchResult({ search: search });
    }

    function submitDelete() {
      var scriptTask = task.create({ taskType: task.TaskType.MAP_REDUCE });
      scriptTask.scriptId = "customscript_vel_cust_pl_delete";
      scriptTask.deploymentId = "customdeploy_vel_mr_delete_cust_pl";

      log.debug('About to submit delete script');
      scriptTask.submit();
      log.debug('After submit delete script');
    }

    function submitCreate() {
      var domestic = context.newRecord.getValue({
        fieldId: 'custrecord_vel_domestic'
      })

      var international = context.newRecord.getValue({
        fieldId: 'custrecord_vel_international'
      })

      log.audit("newRecord international: ", international);

      var scriptTask2 = task.create({ taskType: task.TaskType.MAP_REDUCE });
        scriptTask2.scriptId = "customscript_vel_mr_create_cust_price_r";
        scriptTask2.deploymentId = "customdeploy_vel_mr_create_cust_price_rl";

      scriptTask2.params = {
        custscript_record_id: id,
        custscript_customer_id: customer,
        custscript_customer_name: customerTxt,
        custscript_domestic: domestic,
        custscript_international: international
      };

      log.debug('About to submit create script')
      scriptTask2.submit();
      log.debug('After submit create script')
    }

    return {
      afterSubmit: afterSubmit
    };
  }
);