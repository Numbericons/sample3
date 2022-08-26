  /**
   *@NApiVersion 2.1
  *@NScriptType MapReduceScript
  *@Author  
  */
  /***********************************************************************
   * File:        SK_ZO_MHI_Update_Inventory_Detail_V2.js
   * Date:        8/18/2018
   * Summary:
   * Author:       Zachary Oliver
   * Updates:     
   ***********************************************************************/
  define(
    ["N/record", "N/search", "N/runtime", "N/error", "N/task", "N/file", "N/format", "SuiteScripts/_work/srvc/design_to_build/code/nts_md_manage_item_master_v200"],
    (record, search, runtime, error, task, file, format, nts_md_manage_item_master) => {
      // item_pricing(estimate, price_rule, trandate, domestic, international, customerTxt).
      const getInputData = (context) => {
        try {
          var scriptObj = runtime.getCurrentScript();
          const customerId = scriptObj.getParameter({
            name: "custscript_customer_id",
          },);

          var search = createSearch(customerId, domestic, international);

          var count = search.runPaged().count;
          log.debug('Count of search results : ' + count);

          return search;
        } catch (e) {
          log.debug(
            "Error in getInputData Function",
            e.toString() + " >>> END <<< ",
          );
        }
      };

      const map = (context) => {
        let result = context.value;
        log.debug('JSON.parse(result) values: ', JSON.parse(result).values);

        const id = JSON.parse(result).values["internalid"].value;
        log.debug('id : ', id);

        const weight = JSON.parse(result).values["weight.CUSTRECORD_NTS_PR_ITEM"];
        const customerTxt = JSON.parse(result).values["altname.CUSTRECORD_NTS_PR_CUSTOMER"];
        const trandate = dateFormat();

        const booleanArr = JSON.parse(result).values["formulatext"].split(" ");
        log.debug('booleanArr : ', booleanArr);
        const domestic = booleanArr[1];
        log.debug('domestic : ', domestic);
        const international = booleanArr[3];
        log.debug('international : ', international);

        log.debug('domestic, international : ' + domestic) + " , " + international;

        const priceRule = record.load({
          type: "customrecord_nts_price_rule",
          id: id
        });

        nts_md_manage_item_master.item_pricing(null, priceRule, trandate, domestic, international, customerTxt, weight);

        return true;
      };

      const summarize = (summary) => {
        try {
          summary.output.iterator().each(function (key, value) {
            log.audit({
              title: " PO: " + key,
              details: value,
            },);
            const reduceValues = JSON.parse(value);
            log.debug("1st Object", reduceValues.values[0]);
            
            return true;
          },);

          log.audit({
            title: "END",
            details:
              "<---------------------------------END--------------------------------->",
          },);
        } catch (errorObj) {
          log.error({
            title: "(Summary) You were so close Error",
            details: errorObj.toString(),
          },);
          throw errorObj;
        }
      };

      function createSearch() {
        return search.create({
          type: "salesorder",
          filters: [
              ["type","anyof","SalesOrd"], 
              "AND", 
              ["externalidstring","isempty",""], 
              "AND", 
              ["mainline","is","T"], 
              "AND", 
              ["status","anyof","SalesOrd:B","SalesOrd:A","SalesOrd:E","SalesOrd:D"]
          ],
          columns: [
            search.createColumn({name: "transactionname", label: "Transaction Name"}),
            search.createColumn({name: "externalid", label: "External ID"}),
            search.createColumn({name: "internalid", label: "Internal ID"})
          ]
        });
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
        getInputData,
        map,
        summarize,
      };
    },
  );