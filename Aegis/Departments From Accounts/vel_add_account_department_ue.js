define(["N/record", "N/search", "N/ui/serverWidget"],
  function (record, search, serverWidget) {
    /**
    *@NApiVersion 2.1
    *@NScriptType UserEventScript
    */

    /** Author: Zachary Oliver
    * Version: v120
    */

    function beforeLoad(context) {
      const id = context.newRecord.getValue("id");

      addField(context);
    }

    function addField(context) {
      var line = context.form.getSublist({id: 'line'});

      line.addField({
        id : 'custpage_account_dept_ue',
        type : serverWidget.FieldType.SELECT,
        label : 'Account Department',
        source: 'department'
      });
    }

    return {
      beforeLoad: beforeLoad
    };
  }
);