  /**
   *@NApiVersion 2.1
  *@NScriptType MapReduceScript
  *@Author  
  */
  /***********************************************************************
   * File:        Delete Customer Price List Records v100
   * Date:        8/18/2022
   * Summary:
   * Author:       Zachary Oliver
   * Notes:     Removes all previous custom records to avoid overlap, can update function to target same criteria previous records
   ***********************************************************************/
  define(
    ["N/record", "N/search", "N/runtime", "N/error", "N/task", "N/file", "N/format"],
    (record, search, runtime, error, task, file, format) => {
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
        log.debug('JSON.parse(result) values: ', JSON.parse(result).values);

        const id = JSON.parse(result).values["internalid"].value;
        log.debug('id : ', id);

        record.delete({
          type: 'customrecord_vel_customer_pr_rule',
          id: id
        })

        log.debug('Deleted id : ', id);

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
      }

      function createSearch() {
        return search.create({
          type: "customrecord_vel_customer_pr_rule",
          filters:
          [],
          columns:
          [
              search.createColumn({name: "internalid", label: "Internal ID"}),
              search.createColumn({
                name: "name",
                label: "Name"
              })
          ]
        });
      }

      return {
        getInputData,
        map,
        summarize,
      };
    },
  );