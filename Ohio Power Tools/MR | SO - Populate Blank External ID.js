  /**
   *@NApiVersion 2.1
  *@NScriptType MapReduceScript
  *@Author  
  */
  /***********************************************************************
   * File:        MR | SO - Populate Blank External ID.js
   * Date:        8/18/2022
   * Summary:
   * Author:       Zachary Oliver
   * Updates:     
   ***********************************************************************/
  define(
    ["N/record", "N/search", "N/runtime", "N/error"],
    (record, search, runtime, error) => {
      const getInputData = (context) => {
        try {
          var search = createSearch();

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
        log.debug('result : ', result);
        log.debug('JSON.parse(result) ', JSON.parse(result));

        const id = JSON.parse(result).value;
        log.debug('id : ', id);

        const customer = record.load({
          type: "customer",
          id: id
        });

        customer.setValue({
            fieldId: 'externalid',
            value: id,
        });

        customer.save();

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
          type: "customer",
          filters:
          [
              ["externalidstring","isempty",""],
              "AND"
              ["internalid","anyof","4019"],
          ],
          columns:
          [
              search.createColumn({name: "altname", label: "Name"}),
              search.createColumn({name: "internalid", label: "Internal ID"}),
              search.createColumn({name: "externalid", label: "External ID"})
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