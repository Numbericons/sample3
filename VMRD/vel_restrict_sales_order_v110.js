define(
  ["N/record", "N/search", "N/ui/dialog"],
  function (record, search, dialog) {
    /**
    *@NApiVersion 2.0
    *@NScriptType clientScript
    */

    function pageInit(context) {
      const record = context.currentRecord;
      log.debug("Record: ", record);
      const id = record.id;

      //checks if sales order has 'printedpickingticket' search filter === true
      const printed = runSearch(id);
      log.debug("Printed: ", printed);

      if (printed) {
        dialog.confirm({
          title: "Sales Order has been printed!",
          message: "This Sales Order has already been printed!",
        },).then(handleResponse);
      }
    }

    function handleResponse(result) {
      log.debug(result);
      log.debug("OK/Cancel has been selected");
      return true;
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
          ["internalid", "anyof", id],
        ],
        columns: [
          search.createColumn({
            name: "transactionnumber",
            label: "Transaction Number",
          },),
          search.createColumn({ name: "internalid", label: "Internal ID" }),
        ],
      },);
      return searchResultCount = salesorderSearchObj.runPaged().count;
    }

    return {
      pageInit: pageInit,
    };
  },
);