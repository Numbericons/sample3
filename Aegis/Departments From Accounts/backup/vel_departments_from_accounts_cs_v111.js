define(
  ["N/record", "N/log", "N/search", "N/ui/dialog"],
  function (record, log, search, dialog) {
    //v113
    /**
    *@NApiVersion 2.1
    *@NScriptType clientScript
    */

    /*  Author: Zachary Oliver
    **  Version: v111
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

      return accountSearchObj;
    }

    function deptSearch() {
      var departmentSearchObj = search.create({
        type: "department",
        filters: [],
        columns:
          [
              search.createColumn({name: "internalid", label: "Internal ID"}),
              search.createColumn({
                name: "name",
                sort: search.Sort.ASC,
                label: "Name"
              })
          ]
      });
      return departmentSearchObj.run();
    }

    function setDeptObj() {
      var deptResults = deptSearch();
      var deptMap = {};
      
      deptResults.each(function(result) {
        var id = result.getValue({
            name: 'internalid'
        })

        var name = result.getValue({
            name: 'name'
        })

        deptMap[id] = name;

        return true;
      });

      return deptMap;
    }

    function findSLAccount(record, recAcc) {
      console.log('recAcc from findSLAccount : ' + recAcc);
      return runSearch(recAcc);
    }

    function arrIncludes(valArr, val) {
      for (let k=0; k<valArr.length; k++){
        if (valArr[k] === val) return true;
      }
    }

    function optionIncludes(valArr, val) {
      for (let k=0; k<valArr.length; k++){
        if (valArr[k].value === val) return true;
      }
    }

    function setFieldAccDept(rec, id, accIds, source) {
      var depts = setDeptObj();

      var lineIdx = rec.getCurrentSublistIndex({
        sublistId: 'line'
      });

      console.log('sublistField source + Rec + id + accIds + lineIdx: ' + source + ' ' + rec + ' ' + id + ' ' + accIds + ' ' + lineIdx);
      var lineSublist;
        if (source === 'fieldChanged') {
          console.log('get current sublist value since fieldChanged');

          // lineSublist = rec.getCurrentSublistValue({
          //   sublistId: 'line',
          //   fieldId: id
          // })
          // lineSublist = rec.getSublistField({
          //   sublistId: 'line',
          //   fieldId: id,
          //   line: lineIdx
          // });
        } else {
          lineSublist = rec.getSublistField({
          sublistId: 'line',
          fieldId: id,
          line: lineIdx
        });

        }
        console.log('lineSublist : ' + lineSublist)
      console.log('rec : ' + rec);
      console.log('rec.getSublistField : ' + rec.getSublistField);
        // } else if (source === 'lineInit') {
        //   console.log('get idx sublist value since lineInit');
        //   var lineSublist = rec.getSublistField({
        //     sublistId: 'line',
        //     fieldId: id,
        //     line: lineIdx
        //   });  
        //
        
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

        for (let k=0; k<accIds.length; k++){
          if (!optionIncludes(options, accIds[k])) {
            console.log('options did not include accIds[k] -> need to add ');
            lineSublist.insertSelectOption({
              value: accIds[k],
              text: depts[accIds[k]]
            })
          }
        }


        var optionsPost = lineSublist.getSelectOptions();
        console.log('select options from lineSublist post removal and add: ', optionsPost);
      
    }

    function departmentChange(currentRecord) {
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

    function accountChange(currentRecord, source) {
      var recAcc = currentRecord.getCurrentSublistValue({
        fieldId: 'account',
        sublistId: 'line'
      });

      if (!recAcc) {
        console.log('No recAcc (accountChange)');
        return;
      }

      var account = findSLAccount(currentRecord, recAcc);

      console.log("About to log account result count",count);
      var count = account.runPaged().count;
      console.log("account result count",count);

      if (!count > 0) {
        console.log('No search results (accountChange)');
        return;
      }

      account.run().each(function(result) {
        var accDeptIds = result.getValue({
            name: 'custrecord1411'
        }).split(',');

        setFieldAccDept(currentRecord, 'custpage_account_dept_user_ev', accDeptIds, source);

        return true;
      });
    }

    function fieldChanged(context) {
      var currentRecord = context.currentRecord;

      if (context.fieldId === 'account') {
        accountChange(currentRecord, 'fieldChanged');
      } 
      if (context.fieldId === 'custpage_account_dept_user_ev') {
        departmentChange(currentRecord);
      };
    }

    function lineInit(context) {
      var currentRecord = context.currentRecord;

      console.log('Line Init context: ' + context);
      console.log('Line Init context JSONIFY: ' + JSON.stringify(context));
      console.log('LineInit Current Record: ' + currentRecord);

      accountChange(currentRecord, 'lineInit');
    }

    return {
      fieldChanged: fieldChanged,
      // lineInit: lineInit
    };
  }
);


//work with limitation of always selecting lines
//  could validate submissions to make sure an incorrect department wasn't selected

