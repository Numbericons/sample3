define(["N/record", "N/search", "N/redirect"],
  function (record, search, redirect) {
    /**
    *@NApiVersion 2.0
    *@NScriptType UserEventScript
    */

    function afterSubmit(context) {      
      // const id = context.newRecord.getValue("id");
      // log.debug("Case Id (assume missing since before submit)", id);

      // log.debug("newRecord: ", context.newRecord);
      
      // context.newRecord.setValue({
      //   fieldId: 'company',
      //   value: 348
      // })
      
      // log.debug("newRecord: ", context.newRecord);

      //checks if sales order has 'printedpickingticket' search filter === true
      // const printed = runSearch(id);
      // log.debug("Printed: ", printed);

      // if (printed) removeEditButton(context.type, context.form);
      var search = runSearch("131");
      log.debug('Search obj: ', search);

      // var count = search.runPaged();
      // console.log('count : ' + count);
      
      var searchRun = search.run();
      log.debug('searchRun : ', + searchRun);

      searchRun.each(function(result) {
        log.debug(result);

        return true;
      });

      redirect.toSearchResult({ search: search });
    }

    function dateFormat() {
      var date = new Date

      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();

      if (month.toString().length === 1) month = '0' + month.toString();
      if (day.toString().length === 1) day = '0' + day.toString();

      return month + "/" + day + "/" + year;
    }

    function runSearch(customer) {
      var date = dateFormat();

      var search_obj = search.create({
        type: "customrecord_nts_price_rule",
        filters: [
          ["isinactive", "is", "F"],
          "AND",
          ["custrecord_nts_pr_customer", "anyof", customer],
          "AND",
          ["custrecord_nts_pr_start_date", "onorbefore", date],
          "AND",
          [
            ["custrecord_nts_pr_end_date", "isempty", ""],
            "OR",
            ["custrecord_nts_pr_end_date", "onorafter", date],
          ],
          "AND",
          ["custrecord_nts_pr_item.custitem_vmrd_domestic", "is", "T"],
          "AND",
          ["custrecord_nts_pr_item.custitem_vmrd_sellable", "is", "T"]
        ],
        columns: [
          search.createColumn({
            name: "name",
            label: "Name"
          }),
          search.createColumn({
            name: "scriptid",
            label: "Script ID"
          }),
          search.createColumn({
            name: "custrecord_nts_pr_start_date",
            label: "Start Date"
          }),
          search.createColumn({
            name: "custrecord_nts_pr_end_date",
            label: "End Date"
          }),
          search.createColumn({
            name: "custrecord_nts_pr_customer",
            label: "Customer"
          }),
          search.createColumn({
            name: "custrecord_nts_pr_item",
            sort: search.Sort.ASC,
            label: "Item"
          }),
          search.createColumn({
            name: "custrecord_nts_pr_calculation_method",
            label: "Calculation Method"
          }),
          search.createColumn({
            name: "custrecord_nts_pr_calculation_basis",
            label: "Calculation Basis"
          }),
          search.createColumn({
            name: "custrecord_nts_pr_adjust_pct",
            label: "Adjust %"
          }),
          search.createColumn({
            name: "custrecord_nts_pr_adjust_amt",
            label: "Adjust $"
          }),
          search.createColumn({
            name: "custrecord_nts_pr_tier_basis",
            label: "Tier Basis"
          }),
        ]
      });
      return search_obj;
    }

    return {
      afterSubmit: afterSubmit
    };
  }
);