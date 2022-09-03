// v102

const inventoryLevelsKeys = ["inventory_item_id", "location_id", "available"];

function adjInvLevels(data) {
  let retArr = [];

  for (let i = 0; i < data.inventoryLevels.length; i++) {
    let level = adjLevel(data.inventoryLevels[i]);

    level.location_name = data.locationTable[level.location_id].name;
    level.variant_sku = data.variantTable[level.inventory_item_id].sku;
    retArr.push(level);
  }

  return retArr;
}

function adjLevel(level) {
  let retObj = {};
  inventoryLevelsKeys.forEach(key => { retObj[key] = level[key] });

  return retObj;
}

function postResponseMap(options) {
  options.postResponseMapData[0].inventoryLevels = adjInvLevels(options.postResponseMapData[0]);

  return options.postResponseMapData;
}

const options = {
  "postResponseMapData": [
    {
      "_PARENT": {
        "pageIdx": 0,
        "locationData": [
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
        ]
      },
      "id": 4537190285378,
      "title": "12 SOUTH NECKLACE",
      "status": "draft",
      "variants": [
        {
          "id": 32295452704834,
          "title": "ONE SIZE",
          "product_id": 4537190285378,
          "sku": "12SOUTHNECK-KTN",
          "inventory_item_id": 34041050464322
        }
      ],
      "variantsInvIds": "34041050464322",
      "variantTable": {
        "34041050464322": {
          "id": 32295452704834,
          "title": "ONE SIZE",
          "product_id": 4537190285378,
          "sku": "12SOUTHNECK-KTN",
          "inventory_item_id": 34041050464322
        }
      },
      "inventoryLevels": [
        {
          "inventory_item_id": 34041050464322,
          "location_id": 35655385154,
          "available": 0,
          "updated_at": "2021-06-14T16:25:21-05:00",
          "admin_graphql_api_id": "gid://shopify/InventoryLevel/69532319810?inventory_item_id=34041050464322"
        }
      ]
    }
  ],
  "_exportId": "623a667633676154eacc6749",
  "_connectionId": "61484a04b0f05b29ea7e19ab",
  "_flowId": "623a5f37c082530521e8b3b4",
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

