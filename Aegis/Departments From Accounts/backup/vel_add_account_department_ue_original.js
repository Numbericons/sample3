define(["N/record", "N/search", "N/ui/serverWidget"],
  function (record, search, serverWidget) {
    /**
    *@NApiVersion 2.1
    *@NScriptType UserEventScript
    */

    /** Author: Zachary Oliver
    * Version: v100
    */

    function beforeLoad(context) {
      const id = context.newRecord.getValue("id");

      addField(context);
      setSublistField(context);
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
      console.log("accountSearchObj result count",searchResultCount);
      return accountSearchObj.run();
    }

    function setSublistField(context) {
      var lineLength = context.newRecord.getLineCount({"sublistId": "line"});
      log.debug('Lines: ', lineLength);

      for (let i=0; i<lineLength; i++){
        var slAccount = context.newRecord.getSublistValue({
          sublistId: 'line',
          fieldId: 'account',
          line: i
        });
      
        log.debug('Line: i + slAccount: ', + i + ' slAccount: ' + slAccount);
        
        var account = runSearch(slAccount);
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

    function addField(context) {
      var line = context.form.getSublist({id: 'line'});

      line.addField({
        id : 'custpage_account_dept_user_ev',
        type : serverWidget.FieldType.SELECT,
        label : 'Account Depatment Scripted',
        source: 'department'
      });
    }

    return {
      beforeLoad: beforeLoad
    };
  }
);