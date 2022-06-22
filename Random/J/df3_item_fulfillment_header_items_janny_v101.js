//v102

const itemKeys = ["ItemID", "LineID", "Qty", "3PLSKU"];

const headerKeys = ["DocumentNum", "WarehouseID", "PONum", "internalid", "Billing Address 1", 
                    "Billing Address 2", "Billing City", "Billing State/Province", "Billing Country", 
                    "Billing Zip", "Billing Phone"];

function setHeader(object) {
  let header = {};
  header.items = [];

  Object.keys(object).forEach((key, i) => { if (!itemKeys.includes(key) || headerKeys.includes(key)) header[key] = object[key] })
  return header;
}

function adjItem(item) {
  let newItem = {};

  itemKeys.forEach(key => { newItem[key] = item[key] })
  return newItem;
}

function preSavePage(options) {
  let retArr = [];


  for (let i = 0; i < options.data.length; i++) {
    let currRecord = null;

    for (let k = 0; k < options.data[i].length; k++) {
      if (!currRecord) {
        currRecord = setHeader(options.data[i][k]);
      } else if (currRecord['WarehouseID'] !== options.data[i][k]['WarehouseID']) {
        retArr.push(currRecord);
        currRecord = setHeader(options.data[i][k]);
      }

      let item = adjItem(options.data[i][k]);
      currRecord.items.push(item);
    }

    if (currRecord) retArr.push(currRecord);
  }

  return {
    data: retArr,
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}

const options = {
  "data": [
    [
      {
        "id": "785975",
        "recordType": "salesorder",
        "Customer": "MAG2-81169-andrewdu18@hotmail.com",
        "Location (no hierarchy)": "IF - TORONTO",
        "Document Number": "SO053660",
        "PO Number": "CA27049",
        "External ID": "",
        "Date Created": "10/21/2021 8:23 pm",
        "Shipping Carrier": "FedEx/USPS/More",
        "Shipping Method": "RATESHOP",
        "Shipping Addressee": "Andrew Dubois",
        "Email": "andrewdu18@hotmail.com",
        "Shipping Address 1": "375 Collingwood Dr",
        "Shipping Address 2": "",
        "Shipping City": "Kamloops",
        "Shipping State/Province": "BC",
        "Shipping Zip": "V2B6B5",
        "Shipping Country": "Canada",
        "Shipping Phone": "(250) 575-6080",
        "Billing Addressee": "Andrew Dubois",
        "Billing Address 1": "375 Collingwood Dr",
        "Billing Address 2": "",
        "Billing City": "Kamloops",
        "Billing State/Province": "British Columbia",
        "Billing Zip": "V2B6B5",
        "Billing Country": "Canada",
        "Billing Phone": "(250) 575-6080",
        "Item": "GEN 2 VALVE WRENCH",
        "SKU Number": "Gen 2 Valve Wrench",
        "Quantity": "1",
        "Line ID": "1",
        "Internal ID": "785975",
        "3PL Central SKU": "69870",
        "Warehouse ID": "1",
        "DocumentNum": "SO053660-1",
        "dataURI": "https://5740311-sb1.app.netsuite.com/app/accounting/transactions/salesord.nl?id=785975&compid=5740311_SB1"
      },
      {
        "id": "785975",
        "recordType": "salesorder",
        "Customer": "MAG2-81169-andrewdu18@hotmail.com",
        "Location (no hierarchy)": "IF - Vancouver",
        "Document Number": "SO053660",
        "PO Number": "CA27049",
        "External ID": "",
        "Date Created": "10/21/2021 8:23 pm",
        "Shipping Carrier": "FedEx/USPS/More",
        "Shipping Method": "RATESHOP",
        "Shipping Addressee": "Andrew Dubois",
        "Email": "andrewdu18@hotmail.com",
        "Shipping Address 1": "375 Collingwood Dr",
        "Shipping Address 2": "",
        "Shipping City": "Kamloops",
        "Shipping State/Province": "BC",
        "Shipping Zip": "V2B6B5",
        "Shipping Country": "Canada",
        "Shipping Phone": "(250) 575-6080",
        "Billing Addressee": "Andrew Dubois",
        "Billing Address 1": "375 Collingwood Dr",
        "Billing Address 2": "",
        "Billing City": "Kamloops",
        "Billing State/Province": "British Columbia",
        "Billing Zip": "V2B6B5",
        "Billing Country": "Canada",
        "Billing Phone": "(250) 575-6080",
        "Item": "NT11 Blue_21",
        "SKU Number": "NT11 Blue_21",
        "Quantity": "1",
        "Line ID": "2",
        "Internal ID": "785975",
        "3PL Central SKU": "72605",
        "Warehouse ID": "7",
        "DocumentNum": "SO053660-7",
        "dataURI": "/app/accounting/transactions/salesord.nl?id=785975&compid=5740311_SB1"
      }
    ]
  ],
  "files": [
    {
      "fileMeta": {
        "fileName": "sampleFileName"
      }
    }
  ],
  "errors": [],
  "_exportId": "6172087374759d4968eb93c5",
  "_connectionId": "5fdb71b0d611fd2d757ddfd8",
  "_flowId": "6172087474759d4968eb93cb",
  "_integrationId": "5fcfc542304b0c193877496f",
  "pageIndex": 0,
  "settings": {
    "integration": {},
    "flowGrouping": {},
    "flow": {},
    "export": {},
    "connection": {}
  }
}

const result = preSavePage(options);
console.log(result);