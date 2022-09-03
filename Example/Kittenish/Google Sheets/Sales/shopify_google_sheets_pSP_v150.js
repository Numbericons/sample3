// v150

const rowDetailKeys = ["total_price", "total_tax", "created_at", "cancelled_at", "closed_at", "confirmed", "id", "order_number"];
const rowSummaryKeys = ["total_price", "total_tax", "created_at", "cancelled_at", "closed_at", "confirmed"];

function setRow(object, detail) {
  let retObj = {};

  if (detail) rowDetailKeys.forEach(key => { retObj[key] = object[key] })
  if (!detail) rowSummaryKeys.forEach(key => { retObj[key] = object[key] })

  retObj.total_price = stringSubtract(retObj.total_price, retObj.total_tax);

  return retObj;
}

function setHour(date) {
  let dateStr = date.slice(0, 13);
  dateStr = `${dateStr.slice(5, 10)}-${dateStr.slice(0, 4)} ${dateStr.slice(11, 13)}`;
  dateStr = dateStr.replace(/-/g, "/");

  return dateStr + ":00:00";
}

function newHour(currHour, newHour) {
  if (!currHour) return true;

  return new Date(currHour) > new Date(newHour);
}

function stringFloats(price1, price2) {
  return (parseFloat(price1) + parseFloat(price2)).toFixed(2);
}

function stringSubtract(price1, price2) {
  return (parseFloat(price1) - parseFloat(price2)).toFixed(2);
}

function setRefund(refundObj) {
  const refund = {};

  refund.hour = setHour(refundObj.created_at);
  // refund.hour = setHour(refundObj.parentCreated);
  refund.total_price = 0;

  refundObj.transactions.forEach(tran => {
    if (tran.kind === 'refund') {
      const amount = (-parseFloat(tran.amount)).toFixed(2);
      refund.total_price = stringFloats(refund.total_price, amount);
    }
  })

  return refund;
}

function parentCreatedDate(refundArr, created) {
  for (let k = 0; k < refundArr.length; k++) {
    refundArr[k].parentCreated = created;
  }
  return refundArr;
}

function adjDaily(object) {
  let newDate = new Date();
  let utc = newDate.getTime() + (newDate.getTimezoneOffset() * 60000);
  newDate = new Date(utc + (3600000 * -6));
  const currDay = newDate.getDate();

  let retLines = [];

  for (let i = object.lines.length - 1; i >= 0; i--) {
    const day = parseInt(object.lines[i].created_at.slice(8, 10));
    if (day === currDay) retLines.push(object.lines[i]);
  }

  object.lines = retLines;
  return object;
}

function orderSummary(data, object, isDaily) {
  let rowByHour = { hour: null };

  for (let i = 0; i < data.length; i++) {
    let row = setRow(data[i], false);
    row.hour = setHour(row.created_at);

    if (newHour(rowByHour.hour, row.hour)) {
      if (rowByHour.hour) object.lines.unshift(rowByHour);
      rowByHour = row;
    } else {
      rowByHour.total_price = stringFloats(rowByHour.total_price, row.total_price);
    }
  }

  if (rowByHour.hour) object.lines.unshift(rowByHour);
  if (isDaily) object = adjDaily(object);

  return object;
}

function orderDetail(data, object) {
  for (let i = 0; i < data.length; i++) {
    let row = setRow(data[i], true);
    row.hour = setHour(row.created_at);

    let hasAddr = data[i].shipping_address && data[i].shipping_address.country === "United States";
    
    if (hasAddr) {
      row.country = data[i].shipping_address.country;

      if (data[i].shipping_address.country === "United States") {
        const zip = data[i].shipping_address.zip;
        
        if (zip) {
          let validZip = true;
          const alpha = 'abcdefghijklmnopqrstuvwxyz';
  
          for (let k = 0; k < zip.length; k++){ 
            if (alpha.includes(zip[k].toLowerCase())) {
              validZip = false;
              break;
            }
          }
  
          if (validZip) {
            row.zip = data[i].shipping_address.zip;
          }
        }
      }
    }

    row.item_qty = data[i].line_items.length;

    if (data[i].customer) {
      row.returning_customer = data[i].customer.orders_count > 1 ? "Y" : "N";
    } else {
      row.returning_customer = "N";
    }

    object.lines.unshift(row);
  }


  return object;
}

function preSavePage(options) {
  const daily = options.settings.export.exportType === "Daily";
  const detail = options.settings.export.exportType === "Detail";
  let retObj = { lines: [], page: options.pageIndex }

  if (detail) {
    retObj = orderDetail(options.data, retObj);
  } else {
    retObj = orderSummary(options.data, retObj, daily);
  }

  return {
    data: [retObj],
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}

const options = {
  "data": [
    {
      "id": 4284086255682,
      "admin_graphql_api_id": "gid://shopify/Order/4284086255682",
      "app_id": 580111,
      "browser_ip": "128.112.217.178",
      "buyer_accepts_marketing": true,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "b11af5d158629e56fb7c313dc28286ce",
      "checkout_id": 26062454030402,
      "checkout_token": "d4aed02a6151867a1025ad53a30a4c7b",
      "client_details": {
        "accept_language": "en-US,en;q=0.5",
        "browser_height": 927,
        "browser_ip": "128.112.217.178",
        "browser_width": 1903,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "jconoline@gmail.com",
      "created_at": "2022-03-22T13:19:18-05:00",
      "currency": "USD",
      "current_subtotal_price": "82.00",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "82.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "82.00",
          "currency_code": "USD"
        }
      },
      "current_total_discounts": "0.00",
      "current_total_discounts_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
          "currency_code": "USD"
        }
      },
      "current_total_duties_set": null,
      "current_total_price": "89.50",
      "current_total_price_set": {
        "shop_money": {
          "amount": "89.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "89.50",
          "currency_code": "USD"
        }
      },
      "current_total_tax": "0.00",
      "current_total_tax_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
          "currency_code": "USD"
        }
      },
      "customer_locale": "en-US",
      "device_id": null,
      "discount_codes": [],
      "email": "jconoline@gmail.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#348028",
      "note": null,
      "note_attributes": [],
      "number": 347028,
      "order_number": 348028,
      "order_status_url": "https://kittenish.com/29750488/orders/bbdd30d51acf1f488a959ae65abfc19e/authenticate?key=1d0eb6099c3e6fa82035198860692415",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": null,
      "presentment_currency": "USD",
      "processed_at": "2022-03-22T13:19:18-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "https://www.google.com/",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "82.00",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "82.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "82.00",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "bbdd30d51acf1f488a959ae65abfc19e",
      "total_discounts": "0.00",
      "total_discounts_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
          "currency_code": "USD"
        }
      },
      "total_line_items_price": "82.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "82.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "82.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "89.50",
      "total_price_set": {
        "shop_money": {
          "amount": "89.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "89.50",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "89.50",
      "total_shipping_price_set": {
        "shop_money": {
          "amount": "7.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "7.50",
          "currency_code": "USD"
        }
      },
      "total_tax": "5.00",
      "total_tax_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
          "currency_code": "USD"
        }
      },
      "total_tip_received": "0.00",
      "total_weight": 195,
      "updated_at": "2022-03-22T13:19:22-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Justine",
        "address1": "1430 Pheasant Run Circle",
        "phone": "+1 215-806-3548",
        "city": "Yardley",
        "zip": "19067",
        "province": "Pennsylvania",
        "country": "United States",
        "last_name": "Conoline",
        "address2": "",
        "company": "",
        "latitude": 40.2474871,
        "longitude": -74.893884,
        "name": "Justine Conoline",
        "country_code": "US",
        "province_code": "PA"
      },
      "customer": {
        "id": 5492027424834,
        "email": "jconoline@gmail.com",
        "accepts_marketing": true,
        "created_at": "2022-03-22T13:18:25-05:00",
        "updated_at": "2022-03-22T13:19:19-05:00",
        "first_name": "Justine",
        "last_name": "Conoline",
        "orders_count": 1,
        "state": "disabled",
        "total_spent": "89.50",
        "last_order_id": 4284086255682,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#348028",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-03-22T13:18:25-05:00",
        "marketing_opt_in_level": "single_opt_in",
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5492027424834",
        "default_address": {
          "id": 6743717642306,
          "customer_id": 5492027424834,
          "first_name": "Justine",
          "last_name": "Conoline",
          "company": "",
          "address1": "1430 Pheasant Run Circle",
          "address2": "",
          "city": "Yardley",
          "province": "Pennsylvania",
          "country": "United States",
          "zip": "19067",
          "phone": "+1 215-806-3548",
          "name": "Justine Conoline",
          "province_code": "PA",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10916040507458,
          "admin_graphql_api_id": "gid://shopify/LineItem/10916040507458",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 74,
          "name": "IBIZA BLACK BIKINI BOTTOMS - S",
          "origin_location": {
            "id": 1770244735042,
            "country_code": "US",
            "province_code": "TN",
            "name": "Kittenish",
            "address1": "1016 Kasper Way",
            "address2": "",
            "city": "Goodlettsville",
            "zip": "37072"
          },
          "price": "40.00",
          "price_set": {
            "shop_money": {
              "amount": "40.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "40.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6697433333826,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ACSW80010B-BLK-KTN-S",
          "taxable": true,
          "title": "IBIZA BLACK BIKINI BOTTOMS",
          "total_discount": "0.00",
          "total_discount_set": {
            "shop_money": {
              "amount": "0.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "0.00",
              "currency_code": "USD"
            }
          },
          "variant_id": 39662194589762,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        },
        {
          "id": 10916040540226,
          "admin_graphql_api_id": "gid://shopify/LineItem/10916040540226",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 122,
          "name": "IBIZA BLACK BIKINI TOP - S",
          "origin_location": {
            "id": 1770244735042,
            "country_code": "US",
            "province_code": "TN",
            "name": "Kittenish",
            "address1": "1016 Kasper Way",
            "address2": "",
            "city": "Goodlettsville",
            "zip": "37072"
          },
          "price": "42.00",
          "price_set": {
            "shop_money": {
              "amount": "42.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "42.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6697431203906,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ACSW80010T-BLK-KTN-S",
          "taxable": true,
          "title": "IBIZA BLACK BIKINI TOP",
          "total_discount": "0.00",
          "total_discount_set": {
            "shop_money": {
              "amount": "0.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "0.00",
              "currency_code": "USD"
            }
          },
          "variant_id": 39662192132162,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        }
      ],
      "payment_details": {
        "credit_card_bin": "371243",
        "avs_result_code": "Y",
        "cvv_result_code": "M",
        "credit_card_number": "•••• •••• •••• 2008",
        "credit_card_company": "American Express"
      },
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Justine",
        "address1": "1430 Pheasant Run Circle",
        "phone": "+1 215-806-3548",
        "city": "Yardley",
        "zip": "19067",
        "province": "Pennsylvania",
        "country": "United States",
        "last_name": "Conoline",
        "address2": "",
        "company": "",
        "latitude": 40.2474871,
        "longitude": -74.893884,
        "name": "Justine Conoline",
        "country_code": "US",
        "province_code": "PA"
      },
      "shipping_lines": [
        {
          "id": 3557908512834,
          "carrier_identifier": null,
          "code": "UPSM",
          "delivery_category": null,
          "discounted_price": "7.50",
          "discounted_price_set": {
            "shop_money": {
              "amount": "7.50",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "7.50",
              "currency_code": "USD"
            }
          },
          "phone": null,
          "price": "7.50",
          "price_set": {
            "shop_money": {
              "amount": "7.50",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "7.50",
              "currency_code": "USD"
            }
          },
          "requested_fulfillment_service_id": null,
          "source": "shopify",
          "title": "UPSM",
          "tax_lines": [],
          "discount_allocations": []
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
  "_exportId": "623a4d48472d2f0f0c91a9a1",
  "_connectionId": "61484a04b0f05b29ea7e19ab",
  "_flowId": "623a4d49472d2f0f0c91a9ad",
  "_integrationId": "62326d004c899123a43217c9",
  "pageIndex": 0,
  "settings": {
    "integration": {},
    "flowGrouping": {},
    "flow": {},
    "export": {
      "exportType": "Detail"
    },
    "connection": {}
  }
};

const result = preSavePage(options);
console.log(result);