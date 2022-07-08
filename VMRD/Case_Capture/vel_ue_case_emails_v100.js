define(["N/record", "N/search"],
  function (record, search) {
    /**
    *@NApiVersion 2.0
    *@NScriptType UserEventScript
    */

    function beforeSubmit(context) {
      log.debug("Script executed!", "True");
      
      const id = context.newRecord.getValue("id");
      log.debug("Case Id (assume missing since before submit)", id);

      log.debug("newRecord: ", context.newRecord);
      
      context.newRecord.setValue({
        fieldId: 'company',
        value: 348
      })
      
      log.debug("newRecord: ", context.newRecord);

      //checks if sales order has 'printedpickingticket' search filter === true
      // const printed = runSearch(id);
      // log.debug("Printed: ", printed);

      // if (printed) removeEditButton(context.type, context.form);
    }

    function removeEditButton(type, form) {
      if (type === "view") {
        form.removeButton("edit");
      }
    }

    function runSearch(id) {
      var salesorderSearchObj = search.create({
        type: "salesorder",
        filters: [
          ["type", "anyof", "SalesOrd"],
          "AND",
          ["printedpickingticket", "is", "T"],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["internalid", "anyof", id]
        ],
        columns: [
          search.createColumn({
            name: "transactionnumber",
            label: "Transaction Number",
          }),
          search.createColumn({ name: "internalid", label: "Internal ID" }),
        ]
      });
      return searchResultCount = salesorderSearchObj.runPaged().count;
    }

    return {
      beforeSubmit: beforeSubmit,
    };
  }
);