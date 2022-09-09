// v111
//  3/16 one hour sample with refund

const rowKeys = ["total_price", "created_at"];

function setRow(object) {
  let retObj = {};

  rowKeys.forEach(key => { retObj[key] = object[key] })

  return retObj;
}

function setHour(date) {
  let dateStr = date.slice(0,13);
  dateStr = `${dateStr.slice(5,10)}-${dateStr.slice(0,4)} ${dateStr.slice(11,13)}`;
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
    const amount = (-parseFloat(tran.amount)).toFixed(2);
    refund.total_price = stringFloats(refund.total_price, amount)
  })
  
  return refund;
}

function addRefunds(obj, refArr) {
  refArr.forEach(refund => {
    const adjusted = setRefund(refund);
    let found = false;

    for (let i = 0; i < obj.lines.length; i++){
      if (!found && obj.lines[i].hour === adjusted.hour) {
        obj.lines[i].total_price = stringFloats(obj.lines[i].total_price, adjusted.total_price)
        found = true;
        break;
      }
    }

    if (!found) obj.lines.push(adjusted);
   })

  return obj;
}

function parentCreatedDate(refundArr, created) {
  for (let k = 0; k < refundArr.length; k++) {
    refundArr[k].parentCreated = created;
  }
  return refundArr;
}

function preSavePage(options) {
  let retObj = { lines: [], page: options.pageIndex }
  let rowByHour = { hour: null };
  let refunds = [];

  for (let i = 0; i < options.data.length; i++) {
    let row = setRow(options.data[i]);
    row.hour = setHour(row.created_at);

    if (options.data[i].refunds.length) {
      refunds = refunds.concat(parentCreatedDate(options.data[i].refunds, options.data[i].created_at));
    }
    
    if (newHour(rowByHour.hour, row.hour)) {
      if (rowByHour.hour) retObj.lines.unshift(rowByHour);
      rowByHour = row;
    } else {
      rowByHour.total_price = stringFloats(rowByHour.total_price, row.total_price)
    }
  }

  if (rowByHour.hour) retObj.lines.unshift(rowByHour);
  retObj = addRefunds(retObj, refunds);

  return {
    data: [retObj],
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}

const options = {
  data: [
    {
      "id": 4274219155522,
      "admin_graphql_api_id": "gid://shopify/Order/4274219155522",
      "app_id": 580111,
      "browser_ip": "174.195.131.106",
      "buyer_accepts_marketing": false,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "f672ed7bfbbdb095912561fc2c857b72",
      "checkout_id": 25980427436098,
      "checkout_token": "ee37e81f740e0e56d8671c750136ebe6",
      "client_details": {
        "accept_language": "en-US,en;q=0.9",
        "browser_height": 664,
        "browser_ip": "174.195.131.106",
        "browser_width": 390,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Mobile/15E148 Safari/604.1"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "pinkdancer3555@aim.com",
      "created_at": "2022-03-17T00:16:31-05:00",
      "currency": "USD",
      "current_subtotal_price": "86.40",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "86.40",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "86.40",
          "currency_code": "USD"
        }
      },
      "current_total_discounts": "9.60",
      "current_total_discounts_set": {
        "shop_money": {
          "amount": "9.60",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "9.60",
          "currency_code": "USD"
        }
      },
      "current_total_duties_set": null,
      "current_total_price": "93.90",
      "current_total_price_set": {
        "shop_money": {
          "amount": "93.90",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "93.90",
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
      "discount_codes": [
        {
          "code": "WELCOME102FNF5WCJ",
          "amount": "9.60",
          "type": "percentage"
        }
      ],
      "email": "pinkdancer3555@aim.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#345040",
      "note": null,
      "note_attributes": [],
      "number": 344040,
      "order_number": 345040,
      "order_status_url": "https://kittenish.com/29750488/orders/ae9636a01f550e902af72438047b5afd/authenticate?key=1c725cf95900ca622e12ddc80b2258de",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": null,
      "presentment_currency": "USD",
      "processed_at": "2022-03-17T00:16:28-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "86.40",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "86.40",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "86.40",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "ae9636a01f550e902af72438047b5afd",
      "total_discounts": "9.60",
      "total_discounts_set": {
        "shop_money": {
          "amount": "9.60",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "9.60",
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
      "total_price": "93.90",
      "total_price_set": {
        "shop_money": {
          "amount": "93.90",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "93.90",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "93.90",
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
      "total_weight": 816,
      "updated_at": "2022-03-17T00:16:35-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Aurora",
        "address1": "116 Avenida Santa Margarita",
        "phone": "(760) 447-3555",
        "city": "San clemente ",
        "zip": "92672",
        "province": "California",
        "country": "United States",
        "last_name": "Vilchis",
        "address2": "",
        "company": "",
        "latitude": 33.3990735,
        "longitude": -117.5932162,
        "name": "Aurora Vilchis",
        "country_code": "US",
        "province_code": "CA"
      },
      "customer": {
        "id": 5484924600386,
        "email": "pinkdancer3555@aim.com",
        "accepts_marketing": false,
        "created_at": "2022-03-17T00:12:03-05:00",
        "updated_at": "2022-03-17T00:16:32-05:00",
        "first_name": "Aurora",
        "last_name": "Vilchis",
        "orders_count": 1,
        "state": "disabled",
        "total_spent": "93.90",
        "last_order_id": 4274219155522,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#345040",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-03-17T00:12:03-05:00",
        "marketing_opt_in_level": null,
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5484924600386",
        "default_address": {
          "id": 6736402972738,
          "customer_id": 5484924600386,
          "first_name": "Aurora",
          "last_name": "Vilchis",
          "company": "",
          "address1": "116 Avenida Santa Margarita",
          "address2": "",
          "city": "San clemente",
          "province": "California",
          "country": "United States",
          "zip": "92672",
          "phone": "(760) 447-3555",
          "name": "Aurora Vilchis",
          "province_code": "CA",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [
        {
          "target_type": "line_item",
          "type": "discount_code",
          "value": "10.0",
          "value_type": "percentage",
          "allocation_method": "across",
          "target_selection": "all",
          "code": "WELCOME102FNF5WCJ"
        }
      ],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10896950886466,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896950886466",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 210,
          "name": "EMILIA RIBBED ONE PIECE - M",
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
          "sku": "ESW12-KTN-M",
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
          "variant_id": 39656849211458,
          "variant_inventory_management": "shopify",
          "variant_title": "M",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": [
            {
              "amount": "4.80",
              "amount_set": {
                "shop_money": {
                  "amount": "4.80",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "4.80",
                  "currency_code": "USD"
                }
              },
              "discount_application_index": 0
            }
          ]
        },
        {
          "id": 10896950919234,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896950919234",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 607,
          "name": "BEST DRESSED CHOCOLATE JUMPSUIT - M",
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
          "product_id": 6643004866626,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "KIT1180-KTN-M",
          "taxable": true,
          "title": "BEST DRESSED CHOCOLATE JUMPSUIT",
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
          "variant_id": 39501958971458,
          "variant_inventory_management": "shopify",
          "variant_title": "M",
          "vendor": "Kittenish x MK",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": [
            {
              "amount": "4.80",
              "amount_set": {
                "shop_money": {
                  "amount": "4.80",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "4.80",
                  "currency_code": "USD"
                }
              },
              "discount_application_index": 0
            }
          ]
        }
      ],
      "payment_details": {
        "credit_card_bin": "426684",
        "avs_result_code": "Y",
        "cvv_result_code": "M",
        "credit_card_number": "•••• •••• •••• 2933",
        "credit_card_company": "Visa"
      },
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Aurora",
        "address1": "116 Avenida Santa Margarita",
        "phone": "(760) 447-3555",
        "city": "San clemente ",
        "zip": "92672",
        "province": "California",
        "country": "United States",
        "last_name": "Vilchis",
        "address2": "",
        "company": "",
        "latitude": 33.3990735,
        "longitude": -117.5932162,
        "name": "Aurora Vilchis",
        "country_code": "US",
        "province_code": "CA"
      },
      "shipping_lines": [
        {
          "id": 3551317393474,
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
    },
    {
      "id": 4274200739906,
      "admin_graphql_api_id": "gid://shopify/Order/4274200739906",
      "app_id": 580111,
      "browser_ip": "75.115.61.220",
      "buyer_accepts_marketing": true,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "877a8300306f703da998302447fcb2fb",
      "checkout_id": 25980471672898,
      "checkout_token": "92c22c1c2d09041238b5615c061ce73c",
      "client_details": {
        "accept_language": "en-US,en;q=0.9",
        "browser_height": 859,
        "browser_ip": "75.115.61.220",
        "browser_width": 428,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 175.0.0.23.117 (iPhone13,4; iOS 15_3_1; en_US; en; scale=3.00; 1284x2778; 272995447)"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "vanessanietonet@hotmail.com",
      "created_at": "2022-03-17T00:11:14-05:00",
      "currency": "USD",
      "current_subtotal_price": "48.00",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "48.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "48.00",
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
      "current_total_price": "59.39",
      "current_total_price_set": {
        "shop_money": {
          "amount": "59.39",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "59.39",
          "currency_code": "USD"
        }
      },
      "current_total_tax": "3.89",
      "current_total_tax_set": {
        "shop_money": {
          "amount": "3.89",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "3.89",
          "currency_code": "USD"
        }
      },
      "customer_locale": "en-US",
      "device_id": null,
      "discount_codes": [],
      "email": "vanessanietonet@hotmail.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/collections/swim-collection/?utm_source=Instagram_Stories&utm_medium=PaidSocial&utm_campaign=Swim 1 - Jessie Carousel Story&fbclid=PAAab5eUyyqZGnL2Dnlc19_jOVOh0Xd-ZSr5H8D-C51ihpfbsSLUHXKFsKGt4_aem_AduBsd0Bp1Cre8Z3vbLAASlm6dSuHKE21IKPLTctwiBXSGnmSZRkxR9e1cWvvXdk0zSWEpzhpBuq6ZJhjtHRusS6f_vuDwylyIuP7h-QPpheGSxMJ-xmVRqmgMy7wt5iyR4",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#345039",
      "note": null,
      "note_attributes": [],
      "number": 344039,
      "order_number": 345039,
      "order_status_url": "https://kittenish.com/29750488/orders/5bb5383a09c81e9cf620fc2467a77898/authenticate?key=2a7e4f6f8602a0afb3f2840487d35e9f",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": null,
      "presentment_currency": "USD",
      "processed_at": "2022-03-17T00:11:13-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "48.00",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "48.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "48.00",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [
        {
          "price": "3.33",
          "rate": 0.06,
          "title": "FL State Tax",
          "price_set": {
            "shop_money": {
              "amount": "3.33",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "3.33",
              "currency_code": "USD"
            }
          },
          "channel_liable": false
        },
        {
          "price": "0.56",
          "rate": 0.01,
          "title": "Pasco County Tax",
          "price_set": {
            "shop_money": {
              "amount": "0.56",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "0.56",
              "currency_code": "USD"
            }
          },
          "channel_liable": false
        }
      ],
      "taxes_included": false,
      "test": false,
      "token": "5bb5383a09c81e9cf620fc2467a77898",
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
      "total_line_items_price": "48.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "48.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "48.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "59.39",
      "total_price_set": {
        "shop_money": {
          "amount": "59.39",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "59.39",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "59.39",
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
      "total_tax": "3.89",
      "total_tax_set": {
        "shop_money": {
          "amount": "3.89",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "3.89",
          "currency_code": "USD"
        }
      },
      "total_tip_received": "0.00",
      "total_weight": 209,
      "updated_at": "2022-03-17T00:11:17-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Vanessa ",
        "address1": "1595 Ludigton Ave",
        "phone": "(941) 301-7072",
        "city": "Wesley Chapel",
        "zip": "33543",
        "province": "Florida",
        "country": "United States",
        "last_name": "Nieto",
        "address2": "",
        "company": "",
        "latitude": 28.1804146,
        "longitude": -82.2839788,
        "name": "Vanessa  Nieto",
        "country_code": "US",
        "province_code": "FL"
      },
      "customer": {
        "id": 5484922994754,
        "email": "vanessanietonet@hotmail.com",
        "accepts_marketing": true,
        "created_at": "2022-03-17T00:07:51-05:00",
        "updated_at": "2022-03-17T00:11:14-05:00",
        "first_name": "Vanessa ",
        "last_name": "Nieto",
        "orders_count": 1,
        "state": "disabled",
        "total_spent": "59.39",
        "last_order_id": 4274200739906,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#345039",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-03-17T00:07:51-05:00",
        "marketing_opt_in_level": "single_opt_in",
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5484922994754",
        "default_address": {
          "id": 6736397795394,
          "customer_id": 5484922994754,
          "first_name": "Vanessa ",
          "last_name": "Nieto",
          "company": "",
          "address1": "1595 Ludigton Ave",
          "address2": "",
          "city": "Wesley Chapel",
          "province": "Florida",
          "country": "United States",
          "zip": "33543",
          "phone": "(941) 301-7072",
          "name": "Vanessa  Nieto",
          "province_code": "FL",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10896936468546,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896936468546",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 210,
          "name": "EMILIA RIBBED ONE PIECE - M",
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
          "sku": "ESW12-KTN-M",
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
          "variant_id": 39656849211458,
          "variant_inventory_management": "shopify",
          "variant_title": "M",
          "vendor": "Swim 2022",
          "tax_lines": [
            {
              "channel_liable": false,
              "price": "2.88",
              "price_set": {
                "shop_money": {
                  "amount": "2.88",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "2.88",
                  "currency_code": "USD"
                }
              },
              "rate": 0.06,
              "title": "FL State Tax"
            },
            {
              "channel_liable": false,
              "price": "0.48",
              "price_set": {
                "shop_money": {
                  "amount": "0.48",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "0.48",
                  "currency_code": "USD"
                }
              },
              "rate": 0.01,
              "title": "Pasco County Tax"
            }
          ],
          "duties": [],
          "discount_allocations": []
        }
      ],
      "payment_details": {
        "credit_card_bin": "440066",
        "avs_result_code": "Z",
        "cvv_result_code": "M",
        "credit_card_number": "•••• •••• •••• 5648",
        "credit_card_company": "Visa"
      },
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Vanessa ",
        "address1": "1595 Ludigton Ave",
        "phone": "(941) 301-7072",
        "city": "Wesley Chapel",
        "zip": "33543",
        "province": "Florida",
        "country": "United States",
        "last_name": "Nieto",
        "address2": "",
        "company": "",
        "latitude": 28.1804146,
        "longitude": -82.2839788,
        "name": "Vanessa  Nieto",
        "country_code": "US",
        "province_code": "FL"
      },
      "shipping_lines": [
        {
          "id": 3551305990210,
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
          "tax_lines": [
            {
              "channel_liable": false,
              "price": "0.45",
              "price_set": {
                "shop_money": {
                  "amount": "0.45",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "0.45",
                  "currency_code": "USD"
                }
              },
              "rate": 0.06,
              "title": "FL State Tax"
            },
            {
              "channel_liable": false,
              "price": "0.08",
              "price_set": {
                "shop_money": {
                  "amount": "0.08",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "0.08",
                  "currency_code": "USD"
                }
              },
              "rate": 0.01,
              "title": "Pasco County Tax"
            }
          ],
          "discount_allocations": []
        }
      ]
    },
    {
      "id": 4274163744834,
      "admin_graphql_api_id": "gid://shopify/Order/4274163744834",
      "app_id": 580111,
      "browser_ip": "76.170.113.37",
      "buyer_accepts_marketing": true,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": null,
      "checkout_id": 25980326084674,
      "checkout_token": "ec85d3e8e16cc528204fa0cb7f69e1b4",
      "client_details": {
        "accept_language": "en-US,en;q=0.9",
        "browser_height": 675,
        "browser_ip": "76.170.113.37",
        "browser_width": 390,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 226.0.0.13.117 (iPhone13,3; iOS 15_3_1; en_US; en-US; scale=3.00; 1170x2532; 356244938)"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "tlhowell23@gmail.com",
      "created_at": "2022-03-16T23:57:29-05:00",
      "currency": "USD",
      "current_subtotal_price": "119.00",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "119.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "119.00",
          "currency_code": "USD"
        }
      },
      "current_total_discounts": "21.00",
      "current_total_discounts_set": {
        "shop_money": {
          "amount": "21.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "21.00",
          "currency_code": "USD"
        }
      },
      "current_total_duties_set": null,
      "current_total_price": "126.50",
      "current_total_price_set": {
        "shop_money": {
          "amount": "126.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "126.50",
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
      "discount_codes": [
        {
          "code": "KELSEY15",
          "amount": "21.00",
          "type": "percentage"
        }
      ],
      "email": "tlhowell23@gmail.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "buy_now_pay_later_with_klarna",
      "landing_site": "/collections/swim-collection/?utm_source=Instagram_Stories&utm_medium=PaidSocial&utm_campaign=Swim 1 - Jessie Carousel Story&fbclid=PAAabd-dYAaRCS24mnVrAAjb1zm0S6He1B6tJ1yrMHIxk8ShiYGRFN2d7ZIOs_aem_Adtepfxsu6-6VzqCqIXasx0wC5wrLaO5u6H9gslProLKCYei1P3ZHEMDibTT1jjZ_RhHbdhSCKAxDsyMOkEm0-r71_N6pPWBCGlB415-CCHfQMXDPXCjkxTvn5n0YH_taqE",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#345038",
      "note": null,
      "note_attributes": [],
      "number": 344038,
      "order_number": 345038,
      "order_status_url": "https://kittenish.com/29750488/orders/632e02044471a979f2bdb9e0cd7044c7/authenticate?key=095137d3a8530052342d275eca35226f",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "buy_now_pay_later_with_klarna"
      ],
      "phone": null,
      "presentment_currency": "USD",
      "processed_at": "2022-03-16T23:57:29-05:00",
      "processing_method": "offsite",
      "reference": null,
      "referring_site": "",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "119.00",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "119.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "119.00",
          "currency_code": "USD"
        }
      },
      "tags": "buy_now_pay_later_with_klarna, Klarna Payments",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "632e02044471a979f2bdb9e0cd7044c7",
      "total_discounts": "21.00",
      "total_discounts_set": {
        "shop_money": {
          "amount": "21.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "21.00",
          "currency_code": "USD"
        }
      },
      "total_line_items_price": "140.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "140.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "140.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "126.50",
      "total_price_set": {
        "shop_money": {
          "amount": "126.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "126.50",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "126.50",
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
      "total_weight": 725,
      "updated_at": "2022-03-17T00:10:34-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Theresa",
        "address1": "28703 Jardineras Drive",
        "phone": "(661) 753-7752",
        "city": "Valencia",
        "zip": "91354",
        "province": "California",
        "country": "United States",
        "last_name": "Howell",
        "address2": "Leave at front door",
        "company": "",
        "latitude": 34.4598228,
        "longitude": -118.5629591,
        "name": "Theresa Howell",
        "country_code": "US",
        "province_code": "CA"
      },
      "customer": {
        "id": 5484916441154,
        "email": "tlhowell23@gmail.com",
        "accepts_marketing": true,
        "created_at": "2022-03-16T23:52:56-05:00",
        "updated_at": "2022-03-16T23:57:30-05:00",
        "first_name": "Theresa",
        "last_name": "Howell",
        "orders_count": 1,
        "state": "disabled",
        "total_spent": "126.50",
        "last_order_id": 4274163744834,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#345038",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-03-16T23:52:57-05:00",
        "marketing_opt_in_level": "single_opt_in",
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5484916441154",
        "default_address": {
          "id": 6736386523202,
          "customer_id": 5484916441154,
          "first_name": "Theresa",
          "last_name": "Howell",
          "company": "",
          "address1": "28703 Jardineras Drive",
          "address2": "Leave at front door",
          "city": "Valencia",
          "province": "California",
          "country": "United States",
          "zip": "91354",
          "phone": "(661) 753-7752",
          "name": "Theresa Howell",
          "province_code": "CA",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [
        {
          "target_type": "line_item",
          "type": "discount_code",
          "value": "15.0",
          "value_type": "percentage",
          "allocation_method": "across",
          "target_selection": "entitled",
          "code": "KELSEY15"
        }
      ],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10896887808066,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896887808066",
          "destination_location": {
            "id": 3212210733122,
            "country_code": "US",
            "province_code": "CA",
            "name": "Theresa Howell",
            "address1": "28703 Jardineras Drive",
            "address2": "Leave at front door",
            "city": "Valencia",
            "zip": "91354"
          },
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 337,
          "name": "BAHAMA MAMA BUTTON DOWN TOP - S",
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
          "price": "44.00",
          "price_set": {
            "shop_money": {
              "amount": "44.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "44.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6696961671234,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ET0434T-LIME-KTN-S",
          "taxable": true,
          "title": "BAHAMA MAMA BUTTON DOWN TOP",
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
          "variant_id": 39661251625026,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": [
            {
              "amount": "6.60",
              "amount_set": {
                "shop_money": {
                  "amount": "6.60",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "6.60",
                  "currency_code": "USD"
                }
              },
              "discount_application_index": 0
            }
          ]
        },
        {
          "id": 10896887840834,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896887840834",
          "destination_location": {
            "id": 3212210733122,
            "country_code": "US",
            "province_code": "CA",
            "name": "Theresa Howell",
            "address1": "28703 Jardineras Drive",
            "address2": "Leave at front door",
            "city": "Valencia",
            "zip": "91354"
          },
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
          "discount_allocations": [
            {
              "amount": "7.20",
              "amount_set": {
                "shop_money": {
                  "amount": "7.20",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "7.20",
                  "currency_code": "USD"
                }
              },
              "discount_application_index": 0
            }
          ]
        },
        {
          "id": 10896887873602,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896887873602",
          "destination_location": {
            "id": 3212210733122,
            "country_code": "US",
            "province_code": "CA",
            "name": "Theresa Howell",
            "address1": "28703 Jardineras Drive",
            "address2": "Leave at front door",
            "city": "Valencia",
            "zip": "91354"
          },
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
          "discount_allocations": [
            {
              "amount": "7.20",
              "amount_set": {
                "shop_money": {
                  "amount": "7.20",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "7.20",
                  "currency_code": "USD"
                }
              },
              "discount_application_index": 0
            }
          ]
        }
      ],
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Theresa",
        "address1": "28703 Jardineras Drive",
        "phone": "(661) 753-7752",
        "city": "Valencia",
        "zip": "91354",
        "province": "California",
        "country": "United States",
        "last_name": "Howell",
        "address2": "Leave at front door",
        "company": "",
        "latitude": 34.4598228,
        "longitude": -118.5629591,
        "name": "Theresa Howell",
        "country_code": "US",
        "province_code": "CA"
      },
      "shipping_lines": [
        {
          "id": 3551271223362,
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
    },
    {
      "id": 4274154537026,
      "admin_graphql_api_id": "gid://shopify/Order/4274154537026",
      "app_id": 580111,
      "browser_ip": "174.22.220.253",
      "buyer_accepts_marketing": true,
      "cancel_reason": "customer",
      "cancelled_at": "2022-03-17T08:03:57-05:00",
      "cart_token": null,
      "checkout_id": 25980332245058,
      "checkout_token": "bd5fe2dc7c53edbe9a9ba84ebdce72ac",
      "client_details": {
        "accept_language": "es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3",
        "browser_height": 643,
        "browser_ip": "174.22.220.253",
        "browser_width": 1349,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0"
      },
      "closed_at": "2022-03-17T08:03:56-05:00",
      "confirmed": true,
      "contact_email": "Antonio5489@outlook.es",
      "created_at": "2022-03-16T23:53:21-05:00",
      "currency": "USD",
      "current_subtotal_price": "0.00",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
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
      "current_total_price": "0.00",
      "current_total_price_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
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
      "customer_locale": "en",
      "device_id": null,
      "discount_codes": [],
      "email": "Antonio5489@outlook.es",
      "estimated_taxes": false,
      "financial_status": "refunded",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/wallets/checkouts.json",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#345037",
      "note": null,
      "note_attributes": [],
      "number": 344037,
      "order_number": 345037,
      "order_status_url": "https://kittenish.com/29750488/orders/2f60442c737102aef3783f082be01554/authenticate?key=ffd8807b697f8de29da6345aa4c9babe",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": null,
      "presentment_currency": "USD",
      "processed_at": "2022-03-16T23:53:20-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "https://kittenish.com/collections/e-gift-card/products/kittenish-giftcard-2021?variant=39408731029570",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "100.00",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "100.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "100.00",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "2f60442c737102aef3783f082be01554",
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
      "total_line_items_price": "100.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "100.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "100.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "100.00",
      "total_price_set": {
        "shop_money": {
          "amount": "100.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "100.00",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "100.00",
      "total_shipping_price_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
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
      "total_weight": 0,
      "updated_at": "2022-03-17T08:03:57-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Antonios",
        "address1": "5439 E Calle Del Norte",
        "phone": "(601) 258-9968",
        "city": "Phoenix",
        "zip": "85018",
        "province": "Arizona",
        "country": "United States",
        "last_name": "Christofellis",
        "address2": "",
        "company": "",
        "latitude": 33.496805,
        "longitude": -111.9639399,
        "name": "Antonios Christofellis",
        "country_code": "US",
        "province_code": "AZ"
      },
      "customer": {
        "id": 5484916310082,
        "email": "antonio5489@outlook.es",
        "accepts_marketing": true,
        "created_at": "2022-03-16T23:52:38-05:00",
        "updated_at": "2022-03-17T08:03:58-05:00",
        "first_name": "Antonios",
        "last_name": "Christofellis",
        "orders_count": 1,
        "state": "enabled",
        "total_spent": "0.00",
        "last_order_id": 4274154537026,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#345037",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-03-16T23:52:38-05:00",
        "marketing_opt_in_level": "single_opt_in",
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5484916310082",
        "default_address": {
          "id": 6736386228290,
          "customer_id": 5484916310082,
          "first_name": "Antonios",
          "last_name": "Christofellis",
          "company": "",
          "address1": "5439 E Calle Del Norte",
          "address2": "",
          "city": "Phoenix",
          "province": "Arizona",
          "country": "United States",
          "zip": "85018",
          "phone": "(601) 258-9968",
          "name": "Antonios Christofellis",
          "province_code": "AZ",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10896876503106,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896876503106",
          "fulfillable_quantity": 0,
          "fulfillment_service": "gift_card",
          "fulfillment_status": null,
          "gift_card": true,
          "grams": 0,
          "name": "KITTENISH GIFTCARD - $100",
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
          "price": "100.00",
          "price_set": {
            "shop_money": {
              "amount": "100.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "100.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6606496137282,
          "properties": [],
          "quantity": 1,
          "requires_shipping": false,
          "sku": "EGIFTCARD-KTN-100",
          "taxable": false,
          "title": "KITTENISH GIFTCARD",
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
          "variant_id": 39408731029570,
          "variant_inventory_management": null,
          "variant_title": "$100",
          "vendor": "Kittenish",
          "tax_lines": [
            {
              "channel_liable": false,
              "price": "0.00",
              "price_set": {
                "shop_money": {
                  "amount": "0.00",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "0.00",
                  "currency_code": "USD"
                }
              },
              "rate": 0.056,
              "title": "AZ State Tax"
            },
            {
              "channel_liable": false,
              "price": "0.00",
              "price_set": {
                "shop_money": {
                  "amount": "0.00",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "0.00",
                  "currency_code": "USD"
                }
              },
              "rate": 0.007,
              "title": "Maricopa County Tax"
            },
            {
              "channel_liable": false,
              "price": "0.00",
              "price_set": {
                "shop_money": {
                  "amount": "0.00",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "0.00",
                  "currency_code": "USD"
                }
              },
              "rate": 0.018,
              "title": "Tempe Municipal Tax"
            }
          ],
          "duties": [],
          "discount_allocations": []
        }
      ],
      "payment_details": {
        "credit_card_bin": "440066",
        "avs_result_code": "Y",
        "cvv_result_code": "M",
        "credit_card_number": "•••• •••• •••• 0482",
        "credit_card_company": "Visa"
      },
      "payment_terms": null,
      "refunds": [
        {
          "id": 831730548802,
          "admin_graphql_api_id": "gid://shopify/Refund/831730548802",
          "created_at": "2022-03-17T08:03:55-05:00",
          "note": null,
          "order_id": 4274154537026,
          "processed_at": "2022-03-17T08:03:55-05:00",
          "restock": true,
          "total_duties_set": {
            "shop_money": {
              "amount": "0.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "0.00",
              "currency_code": "USD"
            }
          },
          "user_id": 40724037698,
          "order_adjustments": [],
          "transactions": [
            {
              "id": 5296388079682,
              "admin_graphql_api_id": "gid://shopify/OrderTransaction/5296388079682",
              "amount": "100.00",
              "authorization": "re_3KeBKsDgloxQhGZf3xd3yHnz",
              "created_at": "2022-03-17T08:03:53-05:00",
              "currency": "USD",
              "device_id": null,
              "error_code": null,
              "gateway": "shopify_payments",
              "kind": "refund",
              "location_id": null,
              "message": "Transaction approved",
              "order_id": 4274154537026,
              "parent_id": 5295156723778,
              "payments_refund_attributes": {
                "status": "success",
                "acquirer_reference_number": null
              },
              "processed_at": "2022-03-17T08:03:53-05:00",
              "receipt": {
                "id": "re_3KeBKsDgloxQhGZf3xd3yHnz",
                "amount": 10000,
                "balance_transaction": {
                  "id": "txn_3KeBKsDgloxQhGZf32Pkiv3F",
                  "object": "balance_transaction",
                  "exchange_rate": null
                },
                "charge": {
                  "id": "ch_3KeBKsDgloxQhGZf3wRrGBrZ",
                  "object": "charge",
                  "amount": 10000,
                  "application_fee": "fee_1KeBKtDgloxQhGZfQEAJ65M3",
                  "balance_transaction": "txn_3KeBKsDgloxQhGZf3AyYDoPR",
                  "captured": true,
                  "created": 1647492799,
                  "currency": "usd",
                  "failure_code": null,
                  "failure_message": null,
                  "fraud_details": {},
                  "livemode": true,
                  "metadata": {
                    "shop_id": "29750488",
                    "shop_name": "Kittenish",
                    "transaction_fee_total_amount": "245",
                    "transaction_fee_tax_amount": "0",
                    "payments_charge_id": "2034892865602",
                    "order_transaction_id": "5295156723778",
                    "manual_entry": "false",
                    "order_id": "c25980332245058.1",
                    "email": "Antonio5489@outlook.es"
                  },
                  "outcome": {
                    "network_status": "approved_by_network",
                    "reason": null,
                    "risk_level": "normal",
                    "seller_message": "Payment complete.",
                    "type": "authorized"
                  },
                  "paid": true,
                  "payment_intent": "pi_3KeBKsDgloxQhGZf3s0dDaac",
                  "payment_method": "pm_1KeBKsDgloxQhGZf4thhro8G",
                  "payment_method_details": {
                    "card": {
                      "amount_authorized": 10000,
                      "brand": "visa",
                      "checks": {
                        "address_line1_check": "pass",
                        "address_postal_code_check": "pass",
                        "cvc_check": "pass"
                      },
                      "country": "US",
                      "description": "Visa Traditional",
                      "ds_transaction_id": null,
                      "exp_month": 6,
                      "exp_year": 2024,
                      "fingerprint": "olqpYUVgOg6hvyGH",
                      "funding": "credit",
                      "iin": "440066",
                      "installments": null,
                      "issuer": "Bank of America - Consumer Credit",
                      "last4": "0482",
                      "mandate": null,
                      "moto": null,
                      "network": "visa",
                      "network_token": null,
                      "network_transaction_id": "302076175992435",
                      "three_d_secure": null,
                      "wallet": null
                    },
                    "type": "card"
                  },
                  "refunded": true,
                  "source": null,
                  "status": "succeeded",
                  "mit_params": {
                    "network_transaction_id": "302076175992435"
                  }
                },
                "object": "refund",
                "reason": null,
                "status": "succeeded",
                "created": 1647522234,
                "currency": "usd",
                "metadata": {
                  "order_transaction_id": "5296388079682",
                  "payments_refund_id": "84698923074"
                },
                "payment_method_details": {
                  "card": {
                    "acquirer_reference_number": null,
                    "acquirer_reference_number_status": "pending"
                  },
                  "type": "card"
                },
                "mit_params": {}
              },
              "source_name": "1830279",
              "status": "success",
              "test": false,
              "user_id": null,
              "payment_details": {
                "credit_card_bin": "440066",
                "avs_result_code": "Y",
                "cvv_result_code": "M",
                "credit_card_number": "•••• •••• •••• 0482",
                "credit_card_company": "Visa"
              }
            }
          ],
          "refund_line_items": [
            {
              "id": 329497935938,
              "line_item_id": 10896876503106,
              "location_id": 87588878,
              "quantity": 1,
              "restock_type": "cancel",
              "subtotal": 100,
              "subtotal_set": {
                "shop_money": {
                  "amount": "100.00",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "100.00",
                  "currency_code": "USD"
                }
              },
              "total_tax": 0,
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
              "line_item": {
                "id": 10896876503106,
                "admin_graphql_api_id": "gid://shopify/LineItem/10896876503106",
                "fulfillable_quantity": 0,
                "fulfillment_service": "gift_card",
                "fulfillment_status": null,
                "gift_card": true,
                "grams": 0,
                "name": "KITTENISH GIFTCARD - $100",
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
                "price": "100.00",
                "price_set": {
                  "shop_money": {
                    "amount": "100.00",
                    "currency_code": "USD"
                  },
                  "presentment_money": {
                    "amount": "100.00",
                    "currency_code": "USD"
                  }
                },
                "product_exists": true,
                "product_id": 6606496137282,
                "properties": [],
                "quantity": 1,
                "requires_shipping": false,
                "sku": "EGIFTCARD-KTN-100",
                "taxable": false,
                "title": "KITTENISH GIFTCARD",
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
                "variant_id": 39408731029570,
                "variant_inventory_management": null,
                "variant_title": "$100",
                "vendor": "Kittenish",
                "tax_lines": [
                  {
                    "channel_liable": false,
                    "price": "0.00",
                    "price_set": {
                      "shop_money": {
                        "amount": "0.00",
                        "currency_code": "USD"
                      },
                      "presentment_money": {
                        "amount": "0.00",
                        "currency_code": "USD"
                      }
                    },
                    "rate": 0.056,
                    "title": "AZ State Tax"
                  },
                  {
                    "channel_liable": false,
                    "price": "0.00",
                    "price_set": {
                      "shop_money": {
                        "amount": "0.00",
                        "currency_code": "USD"
                      },
                      "presentment_money": {
                        "amount": "0.00",
                        "currency_code": "USD"
                      }
                    },
                    "rate": 0.007,
                    "title": "Maricopa County Tax"
                  },
                  {
                    "channel_liable": false,
                    "price": "0.00",
                    "price_set": {
                      "shop_money": {
                        "amount": "0.00",
                        "currency_code": "USD"
                      },
                      "presentment_money": {
                        "amount": "0.00",
                        "currency_code": "USD"
                      }
                    },
                    "rate": 0.018,
                    "title": "Tempe Municipal Tax"
                  }
                ],
                "duties": [],
                "discount_allocations": []
              }
            }
          ],
          "duties": []
        }
      ],
      "shipping_lines": []
    },
    {
      "id": 4274060558402,
      "admin_graphql_api_id": "gid://shopify/Order/4274060558402",
      "app_id": 580111,
      "browser_ip": "75.82.150.92",
      "buyer_accepts_marketing": false,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "b448029f48188db2f8935f3916e0de45",
      "checkout_id": 25979667677250,
      "checkout_token": "d09e928b9507afafbd2cfd214702bd43",
      "client_details": {
        "accept_language": "en-US,en;q=0.9",
        "browser_height": null,
        "browser_ip": "75.82.150.92",
        "browser_width": null,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "eunice.chun@me.com",
      "created_at": "2022-03-16T23:14:56-05:00",
      "currency": "USD",
      "current_subtotal_price": "71.40",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "71.40",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "71.40",
          "currency_code": "USD"
        }
      },
      "current_total_discounts": "12.60",
      "current_total_discounts_set": {
        "shop_money": {
          "amount": "12.60",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "12.60",
          "currency_code": "USD"
        }
      },
      "current_total_duties_set": null,
      "current_total_price": "78.90",
      "current_total_price_set": {
        "shop_money": {
          "amount": "78.90",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "78.90",
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
      "discount_codes": [
        {
          "code": "KELSEY15",
          "amount": "12.60",
          "type": "percentage"
        }
      ],
      "email": "eunice.chun@me.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#345036",
      "note": null,
      "note_attributes": [],
      "number": 344036,
      "order_number": 345036,
      "order_status_url": "https://kittenish.com/29750488/orders/19d1d32e94ae8bbf58cf40ee80fa7579/authenticate?key=52752bf13a871c82bff9cbb60276597b",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": "+14108685743",
      "presentment_currency": "USD",
      "processed_at": "2022-03-16T23:14:54-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "71.40",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "71.40",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "71.40",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "19d1d32e94ae8bbf58cf40ee80fa7579",
      "total_discounts": "12.60",
      "total_discounts_set": {
        "shop_money": {
          "amount": "12.60",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "12.60",
          "currency_code": "USD"
        }
      },
      "total_line_items_price": "84.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "84.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "84.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "78.90",
      "total_price_set": {
        "shop_money": {
          "amount": "78.90",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "78.90",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "78.90",
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
      "total_weight": 663,
      "updated_at": "2022-03-16T23:15:05-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Eunice",
        "address1": "11930 Gorham Ave",
        "phone": "+14108685743",
        "city": "Los Angeles",
        "zip": "90049",
        "province": "California",
        "country": "United States",
        "last_name": "Chun",
        "address2": "Apt 101",
        "company": "",
        "latitude": 34.0505245,
        "longitude": -118.4696062,
        "name": "Eunice Chun",
        "country_code": "US",
        "province_code": "CA"
      },
      "customer": {
        "id": 5437777150018,
        "email": "eunice.chun@me.com",
        "accepts_marketing": false,
        "created_at": "2022-01-29T16:14:10-06:00",
        "updated_at": "2022-03-16T23:14:57-05:00",
        "first_name": "Eunice",
        "last_name": "Chun",
        "orders_count": 2,
        "state": "disabled",
        "total_spent": "162.90",
        "last_order_id": 4274060558402,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#345036",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-01-29T16:14:10-06:00",
        "marketing_opt_in_level": null,
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5437777150018",
        "default_address": {
          "id": 6669554483266,
          "customer_id": 5437777150018,
          "first_name": "Eunice",
          "last_name": "Chun",
          "company": "",
          "address1": "11930 Gorham Ave",
          "address2": "Apt 101",
          "city": "Los Angeles",
          "province": "California",
          "country": "United States",
          "zip": "90049",
          "phone": "+14108685743",
          "name": "Eunice Chun",
          "province_code": "CA",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [
        {
          "target_type": "line_item",
          "type": "discount_code",
          "value": "15.0",
          "value_type": "percentage",
          "allocation_method": "across",
          "target_selection": "entitled",
          "code": "KELSEY15"
        }
      ],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10896751001666,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896751001666",
          "destination_location": {
            "id": 3166494523458,
            "country_code": "US",
            "province_code": "CA",
            "name": "Eunice Chun",
            "address1": "11930 Gorham Ave",
            "address2": "Apt 101",
            "city": "Los Angeles",
            "zip": "90049"
          },
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 326,
          "name": "BAHAMA MAMA DRAWSTRING PANT - S",
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
          "product_id": 6696962031682,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "EB0434B-LIME-KTN-S",
          "taxable": true,
          "title": "BAHAMA MAMA DRAWSTRING PANT",
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
          "variant_id": 39661252083778,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": [
            {
              "amount": "6.00",
              "amount_set": {
                "shop_money": {
                  "amount": "6.00",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "6.00",
                  "currency_code": "USD"
                }
              },
              "discount_application_index": 0
            }
          ]
        },
        {
          "id": 10896751034434,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896751034434",
          "destination_location": {
            "id": 3166494523458,
            "country_code": "US",
            "province_code": "CA",
            "name": "Eunice Chun",
            "address1": "11930 Gorham Ave",
            "address2": "Apt 101",
            "city": "Los Angeles",
            "zip": "90049"
          },
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 337,
          "name": "BAHAMA MAMA BUTTON DOWN TOP - S",
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
          "price": "44.00",
          "price_set": {
            "shop_money": {
              "amount": "44.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "44.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6696961671234,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ET0434T-LIME-KTN-S",
          "taxable": true,
          "title": "BAHAMA MAMA BUTTON DOWN TOP",
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
          "variant_id": 39661251625026,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": [
            {
              "amount": "6.60",
              "amount_set": {
                "shop_money": {
                  "amount": "6.60",
                  "currency_code": "USD"
                },
                "presentment_money": {
                  "amount": "6.60",
                  "currency_code": "USD"
                }
              },
              "discount_application_index": 0
            }
          ]
        }
      ],
      "payment_details": {
        "credit_card_bin": "552433",
        "avs_result_code": "Y",
        "cvv_result_code": null,
        "credit_card_number": "•••• •••• •••• 1627",
        "credit_card_company": "Mastercard"
      },
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Eunice",
        "address1": "11930 Gorham Ave",
        "phone": "+14108685743",
        "city": "Los Angeles",
        "zip": "90049",
        "province": "California",
        "country": "United States",
        "last_name": "Chun",
        "address2": "Apt 101",
        "company": "",
        "latitude": 34.0505245,
        "longitude": -118.4696062,
        "name": "Eunice Chun",
        "country_code": "US",
        "province_code": "CA"
      },
      "shipping_lines": [
        {
          "id": 3551173345346,
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
    },
    {
      "id": 4274045091906,
      "admin_graphql_api_id": "gid://shopify/Order/4274045091906",
      "app_id": 580111,
      "browser_ip": "174.249.177.185",
      "buyer_accepts_marketing": false,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "2d93d104cca09cd70df9c0ef4d4a508c",
      "checkout_id": 25979724365890,
      "checkout_token": "e97b06eb436eae7d6d92a4b069b072ee",
      "client_details": {
        "accept_language": "en-US,en;q=0.9",
        "browser_height": 745,
        "browser_ip": "174.249.177.185",
        "browser_width": 428,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "bailey.faith15@gmail.com",
      "created_at": "2022-03-16T23:03:56-05:00",
      "currency": "USD",
      "current_subtotal_price": "156.00",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "156.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "156.00",
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
      "current_total_price": "156.00",
      "current_total_price_set": {
        "shop_money": {
          "amount": "156.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "156.00",
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
      "email": "bailey.faith15@gmail.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/?gclid=CjwKCAjwlcaRBhBYEiwAK341jYmwaytyieChabpAcs37RcaSNoZpdi9vdQygZHCQXSuo6v_ZPZph_BoCQ3QQAvD_BwE",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#345035",
      "note": null,
      "note_attributes": [],
      "number": 344035,
      "order_number": 345035,
      "order_status_url": "https://kittenish.com/29750488/orders/8a643cf5c773c0077e140130d4146dd2/authenticate?key=806a547a683ba9453d764de937dc8f84",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": null,
      "presentment_currency": "USD",
      "processed_at": "2022-03-16T23:03:54-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "https://www.google.com/",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "156.00",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "156.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "156.00",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "8a643cf5c773c0077e140130d4146dd2",
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
      "total_line_items_price": "156.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "156.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "156.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "156.00",
      "total_price_set": {
        "shop_money": {
          "amount": "156.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "156.00",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "156.00",
      "total_shipping_price_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
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
      "total_weight": 547,
      "updated_at": "2022-03-16T23:04:00-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Bailey",
        "address1": "3411 Durden Drive Ne",
        "phone": "(470) 277-3277",
        "city": "Atlanta",
        "zip": "30319",
        "province": "Georgia",
        "country": "United States",
        "last_name": "Chase",
        "address2": "6102",
        "company": "",
        "latitude": 33.8919886,
        "longitude": -84.32305679999999,
        "name": "Bailey Chase",
        "country_code": "US",
        "province_code": "GA"
      },
      "customer": {
        "id": 5484890325058,
        "email": "bailey.faith15@gmail.com",
        "accepts_marketing": false,
        "created_at": "2022-03-16T23:01:02-05:00",
        "updated_at": "2022-03-16T23:03:58-05:00",
        "first_name": "Bailey",
        "last_name": "Chase",
        "orders_count": 1,
        "state": "disabled",
        "total_spent": "156.00",
        "last_order_id": 4274045091906,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#345035",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-03-16T23:01:02-05:00",
        "marketing_opt_in_level": null,
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5484890325058",
        "default_address": {
          "id": 6736347824194,
          "customer_id": 5484890325058,
          "first_name": "Bailey",
          "last_name": "Chase",
          "company": "",
          "address1": "3411 Durden Drive Ne",
          "address2": "6102",
          "city": "Atlanta",
          "province": "Georgia",
          "country": "United States",
          "zip": "30319",
          "phone": "(470) 277-3277",
          "name": "Bailey Chase",
          "province_code": "GA",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10896734257218,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896734257218",
          "destination_location": {
            "id": 3212185632834,
            "country_code": "US",
            "province_code": "GA",
            "name": "Bailey Chase",
            "address1": "3411 Durden Drive Ne",
            "address2": "6102",
            "city": "Atlanta",
            "zip": "30319"
          },
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 170,
          "name": "MIAMI VICE TERRYCLOTH SHORTS - L",
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
          "price": "38.00",
          "price_set": {
            "shop_money": {
              "amount": "38.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "38.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6696962850882,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "CP4219K-GRN-KTN-L",
          "taxable": true,
          "title": "MIAMI VICE TERRYCLOTH SHORTS",
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
          "variant_id": 39661253886018,
          "variant_inventory_management": "shopify",
          "variant_title": "L",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        },
        {
          "id": 10896734289986,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896734289986",
          "destination_location": {
            "id": 3212185632834,
            "country_code": "US",
            "province_code": "GA",
            "name": "Bailey Chase",
            "address1": "3411 Durden Drive Ne",
            "address2": "6102",
            "city": "Atlanta",
            "zip": "30319"
          },
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 238,
          "name": "MIAMI VICE TERRYCLOTH BUTTON UP TOP - L",
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
          "price": "44.00",
          "price_set": {
            "shop_money": {
              "amount": "44.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "44.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6696962588738,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "CT4218K-GRN-KTN-L",
          "taxable": true,
          "title": "MIAMI VICE TERRYCLOTH BUTTON UP TOP",
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
          "variant_id": 39661253001282,
          "variant_inventory_management": "shopify",
          "variant_title": "L",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        },
        {
          "id": 10896734322754,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896734322754",
          "destination_location": {
            "id": 3212185632834,
            "country_code": "US",
            "province_code": "GA",
            "name": "Bailey Chase",
            "address1": "3411 Durden Drive Ne",
            "address2": "6102",
            "city": "Atlanta",
            "zip": "30319"
          },
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 68,
          "name": "HONOLULU GREEN BIKINI BOTTOMS - L",
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
          "price": "36.00",
          "price_set": {
            "shop_money": {
              "amount": "36.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "36.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6694746226754,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ESW0159B-GRN-KTN-L",
          "taxable": true,
          "title": "HONOLULU GREEN BIKINI BOTTOMS",
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
          "variant_id": 39656870805570,
          "variant_inventory_management": "shopify",
          "variant_title": "L",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        },
        {
          "id": 10896734355522,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896734355522",
          "destination_location": {
            "id": 3212185632834,
            "country_code": "US",
            "province_code": "GA",
            "name": "Bailey Chase",
            "address1": "3411 Durden Drive Ne",
            "address2": "6102",
            "city": "Atlanta",
            "zip": "30319"
          },
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 71,
          "name": "HONOLULU GREEN KEYHOLE BIKINI TOP - L",
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
          "price": "38.00",
          "price_set": {
            "shop_money": {
              "amount": "38.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "38.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6694744490050,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ESW0159-GRN-KTN-L",
          "taxable": true,
          "title": "HONOLULU GREEN KEYHOLE BIKINI TOP",
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
          "variant_id": 39656863563842,
          "variant_inventory_management": "shopify",
          "variant_title": "L",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        }
      ],
      "payment_details": {
        "credit_card_bin": "473702",
        "avs_result_code": "Y",
        "cvv_result_code": null,
        "credit_card_number": "•••• •••• •••• 6846",
        "credit_card_company": "Visa"
      },
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Bailey",
        "address1": "3411 Durden Drive Ne",
        "phone": "(470) 277-3277",
        "city": "Atlanta",
        "zip": "30319",
        "province": "Georgia",
        "country": "United States",
        "last_name": "Chase",
        "address2": "6102",
        "company": "",
        "latitude": 33.8919886,
        "longitude": -84.32305679999999,
        "name": "Bailey Chase",
        "country_code": "US",
        "province_code": "GA"
      },
      "shipping_lines": [
        {
          "id": 3551166201922,
          "carrier_identifier": null,
          "code": "$150 Free Shipping",
          "delivery_category": null,
          "discounted_price": "0.00",
          "discounted_price_set": {
            "shop_money": {
              "amount": "0.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "0.00",
              "currency_code": "USD"
            }
          },
          "phone": null,
          "price": "0.00",
          "price_set": {
            "shop_money": {
              "amount": "0.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "0.00",
              "currency_code": "USD"
            }
          },
          "requested_fulfillment_service_id": null,
          "source": "shopify",
          "title": "$150 Free Shipping",
          "tax_lines": [],
          "discount_allocations": []
        }
      ]
    },
    {
      "id": 4274028511298,
      "admin_graphql_api_id": "gid://shopify/Order/4274028511298",
      "app_id": 580111,
      "browser_ip": "209.252.172.226",
      "buyer_accepts_marketing": false,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "3b00107d70db1aa916b37109f37547c1",
      "checkout_id": 25978710327362,
      "checkout_token": "87a97633d50a26e9ce0a028a3a964950",
      "client_details": {
        "accept_language": "en-US,en;q=0.9",
        "browser_height": null,
        "browser_ip": "209.252.172.226",
        "browser_width": null,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Mobile/15E148 Safari/604.1"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "jjnaeve@gmail.com",
      "created_at": "2022-03-16T22:40:16-05:00",
      "currency": "USD",
      "current_subtotal_price": "38.00",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "38.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "38.00",
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
      "current_total_price": "45.50",
      "current_total_price_set": {
        "shop_money": {
          "amount": "45.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "45.50",
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
      "email": "jjnaeve@gmail.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#345034",
      "note": null,
      "note_attributes": [],
      "number": 344034,
      "order_number": 345034,
      "order_status_url": "https://kittenish.com/29750488/orders/a6a1b61cc28c4a3a90e85566f12923c4/authenticate?key=4d37f9bf87967a7c384c659b647d881f",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": null,
      "presentment_currency": "USD",
      "processed_at": "2022-03-16T22:40:15-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "https://www.google.com/",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "38.00",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "38.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "38.00",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "a6a1b61cc28c4a3a90e85566f12923c4",
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
      "total_line_items_price": "38.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "38.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "38.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "45.50",
      "total_price_set": {
        "shop_money": {
          "amount": "45.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "45.50",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "45.50",
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
      "total_weight": 479,
      "updated_at": "2022-03-16T22:40:20-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Jacqueline",
        "address1": "169 Lenora Dr NW",
        "phone": "+13196547564",
        "city": "Cedar Rapids",
        "zip": "52405",
        "province": "Iowa",
        "country": "United States",
        "last_name": "Naeve",
        "address2": "",
        "company": "",
        "latitude": 41.9724755,
        "longitude": -91.7298924,
        "name": "Jacqueline Naeve",
        "country_code": "US",
        "province_code": "IA"
      },
      "customer": {
        "id": 5088392609858,
        "email": "jjnaeve@gmail.com",
        "accepts_marketing": false,
        "created_at": "2021-04-15T12:03:24-05:00",
        "updated_at": "2022-03-16T22:40:17-05:00",
        "first_name": "Jacqueline",
        "last_name": "Naeve",
        "orders_count": 1,
        "state": "disabled",
        "total_spent": "45.50",
        "last_order_id": 4274028511298,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#345034",
        "currency": "USD",
        "accepts_marketing_updated_at": "2021-04-15T12:03:24-05:00",
        "marketing_opt_in_level": null,
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5088392609858",
        "default_address": {
          "id": 6261019770946,
          "customer_id": 5088392609858,
          "first_name": "Jacqueline",
          "last_name": "Naeve",
          "company": "",
          "address1": "169 Lenora Dr NW",
          "address2": "",
          "city": "Cedar Rapids",
          "province": "Iowa",
          "country": "United States",
          "zip": "52405",
          "phone": "+13196547564",
          "name": "Jacqueline Naeve",
          "province_code": "IA",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10896699129922,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896699129922",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 479,
          "name": "BRONX BLACK BUCKLE STRAIGHT DENIM JEANS - 26",
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
          "price": "38.00",
          "price_set": {
            "shop_money": {
              "amount": "38.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "38.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6587550728258,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "CP4066K-BLK-26",
          "taxable": true,
          "title": "BRONX BLACK BUCKLE STRAIGHT DENIM JEANS",
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
          "variant_id": 39361651245122,
          "variant_inventory_management": "shopify",
          "variant_title": "26",
          "vendor": "Fall 2021",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        }
      ],
      "payment_details": {
        "credit_card_bin": "415711",
        "avs_result_code": "Y",
        "cvv_result_code": null,
        "credit_card_number": "•••• •••• •••• 4622",
        "credit_card_company": "Visa"
      },
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Jacqueline",
        "address1": "169 Lenora Dr NW",
        "phone": "+13196547564",
        "city": "Cedar Rapids",
        "zip": "52405",
        "province": "Iowa",
        "country": "United States",
        "last_name": "Naeve",
        "address2": "",
        "company": "",
        "latitude": 41.9724755,
        "longitude": -91.7298924,
        "name": "Jacqueline Naeve",
        "country_code": "US",
        "province_code": "IA"
      },
      "shipping_lines": [
        {
          "id": 3551152963650,
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
    },
    {
      "id": 4274022973506,
      "admin_graphql_api_id": "gid://shopify/Order/4274022973506",
      "app_id": 580111,
      "browser_ip": "98.157.253.7",
      "buyer_accepts_marketing": false,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "b6756ff908e7d3232b01b7a8730278e6",
      "checkout_id": 25979356512322,
      "checkout_token": "fb0e5d8a14f715a6d4359fa41873490c",
      "client_details": {
        "accept_language": "en-us",
        "browser_height": 715,
        "browser_ip": "98.157.253.7",
        "browser_width": 414,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_8_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "brigitteberdini@gmail.com",
      "created_at": "2022-03-16T22:32:09-05:00",
      "currency": "USD",
      "current_subtotal_price": "152.00",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "152.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "152.00",
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
      "current_total_price": "152.00",
      "current_total_price_set": {
        "shop_money": {
          "amount": "152.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "152.00",
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
      "email": "brigitteberdini@gmail.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#345033",
      "note": null,
      "note_attributes": [],
      "number": 344033,
      "order_number": 345033,
      "order_status_url": "https://kittenish.com/29750488/orders/be87fac72d7f9e4f6d93b4e82d696a42/authenticate?key=dc4c6bb4139f6ecb743e3e79542e2116",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": null,
      "presentment_currency": "USD",
      "processed_at": "2022-03-16T22:32:08-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "152.00",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "152.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "152.00",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "be87fac72d7f9e4f6d93b4e82d696a42",
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
      "total_line_items_price": "152.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "152.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "152.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "152.00",
      "total_price_set": {
        "shop_money": {
          "amount": "152.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "152.00",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "152.00",
      "total_shipping_price_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
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
      "total_weight": 1009,
      "updated_at": "2022-03-16T22:32:12-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Brigitte",
        "address1": "40 Creekview Cir ",
        "phone": "(440) 785-5052",
        "city": "Moreland Hills ",
        "zip": "44022",
        "province": "Ohio",
        "country": "United States",
        "last_name": "Fuller",
        "address2": "",
        "company": "",
        "latitude": 41.4586329,
        "longitude": -81.44296279999999,
        "name": "Brigitte Fuller",
        "country_code": "US",
        "province_code": "OH"
      },
      "customer": {
        "id": 5484872237122,
        "email": "brigitteberdini@gmail.com",
        "accepts_marketing": false,
        "created_at": "2022-03-16T22:30:55-05:00",
        "updated_at": "2022-03-16T22:32:10-05:00",
        "first_name": "Brigitte",
        "last_name": "Fuller",
        "orders_count": 1,
        "state": "disabled",
        "total_spent": "152.00",
        "last_order_id": 4274022973506,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#345033",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-03-16T22:30:56-05:00",
        "marketing_opt_in_level": null,
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5484872237122",
        "default_address": {
          "id": 6736323608642,
          "customer_id": 5484872237122,
          "first_name": "Brigitte",
          "last_name": "Fuller",
          "company": "",
          "address1": "40 Creekview Cir ",
          "address2": "",
          "city": "Moreland Hills",
          "province": "Ohio",
          "country": "United States",
          "zip": "44022",
          "phone": "(440) 785-5052",
          "name": "Brigitte Fuller",
          "province_code": "OH",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10896687824962,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896687824962",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 337,
          "name": "BAHAMA MAMA BUTTON DOWN TOP - S",
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
          "price": "44.00",
          "price_set": {
            "shop_money": {
              "amount": "44.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "44.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6696961671234,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ET0434T-LIME-KTN-S",
          "taxable": true,
          "title": "BAHAMA MAMA BUTTON DOWN TOP",
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
          "variant_id": 39661251625026,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        },
        {
          "id": 10896687857730,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896687857730",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 326,
          "name": "BAHAMA MAMA DRAWSTRING PANT - S",
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
          "product_id": 6696962031682,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "EB0434B-LIME-KTN-S",
          "taxable": true,
          "title": "BAHAMA MAMA DRAWSTRING PANT",
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
          "variant_id": 39661252083778,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        },
        {
          "id": 10896687890498,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896687890498",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 235,
          "name": "SARASOTA BLACK COVERUP PANTS - S",
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
          "price": "32.00",
          "price_set": {
            "shop_money": {
              "amount": "32.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "32.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6696957247554,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "EB0339-BLK-KTN-S",
          "taxable": true,
          "title": "SARASOTA BLACK COVERUP PANTS",
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
          "variant_id": 39661234815042,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        },
        {
          "id": 10896687923266,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896687923266",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 111,
          "name": "SARASOTA BLACK COVERUP TOP - XS",
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
          "price": "36.00",
          "price_set": {
            "shop_money": {
              "amount": "36.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "36.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6696956919874,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ET0339-BLK-KTN-XS",
          "taxable": true,
          "title": "SARASOTA BLACK COVERUP TOP",
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
          "variant_id": 39661234323522,
          "variant_inventory_management": "shopify",
          "variant_title": "XS",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        }
      ],
      "payment_details": {
        "credit_card_bin": "414709",
        "avs_result_code": "Y",
        "cvv_result_code": "M",
        "credit_card_number": "•••• •••• •••• 2997",
        "credit_card_company": "Visa"
      },
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Brigitte",
        "address1": "40 Creekview Cir ",
        "phone": "(440) 785-5052",
        "city": "Moreland Hills ",
        "zip": "44022",
        "province": "Ohio",
        "country": "United States",
        "last_name": "Fuller",
        "address2": "",
        "company": "",
        "latitude": 41.4586329,
        "longitude": -81.44296279999999,
        "name": "Brigitte Fuller",
        "country_code": "US",
        "province_code": "OH"
      },
      "shipping_lines": [
        {
          "id": 3551148441666,
          "carrier_identifier": null,
          "code": "$150 Free Shipping",
          "delivery_category": null,
          "discounted_price": "0.00",
          "discounted_price_set": {
            "shop_money": {
              "amount": "0.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "0.00",
              "currency_code": "USD"
            }
          },
          "phone": null,
          "price": "0.00",
          "price_set": {
            "shop_money": {
              "amount": "0.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "0.00",
              "currency_code": "USD"
            }
          },
          "requested_fulfillment_service_id": null,
          "source": "shopify",
          "title": "$150 Free Shipping",
          "tax_lines": [],
          "discount_allocations": []
        }
      ]
    },
    {
      "id": 4274012618818,
      "admin_graphql_api_id": "gid://shopify/Order/4274012618818",
      "app_id": 580111,
      "browser_ip": "174.83.206.180",
      "buyer_accepts_marketing": true,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "254a2a7420c9f789854e0eefb50a7ca1",
      "checkout_id": 25979095449666,
      "checkout_token": "c680b0961f3a233623d8da461d322362",
      "client_details": {
        "accept_language": "en-US,en;q=0.9",
        "browser_height": 788,
        "browser_ip": "174.83.206.180",
        "browser_width": 1410,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "kiyalanfair@gmail.com",
      "created_at": "2022-03-16T22:18:28-05:00",
      "currency": "USD",
      "current_subtotal_price": "84.00",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "84.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "84.00",
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
      "current_total_price": "91.50",
      "current_total_price_set": {
        "shop_money": {
          "amount": "91.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "91.50",
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
      "email": "kiyalanfair@gmail.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#345032",
      "note": null,
      "note_attributes": [],
      "number": 344032,
      "order_number": 345032,
      "order_status_url": "https://kittenish.com/29750488/orders/171fc2509943096f468b79b288b0323b/authenticate?key=cc43cf05d789b14517a42208cc4f5d1c",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": null,
      "presentment_currency": "USD",
      "processed_at": "2022-03-16T22:18:27-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "https://www.google.com/",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "84.00",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "84.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "84.00",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "171fc2509943096f468b79b288b0323b",
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
      "total_line_items_price": "84.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "84.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "84.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "91.50",
      "total_price_set": {
        "shop_money": {
          "amount": "91.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "91.50",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "91.50",
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
      "total_weight": 793,
      "updated_at": "2022-03-16T22:18:34-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Kiya",
        "address1": "15020 Humite Ln",
        "phone": "7753135135",
        "city": "Reno",
        "zip": "89506",
        "province": "Nevada",
        "country": "United States",
        "last_name": "Lanfair",
        "address2": "",
        "company": "",
        "latitude": 39.6426318,
        "longitude": -119.878153,
        "name": "Kiya Lanfair",
        "country_code": "US",
        "province_code": "NV"
      },
      "customer": {
        "id": 5484863619138,
        "email": "kiyalanfair@gmail.com",
        "accepts_marketing": true,
        "created_at": "2022-03-16T22:17:29-05:00",
        "updated_at": "2022-03-16T22:18:29-05:00",
        "first_name": "Kiya",
        "last_name": "Lanfair",
        "orders_count": 1,
        "state": "disabled",
        "total_spent": "91.50",
        "last_order_id": 4274012618818,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#345032",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-03-16T22:17:29-05:00",
        "marketing_opt_in_level": "single_opt_in",
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5484863619138",
        "default_address": {
          "id": 6736312270914,
          "customer_id": 5484863619138,
          "first_name": "Kiya",
          "last_name": "Lanfair",
          "company": "",
          "address1": "15020 Humite Ln",
          "address2": "",
          "city": "Reno",
          "province": "Nevada",
          "country": "United States",
          "zip": "89506",
          "phone": "7753135135",
          "name": "Kiya Lanfair",
          "province_code": "NV",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10896666034242,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896666034242",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 431,
          "name": "BAHAMA MAMA DRAWSTRING PANT - XXL",
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
          "product_id": 6696962031682,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "EB0434B-LIME-KTN-XXL",
          "taxable": true,
          "title": "BAHAMA MAMA DRAWSTRING PANT",
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
          "variant_id": 39661252214850,
          "variant_inventory_management": "shopify",
          "variant_title": "XXL",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        },
        {
          "id": 10896666067010,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896666067010",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 363,
          "name": "BAHAMA MAMA BUTTON DOWN TOP - L",
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
          "price": "44.00",
          "price_set": {
            "shop_money": {
              "amount": "44.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "44.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6696961671234,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ET0434T-LIME-KTN-L",
          "taxable": true,
          "title": "BAHAMA MAMA BUTTON DOWN TOP",
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
          "variant_id": 39661251690562,
          "variant_inventory_management": "shopify",
          "variant_title": "L",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        }
      ],
      "payment_details": {
        "credit_card_bin": "436618",
        "avs_result_code": "Y",
        "cvv_result_code": "M",
        "credit_card_number": "•••• •••• •••• 1309",
        "credit_card_company": "Visa"
      },
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Kiya",
        "address1": "15020 Humite Ln",
        "phone": "7753135135",
        "city": "Reno",
        "zip": "89506",
        "province": "Nevada",
        "country": "United States",
        "last_name": "Lanfair",
        "address2": "",
        "company": "",
        "latitude": 39.6426318,
        "longitude": -119.878153,
        "name": "Kiya Lanfair",
        "country_code": "US",
        "province_code": "NV"
      },
      "shipping_lines": [
        {
          "id": 3551140020290,
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
    },
    {
      "id": 4274012454978,
      "admin_graphql_api_id": "gid://shopify/Order/4274012454978",
      "app_id": 580111,
      "browser_ip": "73.162.31.45",
      "buyer_accepts_marketing": true,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "9703aa132b28f515914dca46401bc363",
      "checkout_id": 25979211808834,
      "checkout_token": "ba32d07783887e48a58e6e8ff9a13d52",
      "client_details": {
        "accept_language": "en-US,en;q=0.9",
        "browser_height": null,
        "browser_ip": "73.162.31.45",
        "browser_width": null,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Mobile/15E148 Safari/604.1"
      },
      "closed_at": null,
      "confirmed": true,
      "contact_email": "haleyelizabethhoule@gmail.com",
      "created_at": "2022-03-16T22:17:53-05:00",
      "currency": "USD",
      "current_subtotal_price": "84.00",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "84.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "84.00",
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
      "current_total_price": "91.50",
      "current_total_price_set": {
        "shop_money": {
          "amount": "91.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "91.50",
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
      "email": "haleyelizabethhoule@gmail.com",
      "estimated_taxes": false,
      "financial_status": "paid",
      "fulfillment_status": null,
      "gateway": "shopify_payments",
      "landing_site": "/?gclid=CjwKCAjw8sCRBhA6EiwA6_IF4R2aU1_inDUwqRdj-fLUF9es6ehgVe1grMmE7mrblUlcjCsJPO6yABoCAqgQAvD_BwE",
      "landing_site_ref": null,
      "location_id": null,
      "name": "#345031",
      "note": null,
      "note_attributes": [],
      "number": 344031,
      "order_number": 345031,
      "order_status_url": "https://kittenish.com/29750488/orders/07c46e90fbd6bbdfa0a9bac55150f04b/authenticate?key=f0b53e6277a98b06e501e4e8cbf19dff",
      "original_total_duties_set": null,
      "payment_gateway_names": [
        "shopify_payments"
      ],
      "phone": "+14086402878",
      "presentment_currency": "USD",
      "processed_at": "2022-03-16T22:17:52-05:00",
      "processing_method": "direct",
      "reference": null,
      "referring_site": "https://www.google.com/",
      "source_identifier": null,
      "source_name": "web",
      "source_url": null,
      "subtotal_price": "84.00",
      "subtotal_price_set": {
        "shop_money": {
          "amount": "84.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "84.00",
          "currency_code": "USD"
        }
      },
      "tags": "",
      "tax_lines": [],
      "taxes_included": false,
      "test": false,
      "token": "07c46e90fbd6bbdfa0a9bac55150f04b",
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
      "total_line_items_price": "84.00",
      "total_line_items_price_set": {
        "shop_money": {
          "amount": "84.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "84.00",
          "currency_code": "USD"
        }
      },
      "total_outstanding": "0.00",
      "total_price": "91.50",
      "total_price_set": {
        "shop_money": {
          "amount": "91.50",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "91.50",
          "currency_code": "USD"
        }
      },
      "total_price_usd": "91.50",
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
      "total_weight": 663,
      "updated_at": "2022-03-16T22:33:32-05:00",
      "user_id": null,
      "billing_address": {
        "first_name": "Haley",
        "address1": "631 Vasona Ct",
        "phone": "",
        "city": "Los Gatos",
        "zip": "95032",
        "province": "California",
        "country": "United States",
        "last_name": "Houle",
        "address2": null,
        "company": null,
        "latitude": 37.2614418,
        "longitude": -121.9656238,
        "name": "Haley Houle",
        "country_code": "US",
        "province_code": "CA"
      },
      "customer": {
        "id": 5484863651906,
        "email": "haleyelizabethhoule@gmail.com",
        "accepts_marketing": true,
        "created_at": "2022-03-16T22:17:47-05:00",
        "updated_at": "2022-03-16T22:17:53-05:00",
        "first_name": "Haley",
        "last_name": "Houle",
        "orders_count": 1,
        "state": "disabled",
        "total_spent": "91.50",
        "last_order_id": 4274012454978,
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "phone": null,
        "tags": "",
        "last_order_name": "#345031",
        "currency": "USD",
        "accepts_marketing_updated_at": "2022-03-16T22:17:47-05:00",
        "marketing_opt_in_level": "single_opt_in",
        "tax_exemptions": [],
        "sms_marketing_consent": null,
        "admin_graphql_api_id": "gid://shopify/Customer/5484863651906",
        "default_address": {
          "id": 6736312467522,
          "customer_id": 5484863651906,
          "first_name": "Haley",
          "last_name": "Houle",
          "company": null,
          "address1": "631 Vasona Ct",
          "address2": null,
          "city": "Los Gatos",
          "province": "California",
          "country": "United States",
          "zip": "95032",
          "phone": "4086402878",
          "name": "Haley Houle",
          "province_code": "CA",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      },
      "discount_applications": [],
      "fulfillments": [],
      "line_items": [
        {
          "id": 10896665772098,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896665772098",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 326,
          "name": "BAHAMA MAMA DRAWSTRING PANT - S",
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
          "product_id": 6696962031682,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "EB0434B-LIME-KTN-S",
          "taxable": true,
          "title": "BAHAMA MAMA DRAWSTRING PANT",
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
          "variant_id": 39661252083778,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        },
        {
          "id": 10896665804866,
          "admin_graphql_api_id": "gid://shopify/LineItem/10896665804866",
          "fulfillable_quantity": 1,
          "fulfillment_service": "manual",
          "fulfillment_status": null,
          "gift_card": false,
          "grams": 337,
          "name": "BAHAMA MAMA BUTTON DOWN TOP - S",
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
          "price": "44.00",
          "price_set": {
            "shop_money": {
              "amount": "44.00",
              "currency_code": "USD"
            },
            "presentment_money": {
              "amount": "44.00",
              "currency_code": "USD"
            }
          },
          "product_exists": true,
          "product_id": 6696961671234,
          "properties": [],
          "quantity": 1,
          "requires_shipping": true,
          "sku": "ET0434T-LIME-KTN-S",
          "taxable": true,
          "title": "BAHAMA MAMA BUTTON DOWN TOP",
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
          "variant_id": 39661251625026,
          "variant_inventory_management": "shopify",
          "variant_title": "S",
          "vendor": "Swim 2022",
          "tax_lines": [],
          "duties": [],
          "discount_allocations": []
        }
      ],
      "payment_details": {
        "credit_card_bin": "405413",
        "avs_result_code": null,
        "cvv_result_code": null,
        "credit_card_number": "•••• •••• •••• 2027",
        "credit_card_company": "Visa"
      },
      "payment_terms": null,
      "refunds": [],
      "shipping_address": {
        "first_name": "Haley",
        "address1": "631 Vasona Ct",
        "phone": "4086402878",
        "city": "Los Gatos",
        "zip": "95032",
        "province": "California",
        "country": "United States",
        "last_name": "Houle",
        "address2": null,
        "company": null,
        "latitude": 37.2614418,
        "longitude": -121.9656238,
        "name": "Haley Houle",
        "country_code": "US",
        "province_code": "CA"
      },
      "shipping_lines": [
        {
          "id": 3551139889218,
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
};

const result = preSavePage(options);
console.log(result);