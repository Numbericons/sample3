  define(
    ["N/record", "N/log", "N/search", "N/ui/dialog"],
    function (record, log, search, dialog) {
      //v113
      /**
      *@NApiVersion 2.1
      *@NScriptType clientScript
      */

      /*  Author: Zachary Oliver
      **  Version: v110
      */

      function runSearch(id) {
        var accountSearchObj = search.create({
          type: "account",
          filters:
          [
              ["internalid","is", id]
          ],
          columns:
          [
              search.createColumn({name: "displayname", label: "Display Name"}),
              search.createColumn({name: "type", label: "Account Type"}),
              search.createColumn({name: "custrecord1411", label: "Account Department"}),
              search.createColumn({
                name: "name",
                join: "CUSTRECORD1411",
                label: "Acc Dept Name"
              })
          ]
        });

        var searchResultCount = accountSearchObj.runPaged().count;
        console.log("accountSearchObj result count",searchResultCount);
        return accountSearchObj.run();
      }

      function findSLAccount(record) {
        var recAcc = record.getCurrentSublistValue({
          fieldId: 'account',
          sublistId: 'line'
        });

        return runSearch(recAcc);
      }

      function arrIncludes(valArr, val) {
        for (let k=0; k<valArr.length; k++){
          if (valArr[k] === val) return true;
        }
      }

      function setFieldAccDept(rec, id, accIds) {
        var lineIdx = rec.getCurrentSublistIndex({
          sublistId: 'line'
        });

        var lineSublist = rec.getSublistField({
          sublistId: 'line',
          fieldId: id,
          line: lineIdx
        });

        console.log('accountDept: ' + lineSublist);

        var options = lineSublist.getSelectOptions();

        console.log(options);

        for (let i=1; i<options.length; i++){
          if (!arrIncludes(accIds, options[i].value)) {
            lineSublist.removeSelectOption({
              value: options[i].value
            })
          }
        }
      }

      function departmentChange(context, currentRecord) {
        var accountDept = currentRecord.getCurrentSublistValue({
          sublistId: 'line',
          fieldId: 'custpage_account_dept_user_ev'
        });
        
        console.log('accountDept: ' + accountDept);
        
        currentRecord.setCurrentSublistValue({
          sublistId: 'line',
          fieldId: 'department',
          value: accountDept
        })
      }

      function accountChange(context, currentRecord) {
        console.log('sublist id: ' + context.sublistId);

        var account = findSLAccount(currentRecord);
        console.log('account found: ' + account);

        account.each(function(result) {
          console.log('Account search result all: ' + result);
          var entity = result.getValue({
              name: 'name'
          });

          var accDeptIds = result.getValue({
              name: 'custrecord1411'
          }).split(',');

          console.log('Account search name: ' + entity);
          console.log('Account search account dept: ' + accDeptIds);

          setFieldAccDept(currentRecord, 'custpage_account_dept_user_ev', accDeptIds);

          return true;
        });
      }

      function fieldChanged(context) {
        var currentRecord = context.currentRecord;

        if (context.fieldId === 'account') {
          accountChange(context, currentRecord);
        } else if (context.fieldId === 'custpage_account_dept_user_ev') {
          departmentChange(context, currentRecord);
        };
      }

      return {
        fieldChanged: fieldChanged
      };
    }
  );

  //when accoutn field on line level selected
  //  fieldChange triggers
  //    add new 'department' field sourced from accounts selected departments
  //       hide default 'department' field

  //get account department list from results [x]
  //  set options for acc dept
  //    save acc dept naturally - also transfer to department selected

  //___________________________________________________\\

  //grab account value set, lookup account [x]
  //  get accounts department sublist id array [x]

  //  search department id's []
  //    test setup - create a field on accounts [x]
  //      need department name to ultimately set department before save []
  //         actual search and run or simpler method, perhaps just set name of department []
  //  create department field clone [x]
  //    remove all id's not in department id array
  //      OR add all id's from department array if not pre-populated

  //note: scurrent record getColumn to set mandatory