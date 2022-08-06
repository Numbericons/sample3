define(
  ["N/record", "N/log", "N/search", "N/ui/dialog"],
  function (record, log, search, dialog) {
    /**
    *@NApiVersion 2.1
    *@NScriptType clientScript
    */

    /*  Author: Zachary Oliver
    **  Version: v130
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
            search.createColumn({name: "custrecord_vel_acc_departments", label: "Account Department"})
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

      lineSublist = rec.getSublistField({
        sublistId: 'line',
        fieldId: id,
        line: lineIdx
      });


      console.log('lineSublist : ' + lineSublist)
      console.log('rec : ' + rec);
      
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

      console.log('select options from lineSublist after value: null: ', options);
            
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
        fieldId: 'custpage_account_dept_ue'
      });
      
      console.log('accountDept: ' + accountDept);
      
      currentRecord.setCurrentSublistValue({
        sublistId: 'line',
        fieldId: 'department',
        value: accountDept
      })
    }

    function newLine(currentRecord, lineIdx) {
      var subsidiary = currentRecord.getValue({
        fieldId: 'subsidiary'
      })

      console.log('subsidiary : ' + subsidiary);

      var tempClass = subsidiary === '1' ? '11' : '3';

      console.log('tempClass: ' + tempClass)

      currentRecord.setCurrentSublistValue({
        sublistId: 'line',
        fieldId: 'debit',
        value: '0'
      })

      currentRecord.setCurrentSublistValue({
        sublistId: 'line',
        fieldId: 'class',
        value: tempClass
      })

      currentRecord.commitLine({ sublistId: 'line' });

      currentRecord.selectLine({
          sublistId: 'line',
          line: lineIdx
      });
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

      if (source === 'fieldChanged') {
        console.log('get current sublist value since fieldChanged if newLine');
        var idx = currentRecord.getCurrentSublistIndex({sublistId: 'line'});
        var lines = currentRecord.getLineCount({sublistId: 'line'});
  
        if (idx + 1 > lines) {
          console.log('accountChange: idx + 1 > lines is true');
          return newLine(currentRecord, idx);
        }
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
            name: 'custrecord_vel_acc_departments'
        }).split(',');

        setFieldAccDept(currentRecord, 'custpage_account_dept_ue', accDeptIds, source);

        return true;
      });
    }

    function fieldChanged(context) {
      var currentRecord = context.currentRecord;

      if (context.fieldId === 'account') {
        accountChange(currentRecord, 'fieldChanged');
      } 
      if (context.fieldId === 'custpage_account_dept_ue') {
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
      lineInit: lineInit
    };
  }
);