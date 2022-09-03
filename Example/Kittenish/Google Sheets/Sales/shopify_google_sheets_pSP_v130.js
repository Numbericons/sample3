// v130

const rowKeys = ["total_price", "created_at", "cancelled_at", "closed_at", "confirmed"];

function setRow(object) {
  let retObj = {};

  rowKeys.forEach(key => { retObj[key] = object[key] })

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

function setRefund(refundObj) {
  const refund = {};

  refund.hour = setHour(refundObj.created_at);
  // refund.hour = setHour(refundObj.parentCreated);
  refund.total_price = 0;

  refundObj.transactions.forEach(tran => {
    if (tran.kind === 'refund') {
      const amount = (-parseFloat(tran.amount)).toFixed(2);
      refund.total_price = stringFloats(refund.total_price, amount)

    }
  })

  return refund;
}

function addRefunds(obj, refArr) {
  refArr.forEach(refund => {
    const returnly = refund.note && refund.note.includes("processed by Returnly");
    if (returnly) {
      const adjusted = setRefund(refund);
      let found = false;

      for (let i = 0; i < obj.lines.length; i++) {
        if (!found && obj.lines[i].hour === adjusted.hour) {
          obj.lines[i].total_price = stringFloats(obj.lines[i].total_price, adjusted.total_price)
          found = true;
          break;
        }
      }

      if (!found) obj.lines.push(adjusted);
    }
  })

  return obj;
}

function parentCreatedDate(refundArr, created) {
  for (let k = 0; k < refundArr.length; k++) {
    refundArr[k].parentCreated = created;
  }
  return refundArr;
}

function adjDaily(object) {
  const currDay = new Date().getDate();

  let retLines = [];

  for (let i = object.lines.length - 1; i > 0; i--) {
    const day = parseInt(object.lines[i].created_at.slice(8, 10));
    if (day === currDay) retLines.push(object.lines[i]);
  }

  object.lines = retLines;
  return object;
}

function preSavePage(options) {
  const daily = options.settings.export.exportType === "Daily";
  let retObj = { lines: [], page: options.pageIndex }
  let rowByHour = { hour: null };
  // let refunds = [];

  for (let i = 0; i < options.data.length; i++) {
    // if (options.data[i].cancelled_at) continue;

    let row = setRow(options.data[i]);
    row.hour = setHour(row.created_at);

    // if (options.data[i].refunds.length) {
    //   refunds = refunds.concat(parentCreatedDate(options.data[i].refunds, options.data[i].created_at));
    // }

    if (newHour(rowByHour.hour, row.hour)) {
      if (rowByHour.hour) retObj.lines.unshift(rowByHour);
      rowByHour = row;
    } else {
      rowByHour.total_price = stringFloats(rowByHour.total_price, row.total_price)
    }
  }

  if (rowByHour.hour) retObj.lines.unshift(rowByHour);
  // retObj = addRefunds(retObj, refunds);
  if (daily) retObj = adjDaily(retObj);

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
      "id": 4284153004098,
      "admin_graphql_api_id": "gid://shopify/Order/4284153004098",
      "app_id": 580111,
      "browser_ip": "69.254.168.60",
      "buyer_accepts_marketing": true,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "6b8e022339b41e5d87641588fb5009e3",
      "checkout_id": 26062876573762,
      "checkout_token": "b271b1e2bd298197e87ec250eb927411",
      "client_details": {
        "accept_language": "en-US,en;q=0.9",
        "browser_height": null,
        "browser_ip": "69.254.168.60",
        "browser_width": null,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 226.0.0.13.117 (iPhone13,2; iOS 15_2_1; en_US; en-US; scale=3.00; 1170x2532; 356244938)"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "fergusonmichaela@yahoo.com",
      "created_at": "2022-03-22T14:05:48-05:00",
      "currency": "USD",
      "current_subtotal_price": "96.00",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "96.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "96.00",
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
      "current_total_price": "103.50",
      "current_total_price_set": {
        "shop_money": {
          "amount": "103.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "103.50",
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
      "email": "fergusonmichaela@yahoo.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/collections/swim-collection/?utm_source=Instagram_Stories&utm_medium=PaidSocial&utm_campaign=Swim 1 - Jessie Carousel Story&fbclid=PAAaYbQ061Ucnuk7WU2hwyD1DO3u2KiPdyTsMxCAJ4UBVWozsza2T3JA0wvAs_aem_AdQ0BJ_luY6RCJjH7s5RSr53fY-abssEPSfXJbSIGxDXcUY4lQiVbn7HWmdQBa2PwwTlaHeI6DIkwnwEB0nrhPGe56bsOi9DZavxHTLm4AV4pAODGBbyOxnak6Fjm0rgtT8",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#348058",
      "note": null,
      "note_attributes": [],
      "number": 347058,
      "order_number": 348058,
      "order_status_url": "https://kittenish.com/29750488/orders/aaa4e0e762f3e7029757544241744693/authenticate?key=520d4c3cd08aefe32214fd07db0f8a29",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": null,
      "presentment_currency": "USD",
      "processed_at": "2022-03-22T14:05:46-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "96.00",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "96.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "96.00",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "aaa4e0e762f3e7029757544241744693",
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
      "total_line_items_price": "96.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "96.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "96.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "103.50",
      "total_price_set": {
        "shop_money": {
          "amount": "103.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "103.50",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "103.50",
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
      "total_tax": "0.00",
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
      "total_weight": 388,
      "updated_at": "2022-03-22T14:05:52-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Michaela",
        "address1": "300 North Water Street",
        "phone": "+12533072872",
        "city": "Mobile",
        "zip": "36602",
        "province": "Alabama",
        "country": "United States",
        "last_name": "Ferguson",
        "address2": "205",
        "company": "",
        "latitude": 30.698708,
        "longitude": -88.042062,
        "name": "Michaela Ferguson",
        "country_code": "US",
        "province_code": "AL"
      },
      "customer": {
        "id": 5492219641922,
        "email": "fergusonmichaela@yahoo.com",
        "accepts_marketing": true,
        "created_at": "2022-03-22T14:03:15-05:00",
        "updated_at": "2022-03-22T14:05:49-05:00",
        "first_name": "Michaela",
        "last_name": "Ferguson",
        "orders_count": 1,
        "state": "disabled",
        "total_spent": "103.50",
        "last_order_id": 4284153004098,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#348058",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-03-22T14:05:49-05:00",
        "marketing_opt_in_level": "single_opt_in",
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5492219641922",
        "default_address": {
          "id": 6743774101570,
          "customer_id": 5492219641922,
          "first_name": "Michaela",
          "last_name": "Ferguson",
          "company": "",
          "address1": "300 North Water Street",
          "address2": "205",
          "city": "Mobile",
          "province": "Alabama",
          "country": "United States",
          "zip": "36602",
          "phone": "+12533072872",
          "name": "Michaela Ferguson",
          "province_code": "AL",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10916195074114,
          "admin_graphql_api_id": "gid://shopify/LineItem/10916195074114",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 193,
          "name": "EMILIA RIBBED ONE PIECE - S",
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
          "price": "48.00",
          "price_set": {
            "shop_money": {
              "amount": "48.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "48.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6694739738690,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ESW12-KTN-S",
          "taxable": true,
          "title": "EMILIA RIBBED ONE PIECE",
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
          "variant_id": 39656849178690,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        },
        {
          "id": 10916195106882,
          "admin_graphql_api_id": "gid://shopify/LineItem/10916195106882",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 196,
          "name": "COUNTRY CLUB ONE PIECE SWIMSUIT - S",
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
          "price": "48.00",
          "price_set": {
            "shop_money": {
              "amount": "48.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "48.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6698443210818,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ESW0200-BLK-KTN-S",
          "taxable": true,
          "title": "COUNTRY CLUB ONE PIECE SWIMSUIT",
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
          "variant_id": 39665836097602,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        }
      ],
      "payment_details": {
        "credit_card_bin": "436618",
        "avs_result_code": "Y",
        "cvv_result_code": null,
        "credit_card_number": "•••• •••• •••• 0811",
        "credit_card_company": "Visa"
      },
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Michaela",
        "address1": "300 North Water Street",
        "phone": "+12533072872",
        "city": "Mobile",
        "zip": "36602",
        "province": "Alabama",
        "country": "United States",
        "last_name": "Ferguson",
        "address2": "205",
        "company": "",
        "latitude": 30.698708,
        "longitude": -88.042062,
        "name": "Michaela Ferguson",
        "country_code": "US",
        "province_code": "AL"
      },
      "shipping_lines": [
        {
          "id": 3557953404994,
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
  "_exportId": "623a05d539ffc85521abb055",
  "_connectionId": "61484a04b0f05b29ea7e19ab",
  "_flowId": "623a05d639ffc85521abb061",
  "_integrationId": "62326d004c899123a43217c9",
  "pageIndex": 0,
  "settings": {
    "integration": {},
    "flowGrouping": {},
    "flow": {},
    "export": {
      "exportType": "Daily"
    },
    "connection": {}
  }
};

const result = preSavePage(options);
console.log(result);