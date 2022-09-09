define(["N/record", "N/search", "N/redirect", "SuiteScripts/_work/srvc/design_to_build/code/nts_md_manage_item_master_v200"],
  function (record, search, redirect, nts_md_manage_item_master) {
    /**
    *@NApiVersion 2.0
    *@NScriptType UserEventScript
    */

    function afterSubmit(context) {      
      // const id = context.newRecord.getValue("id");
      // log.debug("Case Id (assume missing since before submit)", id);

      // log.debug("newRecord: ", context.newRecord);
      
      var customer = context.newRecord.getValue({
        fieldId: 'custrecord_vel_select_customer'
      })

      var customerTxt = context.newRecord.getText({
        fieldId: 'custrecord_vel_select_customer'
      })

      var domestic = context.newRecord.getValue({
        fieldId: 'custrecord_vel_domestic'
      })

      var international = context.newRecord.getValue({
        fieldId: 'custrecord_vel_international'
      })

      log.audit("newRecord international: ", international);

      //map reduce here
      
      var search = createSearch(customer, domestic, international);
      
      var searchRun = search.run();

      var count = search.runPaged().count;
      log.debug('count : ' + count);

      


      searchRun.each(function(result) {
        log.debug(result);
        nts_md_manage_item_master.item_pricing(null, result, dateFormat(), domestic, international, customerTxt)

        return true;
      });

      // redirect.toSearchResult({ search: search });
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

    function createSearch(cust, dom, int) {
      var date = dateFormat();

      var search_obj = search.create({
        type: "customrecord_nts_price_rule",
        filters: [
          ["isinactive", "is", "F"],
          "AND",
          ["custrecord_nts_pr_customer", "anyof", cust],
          "AND",
          ["custrecord_nts_pr_start_date", "onorbefore", date],
          "AND",
          [
            ["custrecord_nts_pr_end_date", "isempty", ""],
            "OR",
            ["custrecord_nts_pr_end_date", "onorafter", date],
          ],
          "AND",
          ["custrecord_nts_pr_item.custitem_vmrd_domestic", "is", dom],
          "AND",
          ["custrecord_nts_pr_item.custitem_vmrd_international", "is", int],
          "AND",
          ["custrecord_nts_pr_item.custitem_vmrd_sellable", "is", "T"],
          "AND",
          ["custrecord_nts_pr_item.isinactive","is","F"]
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
          search.createColumn({
            name: "weight",
            join: "CUSTRECORD_NTS_PR_ITEM",
            label: "Weight"
          })
        ]
      });
      return search_obj;
    }

    return {
      afterSubmit: afterSubmit
    };
  }
);