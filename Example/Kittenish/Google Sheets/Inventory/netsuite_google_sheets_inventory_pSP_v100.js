// v100

function preSavePage(options) {
  let inventory = { items: [], page: options.pageIndex };

  for (let k = 0; k < options.data.length; k++) {
    inventory.items.push(options.data[k]);
  }

  return {
    data: [inventory],
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}

const options = {
  "data": [
    {
      "id": null,
      "recordType": "inventorybalance",
      "Item": "093624875475",
      "Location": "Nashville",
      "Status": "Good",
      "On Hand": "30",
      "Available": "30",
      "Group": "Group"
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
  "_exportId": "6244ddb0bf23f93f60921158",
  "_connectionId": "5fa34d98fdaddb7eadf1f23c",
  "_flowId": "6244dd2910df7d43f9750a15",
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