// v110

const rowKeys = ["amount", "processed_at"];

function setRow(object) {
  let retObj = {};

  rowKeys.forEach(key => { retObj[key] = object[key] })
  retObj.total_price = retObj.amount;

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

function checkRow(object) {
  const currDay = new Date().getDate();
  const day = parseInt(object.processed_at.slice(8, 10));

  return day === currDay
}

function postResponseMap(options) {
  const daily = options.settings.export.exportType === "Daily";
  for (let i=0; i < options.postResponseMapData[0].shopify_tenderTrans.length; i++){
    let row = setRow(options.postResponseMapData[0].shopify_tenderTrans[i]);
    row.hour = setHour(row.processed_at);
    if (parseFloat(row.amount) < 0) {
      const rowIsDaily = checkRow(row);
      if (daily && !rowIsDaily) continue;

      options.postResponseMapData[0].lines.push(row);
    }
  }

  delete options.postResponseMapData[0].shopify_tenderTrans;

  return options.postResponseMapData
}

const options = {
  "postResponseMapData": [
    {
  "lines": [
    {
      "total_price": "220.69",
      "created_at": "2022-03-20T15:59:09-05:00",
      "cancelled_at": null,
      "closed_at": "2022-03-20T15:59:11-05:00",
      "confirmed": true,
      "hour": "03/20/2022 15:00:00"
    },
    {
      "total_price": "3169.78",
      "created_at": "2022-03-20T16:58:11-05:00",
      "cancelled_at": null,
      "closed_at": "2022-03-20T16:58:12-05:00",
      "confirmed": true,
      "hour": "03/20/2022 16:00:00"
    },
    {
      "total_price": "577.22",
      "created_at": "2022-03-20T17:52:46-05:00",
      "cancelled_at": null,
      "closed_at": "2022-03-20T17:52:51-05:00",
      "confirmed": true,
      "hour": "03/20/2022 17:00:00"
    },
    {
      "total_price": "877.58",
      "created_at": "2022-03-20T18:55:30-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/20/2022 18:00:00"
    },
    {
      "total_price": "1050.46",
      "created_at": "2022-03-20T19:58:47-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/20/2022 19:00:00"
    },
    {
      "total_price": "715.00",
      "created_at": "2022-03-20T20:45:54-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/20/2022 20:00:00"
    },
    {
      "total_price": "1163.22",
      "created_at": "2022-03-20T21:59:44-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/20/2022 21:00:00"
    },
    {
      "total_price": "693.00",
      "created_at": "2022-03-20T22:55:13-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/20/2022 22:00:00"
    },
    {
      "total_price": "1012.25",
      "created_at": "2022-03-20T23:50:35-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/20/2022 23:00:00"
    },
    {
      "total_price": "139.00",
      "created_at": "2022-03-21T00:09:42-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/21/2022 00:00:00"
    },
    {
      "total_price": "139.00",
      "created_at": "2022-03-21T01:31:14-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/21/2022 01:00:00"
    },
    {
      "total_price": "89.50",
      "created_at": "2022-03-21T04:50:43-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/21/2022 04:00:00"
    },
    {
      "total_price": "236.50",
      "created_at": "2022-03-21T05:58:04-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/21/2022 05:00:00"
    },
    {
      "total_price": "91.50",
      "created_at": "2022-03-21T06:38:51-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/21/2022 06:00:00"
    },
    {
      "total_price": "397.20",
      "created_at": "2022-03-21T07:44:27-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/21/2022 07:00:00"
    },
    {
      "total_price": "455.50",
      "created_at": "2022-03-21T08:34:27-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/21/2022 08:00:00"
    },
    {
      "total_price": "1178.64",
      "created_at": "2022-03-21T09:57:59-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/21/2022 09:00:00"
    },
    {
      "total_price": "3325.06",
      "created_at": "2022-03-21T10:55:40-05:00",
      "cancelled_at": null,
      "closed_at": "2022-03-21T10:55:41-05:00",
      "confirmed": true,
      "hour": "03/21/2022 10:00:00"
    },
    {
      "total_price": "2142.69",
      "created_at": "2022-03-21T11:59:57-05:00",
      "cancelled_at": "2022-03-21T12:46:30-05:00",
      "closed_at": "2022-03-21T12:46:29-05:00",
      "confirmed": true,
      "hour": "03/21/2022 11:00:00"
    },
    {
      "total_price": "1709.94",
      "created_at": "2022-03-21T12:59:15-05:00",
      "cancelled_at": null,
      "closed_at": "2022-03-21T12:59:16-05:00",
      "confirmed": true,
      "hour": "03/21/2022 12:00:00"
    },
    {
      "total_price": "3516.51",
      "created_at": "2022-03-21T13:57:51-05:00",
      "cancelled_at": null,
      "closed_at": "2022-03-21T13:57:53-05:00",
      "confirmed": true,
      "hour": "03/21/2022 13:00:00"
    },
    {
      "total_price": "1881.83",
      "created_at": "2022-03-21T14:55:07-05:00",
      "cancelled_at": null,
      "closed_at": "2022-03-21T14:55:09-05:00",
      "confirmed": true,
      "hour": "03/21/2022 14:00:00"
    },
    {
      "total_price": "1930.45",
      "created_at": "2022-03-21T15:49:31-05:00",
      "cancelled_at": null,
      "closed_at": null,
      "confirmed": true,
      "hour": "03/21/2022 15:00:00"
    }
  ],
  "page": 0,
  "shopify_tenderTrans": [
    {
      "id": 3790233403458,
      "order_id": 4282763673666,
      "amount": "32.25",
      "currency": "USD",
      "user_id": 71602569282,
      "test": false,
      "processed_at": "2022-03-22T15:54:17-05:00",
      "remote_reference": "pi_3KfsEfDgloxQhGZf48jSU60B",
      "payment_details": {
        "credit_card_number": "•••• •••• •••• 7908",
        "credit_card_company": "Visa"
      },
      "payment_method": "credit_card"
    },
    {
      "id": 3790233272386,
      "order_id": 4282763575362,
      "amount": "-21.65",
      "currency": "USD",
      "user_id": 71394558018,
      "test": false,
      "processed_at": "2022-03-22T15:54:11-05:00",
      "remote_reference": null,
      "payment_details": null,
      "payment_method": "cash"
    },
    {
      "id": 3790231568450,
      "order_id": 4282762068034,
      "amount": "16.13",
      "currency": "USD",
      "user_id": 71602569282,
      "test": false,
      "processed_at": "2022-03-22T15:52:48-05:00",
      "remote_reference": "pi_3KfsDVDgloxQhGZf0FX2m9dA",
      "payment_details": {
        "credit_card_number": "•••• •••• •••• 6181",
        "credit_card_company": "Visa"
      },
      "payment_method": "credit_card"
    },
    {
      "id": 3790228291650,
      "order_id": 4282758332482,
      "amount": "43.50",
      "currency": "USD",
      "user_id": null,
      "test": false,
      "processed_at": "2022-03-21T15:49:31-05:00",
      "remote_reference": "ebb83ef5-39a5-9d77-b1bc-58c4c8c487ac",
      "payment_details": null,
      "payment_method": "other"
    }
  ]
}
  ],
  "_exportId": "62392c4f5b09e8619669e090",
  "_connectionId": "61484a04b0f05b29ea7e19ab",
  "_flowId": "623270d912fd9a2fd58de008",
  "_integrationId": "62326d004c899123a43217c9",
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

const result = postResponseMap(options);
console.log(result);