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

      const createOrEdit = context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT;
      if (!createOrEdit) return
      
      var id = context.newRecord.getValue({
        fieldId: 'id'
      })

      var customer = record.load({
        type: record.Type.CUSTOMER,
        id: id
      });

      var external = customer.getValue({
        fieldId: 'externalid'
      });

      if (external === "") {
        log.debug('Externalid was empty, updating to match internalid');
        customer.setValue({
          fieldId: 'externalid',
          value: id,
        });
  
        customer.save();
      }
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
      afterSubmit: afterSubmit
    };
  }
);