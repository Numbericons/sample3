// v101

function setLocationTable(array) {
  let locationTable = {};

  for (let i = 0; i < array.length; i++) {
    locationTable[array[i].id] = { name: array[i].name };
  }

  return locationTable;
}

function postResponseMap(options) {
  const locationTable = setLocationTable(options.postResponseMapData[0].locationData);

  for (let k = 0; k < options.postResponseMapData[0].products.length; k++){
    options.postResponseMapData[0].products[k].locationTable = locationTable;
  }

  delete options.postResponseMapData[0].locationData;

  return options.postResponseMapData;
}

const options = {
  "postResponseMapData": [{
    "products": [
      {
        "id": 6728955854914,
        "title": "MINI HAIR CLIP - MILK",
        "status": "active",
        "variants": [
          {
            "id": 39738674053186,
            "title": "Default Title",
            "product_id": 6728955854914,
            "sku": "MINIHAIRCLIP-MILK",
            "inventory_item_id": 41834783473730
          },
          {
            "id": 39738674053186,
            "title": "Default Title",
            "product_id": 6728955854914,
            "sku": "MINIHAIRCLIP-MILK",
            "inventory_item_id": 41834783473730
          },
          {
            "id": 39738674053186,
            "title": "Default Title",
            "product_id": 6728955854914,
            "sku": "MINIHAIRCLIP-MILK",
            "inventory_item_id": 41834783473730
          },
          {
            "id": 39738674053186,
            "title": "Default Title",
            "product_id": 6728955854914,
            "sku": "MINIHAIRCLIP-MILK",
            "inventory_item_id": 41834783473730
          },
          {
            "id": 39738674053186,
            "title": "Default Title",
            "product_id": 6728955854914,
            "sku": "MINIHAIRCLIP-MILK",
            "inventory_item_id": 41834783473730
          }
        ]
      }
    ],
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
      },
      {
        "id": 87588878,
        "name": "Kittenish - CWC",
        "address1": "1016 Kasper Way",
        "address2": "",
        "city": "Goodlettsville",
        "zip": "37072",
        "province": "TN",
        "country": "US",
        "phone": "+16158593838",
        "created_at": "2018-02-01T14:36:35-06:00",
        "updated_at": "2020-01-31T12:19:58-06:00",
        "country_code": "US",
        "country_name": "United States",
        "province_code": "TN",
        "legacy": false,
        "active": true,
        "admin_graphql_api_id": "gid://shopify/Location/87588878",
        "localized_country_name": "United States",
        "localized_province_name": "Tennessee"
      },
      {
        "id": 36982652994,
        "name": "Kittenish Cafe",
        "address1": "304 11th Avenue South",
        "address2": "",
        "city": "Nashville",
        "zip": "37203",
        "province": "TN",
        "country": "US",
        "phone": "",
        "created_at": "2020-11-16T19:51:19-06:00",
        "updated_at": "2020-11-16T19:51:21-06:00",
        "country_code": "US",
        "country_name": "United States",
        "province_code": "TN",
        "legacy": false,
        "active": true,
        "admin_graphql_api_id": "gid://shopify/Location/36982652994",
        "localized_country_name": "United States",
        "localized_province_name": "Tennessee"
      },
      {
        "id": 36982718530,
        "name": "Kittenish Dallas",
        "address1": "3699 McKinney Ave.",
        "address2": "Suite 315",
        "city": "Dallas",
        "zip": "75204",
        "province": "Texas",
        "country": "US",
        "phone": "",
        "created_at": "2020-11-16T19:59:01-06:00",
        "updated_at": "2021-08-11T12:17:59-05:00",
        "country_code": "US",
        "country_name": "United States",
        "province_code": "TX",
        "legacy": false,
        "active": true,
        "admin_graphql_api_id": "gid://shopify/Location/36982718530",
        "localized_country_name": "United States",
        "localized_province_name": "Texas"
      },
      {
        "id": 35655417922,
        "name": "Kittenish Destin",
        "address1": "304 11th Avenue South",
        "address2": "M-103",
        "city": "Nashville",
        "zip": "37203",
        "province": "Tennessee",
        "country": "US",
        "phone": "",
        "created_at": "2020-03-12T10:39:31-05:00",
        "updated_at": "2021-08-11T12:19:57-05:00",
        "country_code": "US",
        "country_name": "United States",
        "province_code": "TN",
        "legacy": false,
        "active": true,
        "admin_graphql_api_id": "gid://shopify/Location/35655417922",
        "localized_country_name": "United States",
        "localized_province_name": "Tennessee"
      },
      {
        "id": 35655385154,
        "name": "Kittenish Nashville",
        "address1": "304 11th Avenue South",
        "address2": "",
        "city": "Nashville",
        "zip": "37203",
        "province": "TN",
        "country": "US",
        "phone": "",
        "created_at": "2020-03-12T10:38:50-05:00",
        "updated_at": "2020-03-12T10:38:50-05:00",
        "country_code": "US",
        "country_name": "United States",
        "province_code": "TN",
        "legacy": false,
        "active": true,
        "admin_graphql_api_id": "gid://shopify/Location/35655385154",
        "localized_country_name": "United States",
        "localized_province_name": "Tennessee"
      },
      {
        "id": 60955983938,
        "name": "Kittenish Scottsdale",
        "address1": "402 East Southern Avenue",
        "address2": "",
        "city": "Tempe",
        "zip": "85282",
        "province": "Arizona",
        "country": "US",
        "phone": "",
        "created_at": "2022-01-12T18:13:54-06:00",
        "updated_at": "2022-01-12T18:14:39-06:00",
        "country_code": "US",
        "country_name": "United States",
        "province_code": "AZ",
        "legacy": false,
        "active": true,
        "admin_graphql_api_id": "gid://shopify/Location/60955983938",
        "localized_country_name": "United States",
        "localized_province_name": "Arizona"
      },
      {
        "id": 36982784066,
        "name": "Kittenish Tampa",
        "address1": "800 S Village Cir",
        "address2": "",
        "city": "Tampa",
        "zip": "33606",
        "province": "Florida",
        "country": "US",
        "phone": "",
        "created_at": "2020-11-16T20:02:49-06:00",
        "updated_at": "2021-11-03T08:39:46-05:00",
        "country_code": "US",
        "country_name": "United States",
        "province_code": "FL",
        "legacy": false,
        "active": true,
        "admin_graphql_api_id": "gid://shopify/Location/36982784066",
        "localized_country_name": "United States",
        "localized_province_name": "Florida"
      },
      {
        "id": 36982685762,
        "name": "New Jersey",
        "address1": "304 11th Avenue South",
        "address2": "",
        "city": "Nashville",
        "zip": "37203",
        "province": "TN",
        "country": "US",
        "phone": "",
        "created_at": "2020-11-16T19:55:25-06:00",
        "updated_at": "2020-11-17T13:16:45-06:00",
        "country_code": "US",
        "country_name": "United States",
        "province_code": "TN",
        "legacy": false,
        "active": true,
        "admin_graphql_api_id": "gid://shopify/Location/36982685762",
        "localized_country_name": "United States",
        "localized_province_name": "Tennessee"
      },
      {
        "id": 36982751298,
        "name": "Pop Up Location",
        "address1": "304 11th Avenue South",
        "address2": "",
        "city": "Nashville",
        "zip": "37203",
        "province": "TN",
        "country": "US",
        "phone": "",
        "created_at": "2020-11-16T20:01:32-06:00",
        "updated_at": "2020-11-16T20:01:34-06:00",
        "country_code": "US",
        "country_name": "United States",
        "province_code": "TN",
        "legacy": false,
        "active": true,
        "admin_graphql_api_id": "gid://shopify/Location/36982751298",
        "localized_country_name": "United States",
        "localized_province_name": "Tennessee"
      },
      {
        "id": 36931240002,
        "name": "Store Inventory at Warehouse",
        "address1": "1016 Kasper Way",
        "address2": "",
        "city": "Goodletsville",
        "zip": "37072",
        "province": "TN",
        "country": "US",
        "phone": "+16158593838",
        "created_at": "2020-08-04T10:22:33-05:00",
        "updated_at": "2020-08-04T10:22:33-05:00",
        "country_code": "US",
        "country_name": "United States",
        "province_code": "TN",
        "legacy": false,
        "active": true,
        "admin_graphql_api_id": "gid://shopify/Location/36931240002",
        "localized_country_name": "United States",
        "localized_province_name": "Tennessee"
      }
    ]
  }],
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