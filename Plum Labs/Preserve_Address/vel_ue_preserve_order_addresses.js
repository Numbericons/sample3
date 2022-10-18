/**
*@NApiVersion 2.x
*@NScriptType UserEventScript
*/

define(['N/error','N/search','N/record','N/workflow','N/runtime'],function(error,search,record,workflow,runtime) {
  function beforeSubmit(context) {
    if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
      var currentRecord = context.newRecord;
      
      retainAddress(currentRecord);
    }
  }Z

  function afterSubmit(context) {
    if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
      var currentRecord = context.newRecord;
      
      resetAddress(currentRecord);
    }
  }

  function resetAddress() {
    var shipKey = rec.getValue({
      fieldId: 'custbody_vel_preserve_ship_addr'
    });

    log.audit('Setting Default Ship Address field with key: ', shipKey);

    rec.setValue({
      fieldId: 'defaultilshipaddrkey',
      value: shipKey
    });

    log.debug('Saving rec!');
    rec.save();
    log.debug('Rec saved!');
  }
 
  function retainAddress(rec) {
    var shipKey = rec.getValue({
      fieldId: 'defaultilshipaddrkey'
    });

    log.audit('Setting Preserve Ship Address field with key: ', shipKey);

    rec.setValue({
      fieldId: 'custbody_vel_preserve_ship_addr',
      value: shipKey
    });
  }

  return {
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit
  };
});