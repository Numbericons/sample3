define(["N/record", "N/search", "N/ui/serverWidget"],
  function (record, search, serverWidget) {
    /**
    *@NApiVersion 2.1
    *@NScriptType UserEventScript
    */

    /** Author: Zachary Oliver
    * Version: v100
    */

    function beforeLoad(context) {
      const id = context.newRecord.getValue("id");

      addField(context);
    }
    
    function beforeSubmit(context) {
      var lineLength = context.newRecord.getLineCount({"sublistId": "line"});

      for (let i=0; i<lineLength; i++){
        var lineFields = context.newRecord.getSublistFields({
          sublistId: 'line'
        });

        log.debug('Line fields: ', lineFields);

        var accDept = context.newRecord.getSublistField({
          sublistId: 'line',
          fieldId: 'custpage_account_dept_user_ev',
          line: i
        });

        log.debug('Line: i + accDept: ', + i + ' accDept: ' + accDept);

        // context.newRecord.setSublistValue({
        //   sublistId: 'line',
        //   fieldId: 'department',
        //   line: i,
        //   value: accDept
        // });
      }
    }

    function addField(context) {
      var line = context.form.getSublist({id: 'line'});

      line.addField({
        id : 'custpage_account_dept_user_ev',
        type : serverWidget.FieldType.SELECT,
        label : 'Account Depatment Scripted',
        source: 'department'
      });
    }

    return {
      beforeLoad: beforeLoad,
      beforeSubmit: beforeSubmit
    };
  }
);