  /**
   *@NApiVersion 2.1
  *@NScriptType MapReduceScript
  *@Author  
  */
  /***********************************************************************
   * File:        MR | SO - Order Cycle Time.js
   * Date:        8/27/2022
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
        try {
          let result = context.value;1
          log.debug('result : ', result);
          log.debug('JSON.parse(result) ', JSON.parse(result));
  
          const id = JSON.parse(result).values.internalid.value;
          log.debug('id : ', id);
  
          const quoteId = JSON.parse(result).values['internalid.createdFrom'].value;
          log.debug('quoteId : ', quoteId);
          
          var approvedDate = getApprovedDate(quoteId);
          
          const salesOrder = record.load({
            type: "salesorder",
            id: id
          });
          log.debug('Map - approvedDate : ', approvedDate);
  
          salesOrder.setValue({
              fieldId: 'custbody_vel_date_quote_appr',
              value: approvedDate,
          });

          log.debug('Post set Value');

          salesOrder.save();
  
          return true;

        } catch (errorObj) {
          log.error({
            title: "Error in map ",
            details: errorObj.toString(),
          },);
          throw errorObj;
        }
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

      function getApprovedDate(id) {
        try {
          var quote = estimateApprovedSearch(id)//.run();
          var date;

          log.debug('Count of search results : ' + quote.runPaged().count);

          quote.run().each(function(result) {
            date = result.getValue({
                name: 'date',
                join: 'systemNotes'
            });
          });

          log.debug('getApprovedDate variable date : ', date);
          return new Date(date);

        } catch (errorObj) {
          log.error({
            title: "Error in getApprovedDate ",
            details: errorObj.toString(),
          },);
          throw errorObj;
        }
      }

      function estimateApprovedSearch(id) {
        return search.create({
          type: "estimate",
          filters:
          [
              ["type","anyof","Estimate"], 
              "AND", 
              ["mainline","is","T"], 
              "AND", 
              ["systemnotes.oldvalue","is","Pending Approval"], 
              "AND", 
              ["systemnotes.newvalue","is","Approved"],
              "AND",
              ["internalid","anyof", id]
          ],
          columns:
          [
              search.createColumn({name: "type", label: "Type"}),
              search.createColumn({name: "internalid", label: "Internal ID"}),
              search.createColumn({name: "transactionname", label: "Transaction Name"}),
              search.createColumn({
                name: "date",
                join: "systemNotes",
                label: "Date"
              })
          ]
        });
      }

      function createSearch() {
        return search.create({
          type: "salesorder",
          filters:
          [
              ["type","anyof","SalesOrd"], 
              "AND", 
              ["mainline","is","T"], 
              "AND", 
              ["custbody_vel_date_quote_appr","isempty",""], 
              "AND", 
              ["createdfrom.type","anyof","Estimate"],
              "AND", 
              ["internalid","anyof","4464063"]
          ],
          columns:
          [
              search.createColumn({name: "internalid", label: "Internal ID"}),
              search.createColumn({name: "type", label: "Type"}),
              search.createColumn({name: "transactionname", label: "Transaction Name"}),
              search.createColumn({
                name: "internalid",
                join: "createdFrom",
                label: "quoteId"
              })
          ]
        });
      }

      function dateFormat(string) {
        var date = new Date(string);

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        if (month.toString().length === 1) month = '0' + month.toString();
        if (day.toString().length === 1) day = '0' + day.toString();

        return month + "/" + day + "/" + year;
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