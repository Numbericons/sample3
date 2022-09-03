// v102

function preSavePage(options) {
  let vendorObj = { vendors: [], page: options.pageIndex };

  for (let k = 0; k < options.data.length; k++) {
    options.data[k].Comments = options.data[k].Comments.replace(/[\n\r,\"]/g, '');
    options.data[k].Type = options.data[k]["Is Individual"] === "T" ? "Individual" : "Company";
    vendorObj.vendors.push(options.data[k]);
  }

  return {
    data: [vendorObj],
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}

const options = {
  "data": [
    {
      "id": "-3",
      "recordType": "vendor",
      "Name": "-Accountant-",
      "Company Name": "",
      "Legal Name": "",
      "Category": "",
      "Primary Subsidiary": "Parent Company",
      "Kittenish Vendor Manager": "",
      "Is Individual": "F",
      "Bank Transaction Name": "",
      "Default Expense Account": "",
      "Comments": "",
      "1099 Eligible": "F",
      "Updated W-9?": "F",
      "W-9 Entity Type": "",
      "W-9 Signed Date": "",
      "Vendor Bill - Purchase Order Quantity Tolerance": "",
      "Vendor Bill - Purchase Order Amount Tolerance": "",
      "Vendor Bill - Purchase Order Quantity Difference": "",
      "Vendor Bill - Item Receipt Quantity Tolerance": "",
      "Vendor Bill - Item Receipt Amount Tolerance": "",
      "Vendor Bill - Item Receipt Quantity Difference": "",
      "dataURI": "https://5344479.app.netsuite.com/app/common/entity/vendor.nl?id=-3&compid=5344479"
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
  "_exportId": "624b37dae32ce437e2226439",
  "_connectionId": "5fa34d98fdaddb7eadf1f23c",
  "_flowId": "624b378cda31e165c7e5976c",
  "_integrationId": "62326d004c899123a43217c9",
  "pageIndex": 0,
  "settings": {
    "integration": {},
    "flowGrouping": {},
    "flow": {},
    "export": {},
    "connection": {}
  }
};

const result = preSavePage(options);
console.log(result);