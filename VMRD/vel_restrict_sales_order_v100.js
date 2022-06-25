define(['N/record', 'N/search'], function (record, search) {
  /**
  *@NApiVersion 2.0
  *@NScriptType UserEventScript
  */

  function beforeLoad(context) {
    log.debug("Context: ", context);

    const record = JSON.stringify(JSON.stringify(context.currentRecord));
    log.debug("record: ", record);

    // const printed = context.record.getValue("'printedpickingticket'");
    // log.debug("Printed: ", printed);

    removeEditButton(context.type, context.form); //context.UserEventType
  }

  function removeEditButton(type, form) {
    log.debug("Form: ", form);
    log.debug("Type: ", type);
    if (type === "view") {
      form.removeButton("edit");
    }
  }

  return {
      beforeLoad: beforeLoad
  }
});