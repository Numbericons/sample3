  /**
  *@NApiVersion 2.x
  *@NScriptType UserEventScript
  *Version: v110
  */

  define(['N/error','N/search','N/record','N/workflow','N/runtime'],function(error,search,record,workflow,runtime) {
    function beforeSubmit(context) {
      if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
        var currentRecord = context.newRecord;
        
        retainAddress(currentRecord);
      }
    }

    function afterSubmit(context) {
      try {
        throw('Queueing preserve address afterSubmit');
      } catch(e) {
        if (context.type == context.UserEventType.EDIT) {
          var currentRecord = context.newRecord;
          
          resetAddress(currentRecord);
        }
      }
    }

    function resetAddress(rec) {
      var id = rec.getValue({
        fieldId: 'id'
      });

      log.audit('Record id: ', id);

      var shipKey = rec.getValue({
        fieldId: 'custbody_vel_preserve_ship_addr'
      });

      log.audit('Setting Default Ship Address field with key: ', shipKey);

      // record.submitFields({
      //   type: 'salesorder',
      //   id: id,
      //   values: {
      //     'defaultilshipaddrkey': shipKey
      //   },
      //   options: {
      //     enableSourcing: false,
      //     ignoreMandatoryFields : true
      //   }
      // });
      var existingRec = record.load({
					type: record.Type.SALES_ORDER,
					id: id,
					isDynamic: true
				});

      existingRec.setValue({
        fieldId: 'custbody_pli_shipto_end_user',
        value: shipKey
      });

      existingRec.save();
      
      var newDefault = existingRec.getValue({ fieldId: 'custbody_pli_shipto_end_user' });
      log.debug('newDefault shipaddr: ', newDefault);
      
      log.debug('Rec saved!');
    }
  
    function retainAddress(rec) {
      var shipKey = rec.getValue({
        fieldId: 'defaultilshipaddrkey'
      });

      var entity = rec.getValue({
        fieldId: 'entity'
      });

      log.audit('Setting Preserve Ship Address field with key: ', shipKey);
      
      rec.setValue({
        fieldId: 'custbody_vel_preserve_ship_addr',
        value: shipKey
      });

      log.audit('Setting Preserve Entity field with key: ', entity);

      rec.setValue({
        fieldId: 'custbody_vel_preserve_entity',
        value: entity
      });
    }

    return {
      beforeSubmit: beforeSubmit,
      // afterSubmit: afterSubmit
    };
  });