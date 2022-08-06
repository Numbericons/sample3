define(["N/record", "N/search", "N/ui/serverWidget"],
  function (record, search, serverWidget) {
    /**
    *@NApiVersion 2.1
    *@NScriptType UserEventScript
    */

    /** Author: Zachary Oliver
    * Version: v110
    */

    function beforeLoad(context) {
      const id = context.newRecord.getValue("id");

      addField(context);
      // setSublistField(context);
    }

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
      log.debug("accountSearchObj result count",searchResultCount);
      return accountSearchObj.run();
    }

    function setFieldAccDept(rec, id, accIds, idx) {
        var lineSublist = rec.getSublistField({
          sublistId: 'line',
          fieldId: id,
          line: idx
        });

        log.debug('accountDept', lineSublist);

        var options = lineSublist.getSelectOptions();

        log.debug('lineSublist.getSelectOptions', options);

        // for (let i=1; i<options.length; i++){
        //   if (!arrIncludes(accIds, options[i].value)) {
        //     lineSublist.removeSelectOption({
        //       value: options[i].value
        //     })
        //   }
        // }
      }

    function setSublistField(context) {
      var lineLength = context.newRecord.getLineCount({"sublistId": "line"});

      for (let i=0; i<lineLength; i++){
        var slAccount = context.newRecord.getSublistValue({
          sublistId: 'line',
          fieldId: 'account',
          line: i
        });
      
        // log.debug('Line: i + slAccount: ', + i + ' slAccount: ' + slAccount);
        
        var account = runSearch(slAccount);

        account.each(function(result) {
          log.debug('Account search result all: ' + result);

          var accDeptIds = result.getValue({
              name: 'custrecord1411'
          }).split(',');

          log.debug('Account search account dept: ' + accDeptIds);

          setFieldAccDept(context.newRecord, 'custpage_account_dept_ue', accDeptIds, i);

          return true;
        });
      }
    //search for account by id
    //  find acceptable list of departments
    //    remove options not applicable

    // context.newRecord.setSublistValue({
    //   sublistId: 'line',
    //   fieldId: 'department',
    //   line: i,
    //   value: accDept
    // });
    }

    function addField(context) {
      var line = context.form.getSublist({id: 'line'});

      line.addField({
        id : 'custpage_account_dept_ue',
        type : serverWidget.FieldType.SELECT,
        label : 'Account Department',
        source: 'department'
      });
    }

    return {
      beforeLoad: beforeLoad
    };
  }
);