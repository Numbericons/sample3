/*  Author: Zachary Oliver
**  Version: v100
**  Date: 9/21/2022
*/

define(
  ["N/record", "N/log", "N/search"],
  function (record, log, search, dialog) {
    /**
    *@NApiVersion 2.1
    *@NScriptType clientScript
    */
    
    function entityChange(currentRecord) {
      var address = currentRecord.getValue({
        fieldId: 'custbody_vel_preserve_ship_addr'
      });

      log.audit('Setting default ship addr w/ id: ', address);
      
      // currentRecord.setValue({
      //   fieldId: 'defaultilshipaddrkey',
      //   value: address
      // });

      currentRecord.setValue({
        fieldId: 'shipaddresslist',
        value: address
      });

      currentRecord.setValue({
        fieldId: 'custpage_ship_to_address',
        value: address
      });
    }

    function fieldChanged(context) {
      var currentRecord = context.currentRecord;

      if (context.fieldId === 'entity') {
        console.log('fieldId (entity) match!')
        entityChange(currentRecord);
      };
    }

    return {
      fieldChanged: fieldChanged
    };
  }
);