// v100

function postResponseMap(options) {
  for (let k = 0; k < options.postResponseMapData[0].prepayments.length; k++) {
    const payment = options.postResponseMapData[0].prepayments[k];
    options.postResponseMapData[0].lines.push(payment);
  }

  return options.postResponseMapData;
}

const options = {
  "postResponseMapData": [
    {
      "lines": [
        {
          "id": "3600212",
          "recordType": "vendorbill",
          "Date": "4/1/2022",
          "Type": "Bill",
          "Due Date/Receive By": "4/1/2022",
          "Vendor": "Hyde Park Village",
          "Document Number": "040122Tampa",
          "Amount": "17797.57",
          "Memo (Main)": "April Rent",
          "Transaction Number": "VENDBILL1417",
          "Expected Pay Date": "",
          "Recurring or Non Recurring Expense": "",
          "Subsidiary (no hierarchy)": "Kittenish Tampa",
          "dataURI": "https://5344479.app.netsuite.com/app/accounting/transactions/vendbill.nl?id=3600212&compid=5344479",
          "floatAmount": 17797.57
        }
      ],
      "prepayments": [
        {
          "id": "3606572",
          "recordType": "purchaseorder",
          "Date": "2/8/2022",
          "Type": "Purchase Order",
          "Due Date/Receive By": "6/2/2022",
          "Vendor": "Acoa",
          "Document Number": "PO0000601",
          "Amount": [
            "27470.00",
            "8040.00"
          ],
          "Memo (Main)": "",
          "Transaction Number": "PURCHORD601",
          "Expected Pay Date": "3/24/2022",
          "Recurring or Non Recurring Expense": "Non Recurring",
          "Subsidiary (no hierarchy)": "Kittenish Online",
          "Due Date": "3/23/2022",
          "Name": "30% Prepayment per Keeley",
          "Prepayment": "Purchase Order #PO0000601",
          "Prepayment Paid": "F"
        }
      ]
    }
  ],
  "_exportId": "6243415407869801f4166595",
  "_connectionId": "5fa34d98fdaddb7eadf1f23c",
  "_flowId": "62326d30632b8e14ff0d6cf7",
  "_integrationId": "62326d004c899123a43217c9",
  "settings": {
    "integration": {},
    "flowGrouping": {},
    "flow": {},
    "export": {},
    "connection": {}
  }
};

const result = postResponseMap(options);
console.log(result);

// {{{ id }}}, "{{{Date}}}", "{{{Type}}}", "{{{[Due Date/Receive By]}}}", "{{{Vendor}}}", "{{{[Document Number]}}}", "", "{{{floatAmount}}}", "{{{[Memo (Main)]}}}", "{{{[Document Number]}}}", "{{{[Expected Pay Date]}}}", "{{{[Recurring or Non Recurring Expense]}}}"]