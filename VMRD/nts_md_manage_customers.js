/**
 * nts_md_manage_customers.js
 * 
 * @NApiVersion 2.x
 */
define(
  [
    "N/record",
    "N/runtime",
    "N/search",
    "N/ui/dialog",
    "N/currentRecord",
    "N/https",
    "N/url",
    "N/ui/message",
  ],
  function (
    record,
    runtime,
    search,
    dialog,
    currentRecord,
    https,
    url,
    message,
  ) {
    function generate_price_list_dom() {
      var customer = currentRecord.get();

      var restletUrl = url.resolveScript({
        scriptId: "customscript_nts_rs_manage_item_master",
        deploymentId: "customdeploy_nts_rs_manage_item_master",
        returnExternalUrl: false,
      },);

      var headers = new Array();

      headers["Content-Type"] = "application/json";

      var jsonObj = {
        command: "generate_price_list_dom",
        customer: customer.id,
        location: "4",
      };

      var processing_msg = message.create({
        title: "Generate Price List",
        message: "Processing...",
        type: message.Type.INFORMATION,
      },);
      processing_msg.show();

      https.post
        .promise({
          url: restletUrl,
          headers: headers,
          body: jsonObj,
        },)
        .then(function (httpresponse) {
          dialog.alert({
            title: "Generate Price List: Completed",
            message: httpresponse.body,
          },).then(function success(result) {
            var redirectURL = url.resolveRecord({
              recordType: record.Type.ESTIMATE,
              recordId: JSON.parse(httpresponse.body).estimate_id,
              isEditMode: false,
            },);

            processing_msg.hide();
            window.open(redirectURL);
          },);
        },)
        .catch(function onRejected(reason) {
          dialog.alert({
            title: "Generate Price List: Failed",
            message: reason,
          },).then(function success(result) {
            window.location.reload();
          },);
        },);
    }

    function generate_price_list_int() {
      var customer = currentRecord.get();

      var restletUrl = url.resolveScript({
        scriptId: "customscript_nts_rs_manage_item_master",
        deploymentId: "customdeploy_nts_rs_manage_item_master",
        returnExternalUrl: false,
      },);

      var headers = new Array();

      headers["Content-Type"] = "application/json";

      var jsonObj = {
        command: "generate_price_list_int",
        customer: customer.id,
        location: "4",
      };

      var processing_msg = message.create({
        title: "Generate Price List",
        message: "Processing...",
        type: message.Type.INFORMATION,
      },);
      processing_msg.show();

      https.post
        .promise({
          url: restletUrl,
          headers: headers,
          body: jsonObj,
        },)
        .then(function (httpresponse) {
          dialog.alert({
            title: "Generate Price List: Completed",
            message: "Please press OK to continue.",
          },).then(function success(result) {
            var redirectURL = url.resolveRecord({
              recordType: record.Type.ESTIMATE,
              recordId: JSON.parse(httpresponse.body).estimate_id,
              isEditMode: false,
            },);

            processing_msg.hide();
            window.open(redirectURL);
          },);
        },)
        .catch(function onRejected(reason) {
          dialog.alert({
            title: "Generate Price List: Failed",
            message: reason,
          },).then(function success(result) {
            window.location.reload();
          },);
        },);
    }

    function isEmpty(value) {
      if (value === null) {
        return true;
      } else if (value === undefined) {
        return true;
      } else if (value === "") {
        return true;
      } else if (value === " ") {
        return true;
      } else if (value === "null") {
        return true;
      } else {
        return false;
      }
    }

    function isEven(value) {
      if ((value % 2) == 0) {
        return true;
      } else {
        return false;
      }
    }

    return {
      generate_price_list_dom: generate_price_list_dom,
      generate_price_list_int: generate_price_list_int,
    };
  },
);
