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

      // log.debug("Printed: ", printed);
      addField(context);
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
    };
  }
);