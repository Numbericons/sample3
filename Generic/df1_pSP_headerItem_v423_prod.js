// v423 Production

const itemKeys = ['UPC Code', 'GTIN #', 'Serial #', 'Qty Shipped', 'Facility ID', 'Net Weight', 'Item #', 'Lot #', 'Production Date',
  'Batch Date', 'Pallet ID', 'Case Serial #', 'Expiry Date', 'Batch Number', 'Pallet Weight', 'Item Line Item ID'];

let yearCC = new Date;
yearCC = yearCC.getFullYear().toString().slice(0, 2);

function removeNulls(object) {
  Object.keys(object).forEach(key => { if (!object[key]) delete object[key] });
  return object;
}

function remHeaderKeys(items) {
  if (items.length < 2) return items[0];

  let firstItem = {};
  let firstKeys = Object.keys(items[0]);
  for (let i = 0; i < firstKeys.length; i++) {
    if (items[1][firstKeys[i]]) firstItem[firstKeys[i]] = items[0][firstKeys[i]]
  }

  return firstItem;
}

function dateFormat(date) {
  if (!date) return null;
  let arr = date.split('/');

  if (arr.length === 1) arr = [date.slice(4, 6), date.slice(6, 8), date.slice(0, 4)];

  let month = arr[0];
  if (month.length === 1) month = '0' + month;

  let day = arr[1];
  if (day.length === 1) day = '0' + day;
  const year = arr[2].length === 2 ? yearCC + arr[2].slice(0, 3) : arr[2];

  return `${month}/${day}/${year}`;
}

const vendors = {
  11934: { name: "Generic Foods", caseVendor: true },
  11487: { name: "Generic Solutions", caseVendor: true },
  661: { name: "Generic Supplier", caseVendor: false }
}

function setCurrRec(object) {
  let newRec = { customRecs: [] };

  Object.keys(object).forEach((key, i) => { newRec[key] = object[key] });
  newRec.vendor = vendors[object["Partner ID"]];
  if (!newRec.vendor) throw "Vendor not found";
  const currItem = adjItem(object, newRec.vendor.caseVendor);

  newRec.items = [currItem];
  newRec['Transaction Date'] = dateFormat(object['Transaction Date']);
  if (newRec['Production Date']) newRec['Production Date'] = dateFormat(object['Production Date']);
  newRec['Estimated Delivery Date'] = dateFormat(object['Estimated Delivery Date']);
  newRec['Best Before Date'] = dateFormat(object['Best Before Date']);
  newRec['Customer PO#'] = object['Order #'];
  if (!object['Depositor Order #']) throw "Depositor Order # is required and missing";
  newRec['Depositor Order #'] = object['Depositor Order #'].slice(1);

  delete newRec["Expiry Date"];

  return newRec;
}

function setItemKeys(item) {
  let newItem = {};

  for (let i = 0; i < itemKeys.length; i++) {
    if (item[itemKeys[i]]) newItem[itemKeys[i]] = item[itemKeys[i]];
  }
  return newItem;
}

function adjItem(item, cases) {
  try {
    item = removeNulls(item);
    item = setItemKeys(item);
    if (!item["Case Serial #"]) return item;

    item['Case Serial #'] = item['Case Serial #'].slice(1);
    item['Pallet ID'] = item['Pallet ID'].slice(1);
    item['Serial #'] = item['Serial #'].slice(1);
    if (item['Expiry Date']) item['Expiry Date'] = dateFormat(item['Expiry Date']);
    item.invNumber = cases ? item['Case Serial #'] : item['Lot #'] || item['Serial #'];
    if (item['Production Date']) item['Production Date'] = dateFormat(item['Production Date']);
    if (item['GTIN #']) item['GTIN #'] = item['GTIN #'].slice(1);
  } catch (error) {
    throw `Error ${error} with item: ${item["item #"]}`
  }

  return item;
}

function roundNum(numString) {
  return Math.round(parseFloat(numString) * 100) / 100;
}

function setNum(numStr, prevNumStr) {
  let num = roundNum(numStr);

  if (prevNumStr) {
    prevNumStr = roundNum(prevNumStr);
    num = Math.round(parseFloat(num + prevNumStr) * 100) / 100;
  }
  return num;
}

function updateData(table, records) {
  for (let k = 0; k < records.length; k++) {
    if (table[records[k]['Pallet ID']]) {
      table[records[k]['Pallet ID']].palletWeight = setNum(records[k]['Net Weight'], table[records[k]['Pallet ID']].palletWeight);
      table[records[k]['Pallet ID']].casesInPallet = setNum(records[k]['Qty Shipped'], table[records[k]['Pallet ID']].casesInPallet);
    } else {
      table[records[k]['Pallet ID']] = {};
      table[records[k]['Pallet ID']].palletWeight = setNum(records[k]['Net Weight']);
      table[records[k]['Pallet ID']].casesInPallet = setNum(records[k]['Qty Shipped']);
    }
  }
  return table;
}

function adjRecord(record, pData) {
  for (let i = 0; i < record.items.length; i++) {
    record.items[i].palletWeight = pData[record['Pallet ID']].palletWeight;
    record.items[i].casesInPallet = pData[record['Pallet ID']].casesInPallet;
  }
  return record;
}

function palletTotal(arr, casesInPallets) {
  for (let i = 0; i < arr.length; i++) {
    for (let k = 0; k < arr[i].customRecs.length; k++) {
      arr[i].customRecs[k].itemCasesInPallet = casesInPallets[arr[i].customRecs[k]["Pallet ID"]];
    }
  }
  return arr;
}

const palletItems = {
  12895: true
}

function addTotals(array, quantityObj, cases, numPallets) {
  let processed = {};

  for (let i = 0; i < array.length; i++) {
    let items = [];
    for (let k = 0; k < array[i].items.length; k++) {
      const item = array[i].items[k]["Item #"];

      if (processed[item]) continue;
      processed[array[i].items[k]["Item #"]] = true;

      const palletItem = palletItems[item];
      if (palletItem) {
        array[i].items[k].totalQuantity = numPallets;
      } else {
        array[i].items[k].totalQuantity = quantityObj[item];
      }
      items.push(array[i].items[k]);
    }
    array[i].items = items;
  }

  return palletTotal(array, cases);
}

function adjBigRecs(array) {
  let retArr = [];

  for (let k = 0; k < array.length; k++) {
    if (array[k].customRecs.length < 2300) {
      retArr.push(array[k]);
    } else {
      retArr = retArr.concat(bigRec(array[k]));
    }
  }
  return retArr;
}

function itemSelect(items, target) { //extra check not relying on position of records associated item within its items array
  for (let k = 0; k < items.length; k++) {
    if (items[k]["Item #"] === target) return [items[k]];
  }
}

function recCopy(record, count, item, start, end) {
  let recCopy = JSON.parse(JSON.stringify(record));
  recCopy.customRecs = record.customRecs.slice(start, end);
  recCopy['Customer PO#'] = `${recCopy['Order #']}-${count}`;
  recCopy.items = itemSelect(record.items, item);

  return recCopy;
}

function bigRec(record) {
  let retRecs = [];
  let currItem = record.customRecs[0]["Item #"];
  let currItemIdx = 0;
  let recCount = 1;

  for (let k = 0; k < record.customRecs.length; k++) {
    if (record.customRecs[k]["Item #"] !== currItem) {
      retRecs.push(recCopy(record, recCount, currItem, currItemIdx, k));
      currItem = record.customRecs[k]["Item #"];

      currItemIdx = k;
      recCount += 1;
    }
  }
  retRecs.push(recCopy(record, recCount, currItem, currItemIdx));

  return retRecs;
}

function preSavePage(options) {
  if (!options.data[0]) return options;
  let dataArr = [];
  let palletData = {};
  let quantities = {};
  let palletCases = {};
  let pallets = {};

  let currRec = { PO: 'initial' };

  for (let j = 0; j < options.data[0].length; j++) {
    pallets[options.data[0][j]["Pallet ID"].slice(1)] = true;
  }

  updateData(palletData, options.data[0]);
  currRec = setCurrRec(options.data[0][0]);
  currRec.fileName = options.files[0].fileMeta.fileName;

  for (let k = 0; k < options.data[0].length; k++) {
    const prevQuantity = quantities[options.data[0][k]["Item #"]]; //prevQuantity = this item has been seen and its quantity recorded
    quantities[options.data[0][k]["Item #"]] = prevQuantity ? prevQuantity + parseInt(options.data[0][k]["Qty Shipped"]) : parseInt(options.data[0][k]["Qty Shipped"]);

    const prevCases = palletCases[options.data[0][k]["Pallet ID"].slice(1)];
    palletCases[options.data[0][k]["Pallet ID"].slice(1)] = prevCases ? prevCases + parseInt(options.data[0][k]["Qty Shipped"]) : parseInt(options.data[0][k]["Qty Shipped"]);

    const adjustedItem = adjItem(options.data[0][k], currRec.vendor.caseVendor);
    if (!prevQuantity) currRec.items.push(adjustedItem);

    currRec.customRecs.push(adjustedItem);
  }

  currRec.items[0] = remHeaderKeys(currRec.items);
  currRec.items[0] = adjItem(currRec.items[0], currRec.vendor.caseVendor);
  dataArr.push(adjRecord(currRec, palletData));

  dataArr = addTotals(dataArr, quantities, palletCases, Object.keys(pallets).length);

  return {
    data: dataArr,
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}

//Groups first 1k rows and subsequent groups of 1k rows

//After array setup, use helper
//  first element has a key for a later 'add PO' filter
//     'add PO' writes back the id to parent
//'update po' step
//  one to many

//change structure to return an array of initial 'add' po and subsequent lookup and update payloads

//new idea to create json file in cabinet

//v310 Adjust script to produce multiple objects, item per PO, when there are more than 2300 total rows exported 

const options = {
  "data": [[
    {
      "Document EDI Type": "943",
      "Partner ID": "11934",
      "Depositor Order #": "Test6270-3",
      "Order #": "Test6270-3",
      "PO #": "Test6270-3",
      "Location": "1",
      "Transaction Date": "5/2/22",
      "Pallet Weight": "8977.15",
      "Expiry Date": "6/27/22",
      "Ship To Name": "Generic Company",
      "Ship To Address 1": "123 Street Blvd.",
      "Ship To City": "City",
      "Ship To State": "NE",
      "Ship To Zip": "68502",
      "Ship To Country": "US",
      "Ship To Code": "XYZA",
      "Serial #": "1.90024E+46",
      "Qty Shipped": "1",
      "UOM": "Case",
      "Net Weight": "6.1",
      "Tare Weight": "1",
      "Item #": "31234",
      "Lot #": "22/04/18",
      "Production Date": "4/18/22",
      "Batch Number": "10822DOY18",
      "Pallet ID": "1.00287E+17",
      "Case Serial #": "6.5108E+11"
    },
    {
      "Pallet Weight": "8977.15",
      "Expiry Date": "6/27/22",
      "Ship To Name": "Generic Company",
      "Ship To Address 1": "123 Street Blvd.",
      "Ship To City": "City",
      "Ship To State": "NE",
      "Ship To Zip": "68502",
      "Ship To Country": "US",
      "Ship To Code": "XYZA",
      "Serial #": "1.90024E+46",
      "Tare Weight": "1",
      "Qty Shipped": "1",
      "UOM": "Case",
      "Net Weight": "6",
      "Item #": "31234",
      "Lot #": "22/04/18",
      "Production Date": "4/18/22",
      "Batch Number": "10822DOY18",
      "Pallet ID": "1.00287E+17",
      "Case Serial #": "6.5108E+11"
    },
    {
      "Pallet Weight": "8977.15",
      "Expiry Date": "6/27/22",
      "Ship To Name": "Generic Company",
      "Ship To Address 1": "123 Street Blvd.",
      "Tare Weight": "1",
      "Ship To City": "City",
      "Ship To State": "NE",
      "Ship To Zip": "68502",
      "Ship To Country": "US",
      "Ship To Code": "XYZA",
      "Serial #": "1.90024E+46",
      "Qty Shipped": "1",
      "UOM": "Case",
      "Net Weight": "6",
      "Item #": "31234",
      "Lot #": "22/04/18",
      "Production Date": "4/18/22",
      "Batch Number": "10822DOY18",
      "Pallet ID": "1.00287E+17",
      "Case Serial #": "6.5108E+11"
    },
    {
      "Pallet Weight": "8977.15",
      "Expiry Date": "6/27/22",
      "Ship To Name": "Generic Company",
      "Tare Weight": "1",
      "Ship To Address 1": "123 Street Blvd.",
      "Ship To City": "City",
      "Ship To State": "NE",
      "Ship To Zip": "68502",
      "Ship To Country": "US",
      "Ship To Code": "XYZA",
      "Serial #": "1.90024E+46",
      "Qty Shipped": "1",
      "UOM": "Case",
      "Net Weight": "6.05",
      "Item #": "31234",
      "Lot #": "22/04/18",
      "Production Date": "4/18/22",
      "Batch Number": "10822DOY18",
      "Pallet ID": "1.00287E+17",
      "Case Serial #": "6.5108E+11"
    },
    {
      "Pallet Weight": "8977.15",
      "Expiry Date": "6/27/22",
      "Ship To Name": "Generic Company",
      "Ship To Address 1": "123 Street Blvd.",
      "Ship To City": "City",
      "Ship To State": "NE",
      "Ship To Zip": "68502",
      "Ship To Country": "US",
      "Ship To Code": "XYZA",
      "Serial #": "1.90024E+46",
      "Qty Shipped": "1",
      "UOM": "Case",
      "Net Weight": "6",
      "Item #": "31234",
      "Lot #": "22/04/18",
      "Production Date": "4/18/22",
      "Batch Number": "10822DOY18",
      "Pallet ID": "1.00287E+17",
      "Case Serial #": "6.5108E+11"
    },
    {
      "Pallet Weight": "8977.15",
      "Expiry Date": "6/27/22",
      "Ship To Name": "Generic Company",
      "Ship To Address 1": "123 Street Blvd.",
      "Ship To City": "City",
      "Ship To State": "NE",
      "Ship To Zip": "68502",
      "Ship To Country": "US",
      "Ship To Code": "XYZA",
      "Serial #": "1.90024E+46",
      "Qty Shipped": "1",
      "UOM": "Case",
      "Net Weight": "6",
      "Item #": "31234",
      "Lot #": "22/04/18",
      "Production Date": "4/18/22",
      "Batch Number": "10822DOY18",
      "Pallet ID": "1.00287E+17",
      "Case Serial #": "6.5108E+11"
    },
    {
      "Pallet Weight": "8977.15",
      "Expiry Date": "6/27/22",
      "Ship To Name": "Generic Company",
      "Ship To Address 1": "123 Street Blvd.",
      "Ship To City": "City",
      "Ship To State": "NE",
      "Ship To Zip": "68502",
      "Ship To Country": "US",
      "Ship To Code": "XYZA",
      "Serial #": "1.90024E+46",
      "Qty Shipped": "1",
      "UOM": "Case",
      "Net Weight": "5.9",
      "Item #": "31234",
      "Lot #": "22/04/18",
      "Production Date": "4/18/22",
      "Batch Number": "10822DOY18",
      "Pallet ID": "1.00287E+17",
      "Case Serial #": "6.5108E+11"
    },
    {
      "Pallet Weight": "8977.15",
      "Expiry Date": "6/27/22",
      "Ship To Name": "Generic Company",
      "Ship To Address 1": "123 Street Blvd.",
      "Ship To City": "City",
      "Ship To State": "NE",
      "Ship To Zip": "68502",
      "Ship To Country": "US",
      "Ship To Code": "XYZA",
      "Serial #": "1.90024E+46",
      "Qty Shipped": "1",
      "UOM": "Case",
      "Net Weight": "6.05",
      "Item #": "31234",
      "Lot #": "22/04/18",
      "Production Date": "4/18/22",
      "Batch Number": "10822DOY18",
      "Pallet ID": "1.00287E+17",
      "Case Serial #": "6.5108E+11"
    },
    {
      "Pallet Weight": "8977.15",
      "Expiry Date": "6/27/22",
      "Ship To Name": "Generic Company",
      "Ship To Address 1": "123 Street Blvd.",
      "Ship To City": "City",
      "Ship To State": "NE",
      "Ship To Zip": "68502",
      "Ship To Country": "US",
      "Ship To Code": "XYZA",
      "Serial #": "1.90024E+46",
      "Qty Shipped": "1",
      "UOM": "Case",
      "Net Weight": "6",
      "Item #": "31234",
      "Lot #": "22/04/18",
      "Production Date": "4/18/22",
      "Batch Number": "10822DOY18",
      "Pallet ID": "1.00287E+17",
      "Case Serial #": "6.5108E+11"
    },
    {
      "Pallet Weight": "8977.15",
      "Expiry Date": "6/27/22",
      "Ship To Name": "Generic Company",
      "Ship To Address 1": "123 Street Blvd.",
      "Ship To City": "City",
      "Ship To State": "NE",
      "Ship To Zip": "68502",
      "Ship To Country": "US",
      "Ship To Code": "XYZA",
      "Serial #": "1.90024E+46",
      "Qty Shipped": "1",
      "UOM": "Case",
      "Net Weight": "6.05",
      "Item #": "31234",
      "Lot #": "22/04/18",
      "Production Date": "4/18/22",
      "Batch Number": "10822DOY18",
      "Pallet ID": "1.00287E+17",
      "Case Serial #": "6.5108E+11"
    }
  ]],
  "files": [
    {
      "fileMeta": {
        "fileName": "sampleFileName"
      }
    }
  ],
  "errors": [],
  "_exportId": "61ca3dfd0d9ce14e29dbe6d8",
  "_connectionId": "6101892e5d5ed57fbbc8eac1",
  "_flowId": "61ca3dfe0d9ce14e29dbe6e7",
  "_integrationId": "61018864670ceb27e0306624",
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