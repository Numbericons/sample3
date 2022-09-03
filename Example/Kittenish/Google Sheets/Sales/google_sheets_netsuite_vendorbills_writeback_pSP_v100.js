// v100

function preSavePage(options) {
  const dateIdx = options.data[0].values[0].indexOf("EXPECTED PAY DATE");
  let vendorBills = { bills: [] };

  for (let k=1; k<options.data[0].values.length; k++) {
    let bill = {
      id: options.data[0].values[k][0], expectedPayDate: options.data[0].values[k][dateIdx]
    };

    vendorBills.bills.push(bill);
  }

  return {
    data: [vendorBills],
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}

const options = {
  "data": [
    {
      "range": "GSheet_to_NetSuite_Export_Data!A1:L1000",
      "majorDimension": "ROWS",
      "values": [
        [
          " Internal ID",
          "DATE",
          "TRANSACTION TYPE",
          "DUE DATE",
          "VENDOR",
          "DOCUMENT NUMBER",
          "AGE",
          "OPEN BALANCE",
          "MEMO",
          "TRANSACTION NUMBER",
          "EXPECTED PAY DATE",
          "RECURRING/    NON RECURRING"
        ],
        [
          "3600212",
          "4/1/2022",
          "Bill",
          "4/1/2022",
          "Hyde Park Village",
          "040122Tampa",
          "",
          "17797.57",
          "April Rent",
          "040122Tampa",
          "11/25/2022"
        ]
      ]
    }
  ],
    "files": [
      {
        "fileMeta": {
          "fileName": "sampleFileName"
        }
      }
    ],
      "errors": [],
        "_exportId": "624342c87c9b8974cec3da80",
          "_connectionId": "622fbfc0d9a2a127ec618de5",
            "_flowId": "6243428d5a4e2c6dff780a76",
              "_integrationId": "62326d004c899123a43217c9",
                "pageIndex": 0,
                  "settings": {
    "integration": { },
    "flowGrouping": { },
    "flow": { },
    "export": { },
    "connection": { }
  }
}

const result = preSavePage(options);
console.log(result);