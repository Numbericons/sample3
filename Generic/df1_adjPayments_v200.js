const nsLineFields = {
  //Values when integers represent NetSuite Internal ID's
  //  When text strings, represent values to reference from the GAU
  //     When arrays of two text strings, represent the values when the associated Opportunity type is not a pledge and when it is a pledge, respectively
  foundation: {
    cashCheckEFT: {
      debitAccId: 'GL_Code_Debit__c', debitRestId: 1,
      debitFundId: 3, debitDeptId: 1,
      creditAccId: ['GL_Code_Credit__c', 'GL_Code_Pledge_Payment_Credit__c'], creditRestId: 'NetSuite_Restriction__c',
      creditDeptId: 'NetSuite_Department__c', creditFundId: 'NetSuite_Fund_ID__c'
    },
    Credit: {
      debitAccId: 'GL_Code_CreditCard_Debit__c', debitRestId: 1,
      debitFundId: 3, debitDeptId: 1,
      creditAccId: ['GL_Code_Credit__c', 'GL_Code_Pledge_Payment_Credit__c'], creditRestId: 'NetSuite_Restriction__c',
      creditDeptId: 'NetSuite_Department__c', creditFundId: 'NetSuite_Fund_ID__c'
    }
  },
  endowment: {
    cashCheckEFT: {
      debitAccId: 618, debitRestId: 1,
      debitFundId: 3, debitDeptId: 1,
      creditAccId: ['GL_Code_Credit__c', 'GL_Code_Pledge_Payment_Credit__c'], creditRestId: 'NetSuite_Restriction__c',
      creditDeptId: 'NetSuite_Department__c', creditFundId: 'NetSuite_Fund_ID__c'
    },
    Stock: {
      debitAccId: 'GL_Code_Stock_Debit__c', debitRestId: 'NetSuite_Restriction__c',
      debitFundId: 'NetSuite_Fund_ID__c', debitDeptId: 'NetSuite_Department__c',
      creditAccId: ['GL_Code_Credit__c', 'GL_Code_Pledge_Payment_Credit__c'], creditRestId: 'NetSuite_Restriction__c',
      creditDeptId: 'NetSuite_Department__c', creditFundId: 'NetSuite_Fund_ID__c'
    }
  }
}

function setEntity(currRec) {
  //"2" is the NetSuite Sub Internal ID related to 'Charity Foundation'
  return currRec.Payment_Entity__c === "Charity Endowment" ? "3" : "2"; 
}

function setId(lineFields, gAccUnit, isPledge, fieldStr) {
  const lineVal = lineFields[fieldStr];

  if (Number.isInteger(lineVal)) {
    return lineVal.toString();
  } else if (typeof lineVal === 'string') {
    return gAccUnit[lineVal];
  } else if (Array.isArray(lineVal)) {
    return isPledge ? gAccUnit[lineVal[1]] : gAccUnit[lineVal[0]];
  }
}

function nsCreditIDs(parRec, allocation) {
  const method = parRec.method === 'Venmo' ? 'Credit' : parRec.method; //Venmo mirrors Credit Card - 2/17/21
  const lineFields = nsLineFields[parRec.Parent][method];
  const gAccUnit = allocation.npsp__General_Accounting_Unit__r;
  const isPledge = parRec.npe01__Opportunity__r.Type === 'Pledge';

  const fields = ['creditAccId', 'creditRestId', 'creditDeptId', 'creditFundId'];

  for (let i = 0; i < fields.length; i++) { allocation[fields[i]] = setId(lineFields, gAccUnit, isPledge, fields[i]) }

  return allocation;
}

function nsDebitIDs(record) {
  const method = record.method === 'Venmo' ? 'Credit' : record.method;
  const lineFields = nsLineFields[record.Parent][method];
  const gAccUnit = record.npsp__Allocations__r[0].npsp__General_Accounting_Unit__r;

  const fields = ['debitAccId', 'debitRestId', 'debitDeptId', 'debitFundId'];

  for (let i = 0; i < fields.length; i++) { record[fields[i]] = setId(lineFields, gAccUnit, false, fields[i]) }

  return record;
}

function payMethod(record) {
  const base = ['Cash', 'Check', 'EFT'];
  let method = base.includes(record.npe01__Payment_Method__c) ? 'cashCheckEFT' : record.npe01__Payment_Method__c;

  return method === 'Credit Card' ? 'Credit' : method;
}

function getKey(rec) {
  const date = rec.Payment_Close_Date__c ? rec.Payment_Close_Date__c.slice(0, 10) : 'notPosted';
  return `${rec.Parent}-${rec.method}-${date}`;
}

function adjDept(record) {
  // When the account is: '123 Unconditional Promises to Give, Net : Pledges Receivable' [ID = 330]
  //   Hardcode the department to: '00 Balance Sheet' [ID = 1]
  return record.creditAccId === 330 ? 1 : record.creditDeptId;
}

function credit(record, parent) {
  const dept = adjDept(record);
  return {
    Debit: 0, Credit: record.npsp__Amount__c,
    accId: record.creditAccId, restId: record.creditRestId,
    deptId: dept, fundId: record.creditFundId, memo: record.memo,
    batchNum: parent.Batch_Number_Apsona__c
  }
}

function debit(record, debit, memo) {
  return {
    Debit: Math.round(debit * 100) / 100, Credit: 0,
    accId: record.debitAccId, restId: record.debitRestId,
    deptId: record.debitDeptId, fundId: record.debitFundId, memo: memo
  }
}

function sortArr(arr, value) {
  return arr.sort((a, b) => {
    if (a[value] === b[value]) return 0;
    return a[value] > b[value] ? 1 : -1;
  });
}

function multiDebits(record, cChkEft) {
  record.lines = sortArr(record.lines, 'batchNum');
  let debitArr = [];
  const keys = Object.keys(cChkEft);

  for (let i = 0; i < keys.length; i++) {
    debitArr.push(debit(record, cChkEft[keys[i]].sum, cChkEft[keys[i]].memo))
  }
  debitArr = sortArr(debitArr, 'memo');
  for (let j = 0; j < debitArr.length; j++) { record.lines.push(debitArr[j]) }

  return record;
}

function updateObj(obj, line) {
  if (!obj[line.batchNum]) {
    obj[line.batchNum] = { sum: line.Credit, memo: line.memo };
  } else {
    obj[line.batchNum].sum += line.Credit;
  }
}

function addDebit(arr) {
  for (let j = 0; j < arr.length; j++) {
    const method = arr[j].method;
    const len = arr[j].lines.length;

    let cChkEft = {};
    let sum = 0;
    let memo = "";

    for (let z = 0; z < len; z++) {
      let line = arr[j].lines[z];
      if (method === 'cashCheckEFT') updateObj(cChkEft, line);
      sum += line.Credit;
    }

    if (method === 'cashCheckEFT') {
      arr[j] = multiDebits(arr[j], cChkEft);
      continue;
    }
    if (method === 'Credit' || method === 'Venmo') memo = arr[j].lines[0].memo;

    arr[j].lines.push(debit(arr[j], sum, memo));
  }
  return arr;
}

function setMemo(obj) {
  const method = obj.npe01__Payment_Method__c;
  if (method === 'Credit Card' || method === 'Venmo') return method;
  if (['Cash', 'Check', 'EFT'].includes(method)) return obj.Batch_Number_Apsona__c || "";
  return "";
}

function remHeaderIds(arr) {
  const fields = ['debitAccId', 'debitRestId', 'debitDeptId', 'debitFundId', 'creditAccId', 'creditRestId', 'creditDeptId', 'creditFundId'];
  for (let j = 0; j < arr.length; j++) {
    for (let i = 0; i < fields.length; i++) { 
      delete arr[j][fields[i]] 
    }
  }
  return arr;
}

function adjAllocations(parent) {
  for (let i = 0; i < parent.npsp__Allocations__r.length; i++) {
    const alloc = parent.npsp__Allocations__r[i];

    parent.npsp__Allocations__r[i]['memo'] = setMemo(parent);
    parent.npsp__Allocations__r[i]['memo']
    parent.npsp__Allocations__r[i] = nsCreditIDs(parent, parent.npsp__Allocations__r[i]);
  } 

  return parent.npsp__Allocations__r;
}

function creditLines(lines, cRecord) {
  let arr = lines || [];

  for (let i = 0; i < cRecord.npsp__Allocations__r.length; i++){
    arr.push(credit(cRecord.npsp__Allocations__r[i], cRecord));
  }
  return arr;
}

function preSavePage(options) {
  let retArr = [];
  let retPos = {};

  for (let i = 0; i < options.data.length; i++) {
    options.data[i].Entity = setEntity(options.data[i]);
    options.data[i].Parent = options.data[i].Entity === "2" ? "foundation" : "endowment";
    const method = payMethod(options.data[i]);
    options.data[i].method = method;

    if (options.data[i].Parent === "foundation" && method === 'Stock') {
      options.errors.push({ message:'Foundation payments with a method of: Stock, are not allowed', code: 400});
      break;
    }
    if (options.data[i].Parent === "endowment") {
      if (method === 'Credit' || method === 'Venmo') {
        options.errors.push({ message: `Endowment payments with a method of: ${method}, are not allowed`, code: 400});
        break;
      }
    }

    const key = getKey(options.data[i]);

    options.data[i].npsp__Allocations__r = adjAllocations(options.data[i]);
    options.data[i] = nsDebitIDs(options.data[i]);

    //if retArr already contains an obj w/ same combo of entity, payment method and date
    //add data[i] amount to the existing objects lines and similiarly add data[i] id to sfIDs array
    if (retPos[key] > -1) {
      retArr[retPos[key]].lines = creditLines(retArr[retPos[key]].lines, options.data[i]);
      retArr[retPos[key]].sfIDs.push({ Id: options.data[i].Id });
      continue;
    }
    
    retPos[key] = retArr.length;
    options.data[i].lines = creditLines([], options.data[i]);

    options.data[i].sfIDs = [{ Id: options.data[i].Id }];
    const closeDate = options.data[i].Payment_Close_Date__c ? options.data[i].Payment_Close_Date__c.slice(0, 10) : "TBD";
    options.data[i].headMemo = "NPSP Donations – " + closeDate;

    retArr.push(options.data[i]);
  }

  retArr = addDebit(retArr);
  remHeaderIds(retArr);

  return {
    data: retArr,
    errors: options.errors,
    abort: false
  }
}

const multiAlloctions = {
  "data": [
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxuAAE"
      },
      "Id": "ZoopZorpZargon",
      "Name": "PMT-3533071",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-13",
      "CreatedDate": "2021-01-13T22:10:05.000+0000",
      "Batch_Number_NetSuite__c": "4507",
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qstC2AAI"
        },
        "Type": "Online Donation"
      },
      "npe01__Payment_Amount__c": 53.5,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VvAAL"
          },
          "Id": "a0b4v00000QW0VvAAL",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrW3AAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 108,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        },
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VwAAL"
          },
          "Id": "a0b4v00000QW0VwAAL",
          "npsp__Amount__c": 3.5,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxuAAE"
      },
      "Id": "a014v000015uDxuAAE",
      "Name": "PMT-3533071",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-13",
      "CreatedDate": "2021-01-13T22:10:05.000+0000",
      "Batch_Number_NetSuite__c": "4507",
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qstC2AAI"
        },
        "Type": "Online Donation"
      },
      "npe01__Payment_Amount__c": 53.5,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VvAAL"
          },
          "Id": "a0b4v00000QW0VvAAL",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrW3AAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 108,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        },
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VwAAL"
          },
          "Id": "a0b4v00000QW0VwAAL",
          "npsp__Amount__c": 3.5,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    }
  ],
  "errors": [],
  "_exportId": "6000c2e24d0ef83d7516e44c",
  "_connectionId": "6000b140e1178e1632d3b954",
  "_flowId": "6000c1caaa72262429298a71",
  "_integrationId": "6000c172ec416f0b086f64fa",
  "pageIndex": 0,
  "settings": {
    "integration": {},
    "flow": {},
    "export": {},
    "connection": {}
  }
}

const options = {
  "data": [
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCy7AAE"
      },
      "Id": "a014v000015uCy7AAE",
      "Name": "PMT-3532142",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T00:23:30.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjmjAAA"
        },
        "Type": "Online Donation"
      },
      "npe01__Payment_Amount__c": 53.5,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzDyAAL"
          },
          "Id": "a0b4v00000QVzDyAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrWkAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 13,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        },
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzDzAAL"
          },
          "Id": "a0b4v00000QVzDzAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyCAAU"
      },
      "Id": "a014v000015uCyCAAU",
      "Name": "PMT-3532143",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T00:44:37.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjqbAAA"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 40,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzEAAA1"
          },
          "Id": "a0b4v00000QVzEAAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyDAAU"
      },
      "Id": "a014v000015uCyDAAU",
      "Name": "PMT-3532144",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T00:44:37.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjqcAAA"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 300,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzEBAA1"
          },
          "Id": "a0b4v00000QVzEBAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyEAAU"
      },
      "Id": "a014v000015uCyEAAU",
      "Name": "PMT-3532145",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T00:44:37.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjqdAAA"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 30,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzECAA1"
          },
          "Id": "a0b4v00000QVzECAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyHAAU"
      },
      "Id": "a014v000015uCyHAAU",
      "Name": "PMT-3532146",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T01:44:52.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjvRAAQ"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 10,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzEUAA1"
          },
          "Id": "a0b4v00000QVzEUAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrVuAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 43,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyIAAU"
      },
      "Id": "a014v000015uCyIAAU",
      "Name": "PMT-3532147",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T01:44:52.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjvSAAQ"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 20,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzEVAA1"
          },
          "Id": "a0b4v00000QVzEVAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrVuAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 43,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyJAAU"
      },
      "Id": "a014v000015uCyJAAU",
      "Name": "PMT-3532148",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T01:44:52.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjvTAAQ"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 30,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzEWAA1"
          },
          "Id": "a0b4v00000QVzEWAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRCAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 84,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyKAAU"
      },
      "Id": "a014v000015uCyKAAU",
      "Name": "PMT-3532149",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Venmo",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T01:45:05.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjvUAAQ"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 15,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzEZAA1"
          },
          "Id": "a0b4v00000QVzEZAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrW3AAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 108,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyLAAU"
      },
      "Id": "a014v000015uCyLAAU",
      "Name": "PMT-3532150",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T01:45:05.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjvVAAQ"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 5,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzEaAAL"
          },
          "Id": "a0b4v00000QVzEaAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyMAAU"
      },
      "Id": "a014v000015uCyMAAU",
      "Name": "PMT-3532151",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T02:00:24.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjwUAAQ"
        },
        "Type": "Online Donation"
      },
      "npe01__Payment_Amount__c": 26.75,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzEcAAL"
          },
          "Id": "a0b4v00000QVzEcAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyRAAU"
      },
      "Id": "a014v000015uCyRAAU",
      "Name": "PMT-3532152",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T02:44:36.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk0qAAA"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 25,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzEsAAL"
          },
          "Id": "a0b4v00000QVzEsAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrW3AAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 108,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCySAAU"
      },
      "Id": "a014v000015uCySAAU",
      "Name": "PMT-3532153",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T02:44:36.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk0rAAA"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 25,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzEtAAL"
          },
          "Id": "a0b4v00000QVzEtAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRCAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 84,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyWAAU"
      },
      "Id": "a014v000015uCyWAAU",
      "Name": "PMT-3532154",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Venmo",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T03:45:41.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk2XAAQ"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 2500,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzF2AAL"
          },
          "Id": "a0b4v00000QVzF2AAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrUwAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 218,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyXAAU"
      },
      "Id": "a014v000015uCyXAAU",
      "Name": "PMT-3532155",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T03:45:41.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk2YAAQ"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 20,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzF3AAL"
          },
          "Id": "a0b4v00000QVzF3AAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrUwAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 218,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyvAAE"
      },
      "Id": "a014v000015uCyvAAE",
      "Name": "PMT-3532156",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-12",
      "CreatedDate": "2021-01-12T05:47:31.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk4iAAA"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 10,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzFNAA1"
          },
          "Id": "a0b4v00000QVzFNAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRKAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 107,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCywAAE"
      },
      "Id": "a014v000015uCywAAE",
      "Name": "PMT-3532157",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-12",
      "CreatedDate": "2021-01-12T05:47:31.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk4jAAA"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 5,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzFOAA1"
          },
          "Id": "a0b4v00000QVzFOAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRKAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 107,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyxAAE"
      },
      "Id": "a014v000015uCyxAAE",
      "Name": "PMT-3532158",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-12",
      "CreatedDate": "2021-01-12T05:47:31.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk4kAAA"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 20,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzFPAA1"
          },
          "Id": "a0b4v00000QVzFPAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRKAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 107,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCz0AAE"
      },
      "Id": "a014v000015uCz0AAE",
      "Name": "PMT-3532159",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-12",
      "CreatedDate": "2021-01-12T07:19:00.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk4sAAA"
        },
        "Type": "Online Donation"
      },
      "npe01__Payment_Amount__c": 107,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzFVAA1"
          },
          "Id": "a0b4v00000QVzFVAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrWkAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 13,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        },
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzFWAA1"
          },
          "Id": "a0b4v00000QVzFWAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCz5AAE"
      },
      "Id": "a014v000015uCz5AAE",
      "Name": "PMT-3532160",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-12",
      "CreatedDate": "2021-01-12T09:01:02.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk4xAAA"
        },
        "Type": "Online Donation"
      },
      "npe01__Payment_Amount__c": 10,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzFfAAL"
          },
          "Id": "a0b4v00000QVzFfAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrQbAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 40,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCzAAAU"
      },
      "Id": "a014v000015uCzAAAU",
      "Name": "PMT-3532161",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-12",
      "CreatedDate": "2021-01-12T09:02:32.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk52AAA"
        },
        "Type": "Online Donation"
      },
      "npe01__Payment_Amount__c": 25,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzFkAAL"
          },
          "Id": "a0b4v00000QVzFkAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDikAAE"
      },
      "Id": "a014v000015uDikAAE",
      "Name": "PMT-3532870",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-31",
      "CreatedDate": "2021-01-13T16:45:53.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD122",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsqaaAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 10000,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0EBAA1"
          },
          "Id": "a0b4v00000QW0EBAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrTjAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 305,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDj4AAE"
      },
      "Id": "a014v000015uDj4AAE",
      "Name": "PMT-3532872",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-04",
      "CreatedDate": "2021-01-13T18:57:21.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD99",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsrfwAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 5000,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0FTAA1"
          },
          "Id": "a0b4v00000QW0FTAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrUEAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 56,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDj9AAE"
      },
      "Id": "a014v000015uDj9AAE",
      "Name": "PMT-3532873",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-23",
      "CreatedDate": "2021-01-13T18:58:16.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD115",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsrgyAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 1,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0FdAAL"
          },
          "Id": "a0b4v00000QW0FdAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRKAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 107,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvFAAU"
      },
      "Id": "a014v000015uDvFAAU",
      "Name": "PMT-3533036",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:56:43.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsstkAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 20,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0SwAAL"
          },
          "Id": "a0b4v00000QW0SwAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrTLAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 3,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 325,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvKAAU"
      },
      "Id": "a014v000015uDvKAAU",
      "Name": "PMT-3533037",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:56:54.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qssgRAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 40,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0T6AAL"
          },
          "Id": "a0b4v00000QW0T6AAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrTLAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 3,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 325,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvPAAU"
      },
      "Id": "a014v000015uDvPAAU",
      "Name": "PMT-3533038",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:57:04.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst6JAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 50,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TGAA1"
          },
          "Id": "a0b4v00000QW0TGAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrVuAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 43,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvUAAU"
      },
      "Id": "a014v000015uDvUAAU",
      "Name": "PMT-3533039",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:57:11.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst25AAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 25,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TLAA1"
          },
          "Id": "a0b4v00000QW0TLAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvZAAU"
      },
      "Id": "a014v000015uDvZAAU",
      "Name": "PMT-3533040",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:57:18.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst6PAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 50,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TQAA1"
          },
          "Id": "a0b4v00000QW0TQAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDveAAE"
      },
      "Id": "a014v000015uDveAAE",
      "Name": "PMT-3533041",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:57:26.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsszEAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 1000,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TVAA1"
          },
          "Id": "a0b4v00000QW0TVAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrSMAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 3,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 467,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvjAAE"
      },
      "Id": "a014v000015uDvjAAE",
      "Name": "PMT-3533042",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:57:34.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst3qAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 50,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TaAAL"
          },
          "Id": "a0b4v00000QW0TaAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrUwAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 218,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvoAAE"
      },
      "Id": "a014v000015uDvoAAE",
      "Name": "PMT-3533043",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:57:43.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst6iAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 379,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TfAAL"
          },
          "Id": "a0b4v00000QW0TfAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvtAAE"
      },
      "Id": "a014v000015uDvtAAE",
      "Name": "PMT-3533044",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:57:50.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst1PAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 379,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TkAAL"
          },
          "Id": "a0b4v00000QW0TkAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvyAAE"
      },
      "Id": "a014v000015uDvyAAE",
      "Name": "PMT-3533045",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:57:57.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst6sAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 200,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TpAAL"
          },
          "Id": "a0b4v00000QW0TpAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDw3AAE"
      },
      "Id": "a014v000015uDw3AAE",
      "Name": "PMT-3533046",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:58:04.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qssjWAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 50,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TuAAL"
          },
          "Id": "a0b4v00000QW0TuAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDw8AAE"
      },
      "Id": "a014v000015uDw8AAE",
      "Name": "PMT-3533047",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:58:11.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst4nAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 70,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TzAAL"
          },
          "Id": "a0b4v00000QW0TzAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrUwAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 218,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDwDAAU"
      },
      "Id": "a014v000015uDwDAAU",
      "Name": "PMT-3533048",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:58:18.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst72AAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 250,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0U4AAL"
          },
          "Id": "a0b4v00000QW0U4AAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrUwAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 218,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDwIAAU"
      },
      "Id": "a014v000015uDwIAAU",
      "Name": "PMT-3533049",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:58:26.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst77AAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 35,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0U9AAL"
          },
          "Id": "a0b4v00000QW0U9AAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDwNAAU"
      },
      "Id": "a014v000015uDwNAAU",
      "Name": "PMT-3533050",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:58:32.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst5bAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 15,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0UEAA1"
          },
          "Id": "a0b4v00000QW0UEAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRKAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 107,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDwSAAU"
      },
      "Id": "a014v000015uDwSAAU",
      "Name": "PMT-3533051",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:58:40.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst6ZAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 15,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0UOAA1"
          },
          "Id": "a0b4v00000QW0UOAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRKAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 107,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDwXAAU"
      },
      "Id": "a014v000015uDwXAAU",
      "Name": "PMT-3533052",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:58:48.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst7MAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 25,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0UTAA1"
          },
          "Id": "a0b4v00000QW0UTAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDwcAAE"
      },
      "Id": "a014v000015uDwcAAE",
      "Name": "PMT-3533053",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:58:55.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst49AAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 25,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0UYAA1"
          },
          "Id": "a0b4v00000QW0UYAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDwhAAE"
      },
      "Id": "a014v000015uDwhAAE",
      "Name": "PMT-3533054",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:59:01.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst7WAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 100,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0UdAAL"
          },
          "Id": "a0b4v00000QW0UdAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrVuAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 43,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvpAAE"
      },
      "Id": "a014v000015uDvpAAE",
      "Name": "PMT-3533055",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:59:08.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst6jAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 50,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0ThAAL"
          },
          "Id": "a0b4v00000QW0ThAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrR9AAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 83,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDwmAAE"
      },
      "Id": "a014v000015uDwmAAE",
      "Name": "PMT-3533056",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:59:15.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst3DAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 400,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0UiAAL"
          },
          "Id": "a0b4v00000QW0UiAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrT5AAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 50,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDwrAAE"
      },
      "Id": "a014v000015uDwrAAE",
      "Name": "PMT-3533057",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:59:24.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst0lAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 525,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0UsAAL"
          },
          "Id": "a0b4v00000QW0UsAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDwwAAE"
      },
      "Id": "a014v000015uDwwAAE",
      "Name": "PMT-3533058",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:59:29.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst5WAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 500,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0UxAAL"
          },
          "Id": "a0b4v00000QW0UxAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrSMAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 3,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 467,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDx1AAE"
      },
      "Id": "a014v000015uDx1AAE",
      "Name": "PMT-3533059",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:59:34.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst7gAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 200,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0V2AAL"
          },
          "Id": "a0b4v00000QW0V2AAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrVuAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 43,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDx6AAE"
      },
      "Id": "a014v000015uDx6AAE",
      "Name": "PMT-3533060",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:59:41.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst7qAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 50,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0V7AAL"
          },
          "Id": "a0b4v00000QW0V7AAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrR9AAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 83,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxBAAU"
      },
      "Id": "a014v000015uDxBAAU",
      "Name": "PMT-3533061",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:59:47.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst36AAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 50,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VCAA1"
          },
          "Id": "a0b4v00000QW0VCAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrUwAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 218,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxGAAU"
      },
      "Id": "a014v000015uDxGAAU",
      "Name": "PMT-3533062",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:59:53.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst7vAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 31.5,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VHAA1"
          },
          "Id": "a0b4v00000QW0VHAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrUEAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 56,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDvfAAE"
      },
      "Id": "a014v000015uDvfAAE",
      "Name": "PMT-3533063",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:59:59.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsszFAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 15,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TXAA1"
          },
          "Id": "a0b4v00000QW0TXAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrR9AAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 83,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxLAAU"
      },
      "Id": "a014v000015uDxLAAU",
      "Name": "PMT-3533064",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T22:00:07.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst8FAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 1100,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VMAA1"
          },
          "Id": "a0b4v00000QW0VMAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxQAAU"
      },
      "Id": "a014v000015uDxQAAU",
      "Name": "PMT-3533065",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T22:00:14.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qssxmAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 200,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VRAA1"
          },
          "Id": "a0b4v00000QW0VRAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxVAAU"
      },
      "Id": "a014v000015uDxVAAU",
      "Name": "PMT-3533066",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T22:00:21.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst0CAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 200,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VWAA1"
          },
          "Id": "a0b4v00000QW0VWAA1",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxaAAE"
      },
      "Id": "a014v000015uDxaAAE",
      "Name": "PMT-3533067",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T22:00:28.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst8PAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 500,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VbAAL"
          },
          "Id": "a0b4v00000QW0VbAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxfAAE"
      },
      "Id": "a014v000015uDxfAAE",
      "Name": "PMT-3533068",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T22:00:34.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst8UAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 838.86,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VgAAL"
          },
          "Id": "a0b4v00000QW0VgAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxkAAE"
      },
      "Id": "a014v000015uDxkAAE",
      "Name": "PMT-3533069",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T22:00:40.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst8ZAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 3308.98,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VlAAL"
          },
          "Id": "a0b4v00000QW0VlAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxpAAE"
      },
      "Id": "a014v000015uDxpAAE",
      "Name": "PMT-3533070",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-01",
      "CreatedDate": "2021-01-13T22:01:30.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD95",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst8tAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 549.2,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VqAAL"
          },
          "Id": "a0b4v00000QW0VqAAL",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a016s0000026NOrAAM"
      },
      "Id": "a016s0000026NOrAAM",
      "Name": "PMT-3533102",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2021-02-04",
      "CreatedDate": "2021-02-04T20:27:50.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21TEST89",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0066s000003uQBwAAM"
        },
        "Type": null
      },
      "npe01__Payment_Amount__c": 2,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b6s000000X3etAAC"
          },
          "Id": "a0b6s000000X3etAAC",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a016s0000026NP7AAM"
      },
      "Id": "a016s0000026NP7AAM",
      "Name": "PMT-3533105",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2021-01-05",
      "CreatedDate": "2021-02-04T20:59:55.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21eftTEST",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0066s000003uQCvAAM"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 1500,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b6s000000X3sbAAC"
          },
          "Id": "a0b6s000000X3sbAAC",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a016s0000026O7RAAU"
      },
      "Id": "a016s0000026O7RAAU",
      "Name": "PMT-3533109",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2021-02-09",
      "CreatedDate": "2021-02-09T20:57:49.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21TEST4",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0066s000003uWAVAA2"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 0.1,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b6s000000XOeGAAW"
          },
          "Id": "a0b6s000000XOeGAAW",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a016s0000026P1ZAAU"
      },
      "Id": "a016s0000026P1ZAAU",
      "Name": "PMT-3533114",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2021-02-10",
      "CreatedDate": "2021-02-11T01:26:56.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21TEST2",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0066s000003uYKUAA2"
        },
        "Type": "Pledge"
      },
      "npe01__Payment_Amount__c": 8000,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b6s000000XOtdAAG"
          },
          "Id": "a0b6s000000XOtdAAG",
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    }
  ],
  "errors": [],
  "_exportId": "6000c2e24d0ef83d7516e44c",
  "_connectionId": "6000b140e1178e1632d3b954",
  "_flowId": "6000c1caaa72262429298a71",
  "_integrationId": "6000c172ec416f0b086f64fa",
  "pageIndex": 0,
  "settings": {
    "integration": {},
    "flow": {},
    "export": {},
    "connection": {}
  }
}

const options2 = {
  "data": [
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCy7AAE"
      },
      "Id": "a014v000015uCy7AAE",
      "Name": "PMT-3532142",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Credit Card",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T00:23:30.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsjmjAAA"
        },
        "Type": "Online Donation"
      },
      "npe01__Payment_Amount__c": 53.5,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzDyAAL"
          },
          "Id": "a0b4v00000QVzDyAAL",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrWkAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 13,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        },
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzDzAAL"
          },
          "Id": "a0b4v00000QVzDzAAL",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uCyWAAU"
      },
      "Id": "a014v000015uCyWAAU",
      "Name": "PMT-3532154",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "Venmo",
      "Payment_Close_Date__c": "2021-01-11",
      "CreatedDate": "2021-01-12T03:45:41.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": null,
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsk2XAAQ"
        },
        "Type": "P2P Donation"
      },
      "npe01__Payment_Amount__c": 2500,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QVzF2AAL"
          },
          "Id": "a0b4v00000QVzF2AAL",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrUwAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 218,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDikAAE"
      },
      "Id": "a014v000015uDikAAE",
      "Name": "PMT-3532870",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-31",
      "CreatedDate": "2021-01-13T16:45:53.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD122",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qsqaaAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 10000,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0EBAA1"
          },
          "Id": "a0b4v00000QW0EBAA1",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrTjAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 305,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDw3AAE"
      },
      "Id": "a014v000015uDw3AAE",
      "Name": "PMT-3533046",
      "Payment_Entity__c": "Charity Endowment",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:58:04.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qssjWAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 50,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TuAAL"
          },
          "Id": "a0b4v00000QW0TuAAL",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrRAAA0"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 82,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDw8AAE"
      },
      "Id": "a014v000015uDw8AAE",
      "Name": "PMT-3533047",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T21:58:11.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst4nAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 70,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0TzAAL"
          },
          "Id": "a0b4v00000QW0TzAAL",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrUwAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 2,
            "NetSuite_Department__c": 4,
            "NetSuite_Fund_ID__c": 218,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxLAAU"
      },
      "Id": "a014v000015uDxLAAU",
      "Name": "PMT-3533064",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T22:00:07.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst8FAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 1100,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VMAA1"
          },
          "Id": "a0b4v00000QW0VMAA1",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxfAAE"
      },
      "Id": "a014v000015uDxfAAE",
      "Name": "PMT-3533068",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T22:00:34.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst8UAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 838.86,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VgAAL"
          },
          "Id": "a0b4v00000QW0VgAAL",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxkAAE"
      },
      "Id": "a014v000015uDxkAAE",
      "Name": "PMT-3533069",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-24",
      "CreatedDate": "2021-01-13T22:00:40.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD118",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst8ZAAQ"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 3308.98,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VlAAL"
          },
          "Id": "a0b4v00000QW0VlAAL",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a014v000015uDxpAAE"
      },
      "Id": "a014v000015uDxpAAE",
      "Name": "PMT-3533070",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2020-12-01",
      "CreatedDate": "2021-01-13T22:01:30.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21DD95",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0064v00001qst8tAAA"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 549.2,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b4v00000QW0VqAAL"
          },
          "Id": "a0b4v00000QW0VqAAL",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a016s0000026NOrAAM"
      },
      "Id": "a016s0000026NOrAAM",
      "Name": "PMT-3533102",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2021-02-04",
      "CreatedDate": "2021-02-04T20:27:50.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21TEST89",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0066s000003uQBwAAM"
        },
        "Type": null
      },
      "npe01__Payment_Amount__c": 2,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b6s000000X3etAAC"
          },
          "Id": "a0b6s000000X3etAAC",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a016s0000026NP7AAM"
      },
      "Id": "a016s0000026NP7AAM",
      "Name": "PMT-3533105",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2021-01-05",
      "CreatedDate": "2021-02-04T20:59:55.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21eftTEST",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0066s000003uQCvAAM"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 1500,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b6s000000X3sbAAC"
          },
          "Id": "a0b6s000000X3sbAAC",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a016s0000026O7RAAU"
      },
      "Id": "a016s0000026O7RAAU",
      "Name": "PMT-3533109",
      "Payment_Entity__c": "Charity Foundation",
      "npe01__Payment_Method__c": "EFT",
      "Payment_Close_Date__c": "2021-02-09",
      "CreatedDate": "2021-02-09T20:57:49.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21TEST4",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0066s000003uWAVAA2"
        },
        "Type": "Offline Donation"
      },
      "npe01__Payment_Amount__c": 0.1,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b6s000000XOeGAAW"
          },
          "Id": "a0b6s000000XOeGAAW",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    },
    {
      "attributes": {
        "type": "npe01__OppPayment__c",
        "url": "/services/data/v40.0/sobjects/npe01__OppPayment__c/a016s0000026P1ZAAU"
      },
      "Id": "a016s0000026P1ZAAU",
      "Name": "PMT-3533114",
      "Payment_Entity__c": "Charity Endowment",
      "npe01__Payment_Method__c": "Stock",
      "Payment_Close_Date__c": "2021-02-10",
      "CreatedDate": "2021-02-11T01:26:56.000+0000",
      "Batch_Number_NetSuite__c": null,
      "Batch_Number_Apsona__c": "21TEST2",
      "Payment_Status__c": "Paid",
      "npe01__Opportunity__r": {
        "attributes": {
          "type": "Opportunity",
          "url": "/services/data/v40.0/sobjects/Opportunity/0066s000003uYKUAA2"
        },
        "Type": "Pledge"
      },
      "npe01__Payment_Amount__c": 8000,
      "Posted_Date__c": null,
      "npsp__Allocations__r": [
        {
          "attributes": {
            "type": "npsp__Allocation__c",
            "url": "/services/data/v40.0/sobjects/npsp__Allocation__c/a0b6s000000XOtdAAG"
          },
          "Id": "a0b6s000000XOtdAAG",
          "npsp__Amount__c": 50,
          "npsp__General_Accounting_Unit__r": {
            "attributes": {
              "type": "npsp__General_Accounting_Unit__c",
              "url": "/services/data/v40.0/sobjects/npsp__General_Accounting_Unit__c/a0e6g000002FrPcAAK"
            },
            "GL_Code_Debit__c": "619",
            "GL_Code_CreditCard_Debit__c": "629",
            "GL_Code_Credit__c": "506",
            "NetSuite_Restriction__c": 1,
            "NetSuite_Department__c": 3,
            "NetSuite_Fund_ID__c": 4,
            "GL_Code_Pledge_Payment_Credit__c": "330",
            "GL_Code_Stock_Debit__c": "631"
          }
        }
      ]
    }
  ],
  "errors": [],
  "_exportId": "6000c2e24d0ef83d7516e44c",
  "_connectionId": "6000b140e1178e1632d3b954",
  "_flowId": "6000c1caaa72262429298a71",
  "_integrationId": "6000c172ec416f0b086f64fa",
  "pageIndex": 0,
  "settings": {
    "integration": {},
    "flow": {},
    "export": {},
    "connection": {}
  }
}

const result = preSavePage(options2);
console.log(result);