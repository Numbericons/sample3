define(["N/record", "N/task", "N/search"],
  function (record, task, search) {
    /**
    *@NApiVersion 2.0
    *@NScriptType UserEventScript
    *Author: Zachary Oliver
    *Date: 9/2/2022
    */

    function afterSubmit(context) {      
      log.debug("newRecord: ", context.newRecord);
      
      var id = context.newRecord.getValue({
        fieldId: 'id'
      })

      var customer = record.load({
        type: record.Type.CUSTOMER,
        id: customer
      });

      customer.getValue({
        name: 'externalid'
      });

      if (missingExternal) {
        customer.setValue({
          fieldId: 'externalid',
          value: id,
        });
  
        customer.save();
      }
    }

    return {
      afterSubmit: afterSubmit
    };
  }
);