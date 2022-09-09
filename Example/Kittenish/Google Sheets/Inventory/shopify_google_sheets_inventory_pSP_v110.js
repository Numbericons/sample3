// v110

const productKeys = ["id", "title", "status"];
const variantKeys = ["id", "title", "product_id", "sku", "inventory_item_id"];

function adjProduct(product) {
  let retObj = {};

  productKeys.forEach(key => { retObj[key] = product[key] });

  retObj.variants = adjVariants(product.variants);

  retObj.variantsInvIds = getVariantInvIds(retObj.variants);

  retObj.variantTable = setVariantTable(retObj.variants);

  return retObj;
}

function setVariantTable(array) {
  let table = {};

  for (let k=0; k<array.length; k++){
    if (!table[array[k].inventory_item_id]) {
      table[array[k].inventory_item_id] = array[k];
    }
  }

  return table;
}

function getVariantInvIds(array) {
  let inventoryIds = [];

  for (let k=0; k<array.length; k++){
    inventoryIds.push(array[k].inventory_item_id);
  }

  return inventoryIds.join(", ");
}

function adjVariants(array) {
  let retArr = [];
  let variantsSeen = {};

  array.forEach(variant => {
    if (!variantsSeen[variant.id]) {
      variantsSeen[variant.id] = true;
      let newVariant = {};
  
      variantKeys.forEach(key => {
        newVariant[key] = variant[key];
      });
      retArr.push(newVariant);
    }
  });

  return retArr;
}

function preSavePage(options) {
  let optionsObj = { products: [] };

  for (let i = 0; i < options.data.length; i++){
    optionsObj.products.push(adjProduct(options.data[i]));
    optionsObj.pageIdx = options.pageIndex;
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
      "id": 6728955854914,
      "title": "MINI HAIR CLIP - MILK",
      "body_html": "",
      "vendor": "Kittenish",
      "product_type": "Hair Accessories",
      "created_at": "2022-03-22T13:05:40-05:00",
      "handle": "mini-hair-clip-milk",
      "updated_at": "2022-03-22T13:05:42-05:00",
      "published_at": null,
      "template_suffix": "",
      "status": "active",
      "published_scope": "global",
      "tags": "FAIRE",
      "admin_graphql_api_id": "gid://shopify/Product/6728955854914",
      "variants": [
        {
          "product_id": 6728955854914,
          "id": 39738674053186,
          "title": "Default Title",
          "price": "12.00",
          "sku": "MINIHAIRCLIP-MILK",
          "position": 1,
          "inventory_policy": "deny",
          "compare_at_price": null,
          "fulfillment_service": "manual",
          "inventory_management": "shopify",
          "option1": "Default Title",
          "option2": null,
          "option3": null,
          "created_at": "2022-03-22T13:05:40-05:00",
          "updated_at": "2022-03-22T13:05:40-05:00",
          "taxable": true,
          "barcode": "",
          "grams": 0,
          "image_id": null,
          "weight": 0,
          "weight_unit": "lb",
          "inventory_item_id": 41834783473730,
          "inventory_quantity": 0,
          "old_inventory_quantity": 0,
          "presentment_prices": [
            {
              "price": {
                "amount": "12.00",
                "currency_code": "USD"
              },
              "compare_at_price": null
            }
          ],
          "requires_shipping": true,
          "admin_graphql_api_id": "gid://shopify/ProductVariant/39738674053186",
          "inventoryLevels": [
            {
              "inventory_item_id": 41834783473730,
              "location_id": 87588878,
              "available": 0,
              "updated_at": "2022-03-22T13:05:40-05:00",
              "admin_graphql_api_id": "gid://shopify/InventoryLevel/545325070?inventory_item_id=41834783473730"
            },
            {
              "inventory_item_id": 41834783473730,
              "location_id": 36982652994,
              "available": 0,
              "updated_at": "2022-03-22T13:05:40-05:00",
              "admin_graphql_api_id": "gid://shopify/InventoryLevel/70871351362?inventory_item_id=41834783473730"
            },
            {
              "inventory_item_id": 41834783473730,
              "location_id": 36982718530,
              "available": 0,
              "updated_at": "2022-03-22T13:05:40-05:00",
              "admin_graphql_api_id": "gid://shopify/InventoryLevel/70871416898?inventory_item_id=41834783473730"
            },
            {
              "inventory_item_id": 41834783473730,
              "location_id": 35655417922,
              "available": 0,
              "updated_at": "2022-03-22T13:05:40-05:00",
              "admin_graphql_api_id": "gid://shopify/InventoryLevel/69532352578?inventory_item_id=41834783473730"
            },
            {
              "inventory_item_id": 41834783473730,
              "location_id": 35655385154,
              "available": 0,
              "updated_at": "2022-03-22T13:05:40-05:00",
              "admin_graphql_api_id": "gid://shopify/InventoryLevel/69532319810?inventory_item_id=41834783473730"
            },
            {
              "inventory_item_id": 41834783473730,
              "location_id": 60955983938,
              "available": 0,
              "updated_at": "2022-03-22T13:05:40-05:00",
              "admin_graphql_api_id": "gid://shopify/InventoryLevel/95270633538?inventory_item_id=41834783473730"
            },
            {
              "inventory_item_id": 41834783473730,
              "location_id": 36982784066,
              "available": 0,
              "updated_at": "2022-03-22T13:05:40-05:00",
              "admin_graphql_api_id": "gid://shopify/InventoryLevel/70871482434?inventory_item_id=41834783473730"
            },
            {
              "inventory_item_id": 41834783473730,
              "location_id": 36982685762,
              "available": 0,
              "updated_at": "2022-03-22T13:05:40-05:00",
              "admin_graphql_api_id": "gid://shopify/InventoryLevel/70871384130?inventory_item_id=41834783473730"
            },
            {
              "inventory_item_id": 41834783473730,
              "location_id": 36982751298,
              "available": 0,
              "updated_at": "2022-03-22T13:05:40-05:00",
              "admin_graphql_api_id": "gid://shopify/InventoryLevel/70871449666?inventory_item_id=41834783473730"
            },
            {
              "inventory_item_id": 41834783473730,
              "location_id": 36931240002,
              "available": 0,
              "updated_at": "2022-03-22T13:05:40-05:00",
              "admin_graphql_api_id": "gid://shopify/InventoryLevel/70816104514?inventory_item_id=41834783473730"
            }
          ]
        }
      ],
      "options": [
        {
          "product_id": 6728955854914,
          "id": 8750074396738,
          "name": "Title",
          "position": 1,
          "values": [
            "Default Title"
          ]
        }
      ],
      "images": [
        {
          "product_id": 6728955854914,
          "id": 28907694882882,
          "position": 1,
          "created_at": "2022-03-22T13:05:42-05:00",
          "updated_at": "2022-03-22T13:05:42-05:00",
          "alt": null,
          "width": 968,
          "height": 834,
          "src": "https://cdn.shopify.com/s/files/1/2975/0488/products/ScreenShot2022-03-22at1.04.08PM.png?v=1647972342",
          "variant_ids": [],
          "admin_graphql_api_id": "gid://shopify/ProductImage/28907694882882"
        }
      ],
      "image": {
        "product_id": 6728955854914,
        "id": 28907694882882,
        "position": 1,
        "created_at": "2022-03-22T13:05:42-05:00",
        "updated_at": "2022-03-22T13:05:42-05:00",
        "alt": null,
        "width": 968,
        "height": 834,
        "src": "https://cdn.shopify.com/s/files/1/2975/0488/products/ScreenShot2022-03-22at1.04.08PM.png?v=1647972342",
        "variant_ids": [],
        "admin_graphql_api_id": "gid://shopify/ProductImage/28907694882882"
      },
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