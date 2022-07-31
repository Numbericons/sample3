define(
  ["N/record", "N/log", "N/search", "N/ui/dialog"],
  function (record, log, search, dialog) {
    //v113
    /**
    *@NApiVersion 2.1
    *@NScriptType clientScript
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
            search.createColumn({
              name: "name",
              sort: search.Sort.ASC,
              label: "Name"
            }),
            search.createColumn({name: "displayname", label: "Display Name"}),
            search.createColumn({name: "type", label: "Account Type"}),
            search.createColumn({name: "custrecord1411", label: "Account Department"})
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

    function setField(rec, id) {
      var accountDept = rec.getCurrentSublistValue({
        fieldId: id,
        sublistId: 'line'
      });

      console.log('Account Department from sublist: ' + accountDept);
    }

    function fieldChanged(context) {
      var currentRecord = context.currentRecord;

      if (context.fieldId === 'account') {
        console.log('Account change!')
        console.log('sublist id: ' + context.sublistId);

        var account = findSLAccount(currentRecord);
        console.log('account found: ' + account);

        //get account department list from results
        //  set options for acc dept
        //    save acc dept naturally - also transfer to department selected

        account.each(function(result) {
          console.log('Account search result all: ' + result);
            var entity = result.getValue({
                name: 'name'
            });
            var accDept = result.getValue({
                name: 'custrecord1411'
            }).split(',');
            console.log('Account search name: ' + entity);
            console.log('Account search account dept: ' + accDept);
            console.log('Account search account dept typeOf: ' + typeof accDept);

            for (var i=0; i<accDept.length; i++){
              console.log('Account dept id: ' + accDept[i]);
            }

            setField(currentRecord, 'custcol1');

            return true;
        });
      };
    }

    return {
      fieldChanged: fieldChanged
    };
  }
);
// dialog.alert({
//   title: 'Field changed!',
//   message: 'Field has changed: ' + context.fieldId
// });


// objRecord.setCurrentSublistValue({
//                 sublistId: 'item',
//                 fieldId: 'isclosed',
//                 line: i,
//                 value: true
//             });
//             objRecord.commitLine({ sublistId: "item" });

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