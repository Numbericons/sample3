  /**
   *@NApiVersion 2.1
  *@NScriptType MapReduceScript
  *@Author   Zachary Oliver
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
          var search = searchCreate();

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
        const logOn = false;
        try {
          let result = context.value;1
          if (logOn) log.debug('result : ', result);
  
          const id = JSON.parse(result).values.internalid.value;
          if (logOn) log.debug('id : ', id);
  
          const estimateId = JSON.parse(result).values['internalid.createdFrom'].value;
          if (logOn) log.debug('estimateId : ', estimateId);

          setSOValues(id, estimateId);

          if (logOn) log.debug('Post map save SO');
  
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
            title: "END", details:
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

      function setSOValues(id, estimateId) {
        const logOn = true;
        var soValues = {};

        soValues['custbody_vel_date_quote_appr'] = getApprovedDate('estimate', estimateId, 'Open', 'Processed');
        if (logOn) log.debug('Quote approved date: ', soValues['custbody_vel_date_quote_appr']);
        
        soValues['custbody_vel_so_date_approved'] = getApprovedDate('salesorder', id, 'Pending Approval', 'Pending Fulfillment');
        if (logOn) log.debug('Sales Order approved date: ', soValues['custbody_vel_so_date_approved']);

        soValues = setChildValues(soValues, id, estimateId)

        const values = Object.keys(soValues);

        const salesOrder = record.load({
          type: "salesorder",
          id: id
        });

        if (logOn) log.debug('salesorder loaded');

        for (let i=0; i<values.length; i++){
          log.debug('values[i] : ', values[i]);
          if (soValues[values[i]]) {
            if (logOn) log.debug('Sanity check val: ', soValues[values[i]]);
            salesOrder.setValue({
              fieldId: values[i],
              value: soValues[values[i]],
            });
          }
        }

        salesOrder.save();
        return true;
      }

      function setChildValues(object, id, estimateId) {
        var estimateSearch = searchRelatedTrans('itemfulfillment', id);

        estimateSearch.run().each(function(result) {
          object['custbody_vel_if_creation_date'] = new Date(result.getValue({
              name: 'datecreated'
          }));
          log.debug('IF created date: ', object['custbody_vel_if_creation_date']);
          
          object['custbody_vel_if_date_picked'] = new Date(result.getValue({
            name: 'tranpickeddate'
          }));
          
          log.debug('IF picked date: ', object['custbody_vel_if_date_picked']);
        });

        var invoiceSearch = searchRelatedTrans('invoice', id);

        invoiceSearch.run().each(function(result) {
          object['custbody_vel_invoice_create_date'] = new Date(result.getValue({
              name: 'datecreated'
          }));
          log.debug('Invoice created date: ', object['custbody_vel_invoice_create_date']);
        });

        return object;
      }

      function getApprovedDate(type, id, oldVal, newVal) {
        const logOn = false;
        try {
          var transaction = searchApprovedDate(type, id, oldVal, newVal)//.run();
          var date;

          if (logOn) log.debug('Count of search results for type ' + type + ' : ' +  transaction.runPaged().count);

          transaction.run().each(function(result) {
            date = result.getValue({
                name: 'date',
                join: 'systemNotes'
            });
          });

          return !isEmpty(date) ? new Date(date) : false;
        } catch (errorObj) {
          log.error({
            title: "Error in getApprovedDate ",
            details: errorObj.toString(),
          },);
          throw errorObj;
        }
      }

      function searchApprovedDate(type, id, oldVal, newVal) {
        const typeFilter = type === 'estimate' ? 'Estimate' : 'SalesOrd';

        return search.create({
          type: type,
          filters:
          [
              ["type","anyof",typeFilter], 
              "AND", 
              ["mainline","is","T"], 
              "AND", 
              ["systemnotes.oldvalue","is",oldVal], 
              "AND", 
              ["systemnotes.newvalue","is",newVal],
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

      function searchRelatedTrans(type, id) {
        const typeFilter = type === 'itemfulfillment' ? 'ItemShip' : 'CustInvc';

        return search.create({
          type: type,
          filters:
          [
              ["type","anyof",typeFilter], 
              "AND", 
              ["mainline","is","T"], 
              "AND", 
              ["createdfrom.internalid","anyof",id]
          ],
          columns:
          [
              search.createColumn({name: "type", label: "Type"}),
              search.createColumn({name: "internalid", label: "Internal ID"}),
              search.createColumn({name: "transactionname", label: "Transaction Name"}),
              search.createColumn({name: "datecreated", label: "Date Created"}),
              search.createColumn({name: "tranpickeddate", label: "Picked Date"})
          ]
        });
      }

      function searchCreate() {
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
              ["internalid","anyof","4461652", "4464083", "4241740"]
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