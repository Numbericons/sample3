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

    function setFieldAccDept(rec, id, accIds, idx) {
      console.log('idx is: ', idx);
      var lineIdx = idx ? idx - 1 : rec.getCurrentSublistIndex({ //pass a non-zero number then adjust
        sublistId: 'line'
      });

      console.log('variables before get sublistField');
      console.log('Rec + id + accIds + lineIdx: ' + rec + ' ' + id + ' ' + accIds + ' ' + lineIdx);

      var lineSublist = rec.getSublistField({
        sublistId: 'line',
        fieldId: id,
        line: lineIdx
      });

      var options = lineSublist.getSelectOptions();

      console.log('select options from lineSublist pre: ', options);
      
      for (let i=1; i<options.length; i++){
        if (!arrIncludes(accIds, options[i].value)) {
          console.log('Array did not include option');
          lineSublist.removeSelectOption({
            value: options[i].value
          })
        }
      }

      var optionsPost = lineSublist.getSelectOptions();
      console.log('select options from lineSublist post removal: ', optionsPost);

      for (let k=0; k<accIds.length; k++){
        if (!arrIncludes(options, arrIds[k])) {
          console.log('options did not include arrIds[k] -> need to add ')
        }
      }

      var optionsPost = lineSublist.getSelectOptions();
      console.log('select options from lineSublist post removal and add: ', optionsPost);
    }

    // function setInitialAccDept(rec) {
    //   var lines = rec.getLineCount({"sublistId": "line"})
    //   console.log('Page init lines to set count: ' + lines);
      
    //   for (let i=0; i<lines; i++){
    //     var slAccount = rec.getSublistValue({
    //       sublistId: 'line',
    //       fieldId: 'account',
    //       line: i
    //     });

    //     console.log('slAccount from getSLField: ' + slAccount);

    //     var account = runSearch(slAccount);

    //     account.each(function(result) {
    //       var accDeptIds = result.getValue({
    //           name: 'custrecord1411'
    //       }).split(',');

    //       console.log('Page Init account search account dept: ' + accDeptIds);

    //       setFieldAccDept(rec, 'custpage_account_dept_user_ev', accDeptIds, i+1);

    //       return true;
    //     });
    //   }
    // }

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
      var account = findSLAccount(currentRecord);
      console.log('account found: ' + account);

      account.each(function(result) {
        console.log('Account search result all: ' + result);

        var accDeptIds = result.getValue({
            name: 'custrecord1411'
        }).split(',');

        setFieldAccDept(currentRecord, 'custpage_account_dept_user_ev', accDeptIds);

        return true;
      });
    }

    function fieldChanged(context) {
      var currentRecord = context.currentRecord;

      if (context.fieldId === 'account') {
        accountChange(context, currentRecord);
      } 
      else if (context.fieldId === 'custpage_account_dept_user_ev') {
        departmentChange(context, currentRecord);
      };
    }

    function lineInit(context) {
      var currentRecord = context.currentRecord;

      accountChange(context, currentRecord);
    }

    return {
      fieldChanged: fieldChanged,
      lineInit: lineInit
    };
  }
);