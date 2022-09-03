// v100

const locationKeys = ["id", "name"];

function adjLocation(location) {
  let retObj = {};

  locationKeys.forEach(key => { retObj[key] = location[key] })

  return retObj;
}

function preSavePage(options) {
  let optionsObj = { locations: [] };

  for (let i = 0; i < options.data.length; i++){
    optionsObj.locations.push(adjLocation(options.data[i]));
  }

  return {
    data: [optionsObj],
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}

const options = {
  "data": [
    {
      "id": 35221864514,
      "name": "Grapevine Warehouse",
      "address1": "4051 Freeport Parkway",
      "address2": "",
      "city": "Grapevine",
      "zip": "76051",
      "province": "TX",
      "country": "US",
      "phone": "",
      "created_at": "2019-11-21T14:09:24-06:00",
      "updated_at": "2020-01-31T12:17:46-06:00",
      "country_code": "US",
      "country_name": "United States",
      "province_code": "TX",
      "legacy": false,
      "active": false,
      "admin_graphql_api_id": "gid://shopify/Location/35221864514",
      "localized_country_name": "United States",
      "localized_province_name": "Texas"
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
  "_exportId": "623a62c7472d2f0f0c91f0eb",
  "_connectionId": "61484a04b0f05b29ea7e19ab",
  "_flowId": "623a5f37c082530521e8b3b4",
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