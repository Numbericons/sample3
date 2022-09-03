function returnlyReturnAuthPostMapHook(options) {
  var responsedata = []
  var developerLog = 0
  if (options.postMapData && options.postMapData[0].nlobjFieldIds && options.postMapData[0].nlobjFieldIds.developer_log && options.postMapData[0].nlobjFieldIds.developer_log == 1) {
    developerLog = 1
  }
  //developerlogMessage("returnlyCreditMemoPostMapHook data",  JSON.stringify(options), developerLog)
  developerlogMessage("returnlyReturnAuthPostMapHook Options", JSON.stringify(options), developerLog)

  nlapiLogExecution('DEBUG', 'returnlyReturnAuthPostMapHook Options', JSON.stringify(options))
  for (var i = 0; i < options.postMapData.length; i++) {
    try {
      var data = processReturnAuthPostMap(options.postMapData[i], options)
      nlapiLogExecution('DEBUG', 'returnlyReturnAuthPostMapHook postMapData', JSON.stringify(data))

      if (data.hasOwnProperty('nlobjSublistIds') && data.nlobjSublistIds.hasOwnProperty('lineLevelDiscount') && data.nlobjSublistIds.lineLevelDiscount.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.lineLevelDiscount.lines) && data.nlobjSublistIds.lineLevelDiscount.lines.length > 0 && data.nlobjSublistIds.item.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.item.lines) && data.nlobjSublistIds.item.lines.length) {
        var newLines = []
        var newLine = JSON.parse(JSON.stringify(data.nlobjSublistIds.lineLevelDiscount.lines[0]));
        var newLinesAdded = false;
        for (var c = 0; c < data.nlobjSublistIds.item.lines.length; c++) {
          newLines.push(JSON.parse(JSON.stringify(data.nlobjSublistIds.item.lines[c])));
          if (data.nlobjSublistIds.item.lines[c].hasOwnProperty('custcol_nm_discountrate') && Math.abs(data.nlobjSublistIds.item.lines[c].custcol_nm_discountrate) != '0') {
            var discountItemRate = parseFloat(data.nlobjSublistIds.item.lines[c].custcol_nm_discountrate);
            discountItemRate = -Math.abs(discountItemRate);
            newLine["rate"] = discountItemRate;
            newLines.push(JSON.parse(JSON.stringify(newLine)));
            if (!newLinesAdded) {
              newLinesAdded = true;
            }
          }
        }
        if (newLinesAdded) {
          data.nlobjSublistIds.item.lines = JSON.parse(JSON.stringify(newLines));
        }
        delete data.nlobjSublistIds.lineLevelDiscount;
      }

      if (data.hasOwnProperty('nlobjSublistIds') && data.nlobjSublistIds.hasOwnProperty('lineLabelCost') && data.nlobjSublistIds.lineLabelCost.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.lineLabelCost.lines) && data.nlobjSublistIds.lineLabelCost.lines.length && data.nlobjSublistIds.hasOwnProperty('item') && data.nlobjSublistIds.item.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.item.lines) && data.nlobjSublistIds.item.lines.length) {
        for (var c = data.nlobjSublistIds.lineLabelCost.lines.length - 1; c >= 0; c--) {
          if (!(data.nlobjSublistIds.lineLabelCost.lines[c].hasOwnProperty('rate') && Math.abs(data.nlobjSublistIds.lineLabelCost.lines[c].rate) != '0')) {
            data.nlobjSublistIds.lineLabelCost.lines.splice(c, 1)
          }
        }
        if (Array.isArray(data.nlobjSublistIds.lineLabelCost.lines) && data.nlobjSublistIds.lineLabelCost.lines.length) {
          data.nlobjSublistIds.item.lines = data.nlobjSublistIds.item.lines.concat(data.nlobjSublistIds.lineLabelCost.lines);
        }
        delete data.nlobjSublistIds.lineLabelCost;
      }

      if (data.hasOwnProperty('nlobjSublistIds') && data.nlobjSublistIds.hasOwnProperty('salesTaxLines') && data.nlobjSublistIds.salesTaxLines.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.salesTaxLines.lines) && data.nlobjSublistIds.salesTaxLines.lines.length && data.nlobjSublistIds.hasOwnProperty('item') && data.nlobjSublistIds.item.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.item.lines) && data.nlobjSublistIds.item.lines.length) {
        for (var c = data.nlobjSublistIds.salesTaxLines.lines.length - 1; c >= 0; c--) {
          if (!(data.nlobjSublistIds.salesTaxLines.lines[c].hasOwnProperty('rate') && Math.abs(data.nlobjSublistIds.salesTaxLines.lines[c].rate) != '0')) {
            data.nlobjSublistIds.salesTaxLines.lines.splice(c, 1)
          }
        }
        if (Array.isArray(data.nlobjSublistIds.salesTaxLines.lines) && data.nlobjSublistIds.salesTaxLines.lines.length) {
          data.nlobjSublistIds.item.lines = data.nlobjSublistIds.item.lines.concat(data.nlobjSublistIds.salesTaxLines.lines);
        }
        delete data.nlobjSublistIds.salesTaxLines;
      }

      if (data.hasOwnProperty('nlobjSublistIds') && data.nlobjSublistIds.hasOwnProperty('shippingLine') && data.nlobjSublistIds.shippingLine.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.shippingLine.lines) && data.nlobjSublistIds.shippingLine.lines.length && data.nlobjSublistIds.hasOwnProperty('item') && data.nlobjSublistIds.item.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.item.lines) && data.nlobjSublistIds.item.lines.length) {
        for (var c = data.nlobjSublistIds.shippingLine.lines.length - 1; c >= 0; c--) {
          if (!(data.nlobjSublistIds.shippingLine.lines[c].hasOwnProperty('rate') && Math.abs(data.nlobjSublistIds.shippingLine.lines[c].rate) != '0')) {
            data.nlobjSublistIds.shippingLine.lines.splice(c, 1)
          }
        }
        if (Array.isArray(data.nlobjSublistIds.shippingLine.lines) && data.nlobjSublistIds.shippingLine.lines.length) {
          data.nlobjSublistIds.item.lines = data.nlobjSublistIds.item.lines.concat(data.nlobjSublistIds.shippingLine.lines);
        }
        delete data.nlobjSublistIds.shippingLine;
      }

      if (data.hasOwnProperty('nlobjSublistIds') && data.nlobjSublistIds.hasOwnProperty('discountLines') && data.nlobjSublistIds.discountLines.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.discountLines.lines) && data.nlobjSublistIds.discountLines.lines.length && data.nlobjSublistIds.hasOwnProperty('item') && data.nlobjSublistIds.item.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.item.lines) && data.nlobjSublistIds.item.lines.length) {
        var discountItem = '';
        if (data.hasOwnProperty('nlobjFieldIds') && data.nlobjFieldIds.hasOwnProperty('salesOrderId') && data.nlobjFieldIds.hasOwnProperty('discountPrice') && data.nlobjFieldIds.salesOrderId != '' && Math.abs(data.nlobjFieldIds.discountPrice) != '0') {
          discountItem = getDiscountBodyLevelItem(data.nlobjFieldIds.salesOrderId)
        }
        if (discountItem) {
          data.nlobjFieldIds.discountitem = discountItem;
          data.nlobjFieldIds.discountrate = data.nlobjFieldIds.discountPrice;
        } else {
          for (var c = data.nlobjSublistIds.discountLines.lines.length - 1; c >= 0; c--) {
            if (!(data.nlobjSublistIds.discountLines.lines[c].hasOwnProperty('rate') && Math.abs(data.nlobjSublistIds.discountLines.lines[c].rate) != '0')) {
              data.nlobjSublistIds.discountLines.lines.splice(c, 1)
            }
          }
          if (Array.isArray(data.nlobjSublistIds.discountLines.lines) && data.nlobjSublistIds.discountLines.lines.length) {
            data.nlobjSublistIds.item.lines = data.nlobjSublistIds.item.lines.concat(data.nlobjSublistIds.discountLines.lines);
          }
        }
        delete data.nlobjSublistIds.discountLines;
      }

      if (data.hasOwnProperty('nlobjFieldIds') && data.nlobjFieldIds.hasOwnProperty('isExchange') && data.nlobjFieldIds.isExchange == true) {
        if (data.hasOwnProperty('nlobjSublistIds') && data.nlobjSublistIds.hasOwnProperty('exchangeCustom') && data.nlobjSublistIds.exchangeCustom.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.exchangeCustom.lines) && data.nlobjSublistIds.exchangeCustom.lines.length && data.nlobjSublistIds.hasOwnProperty('item') && data.nlobjSublistIds.item.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.item.lines) && data.nlobjSublistIds.item.lines.length) {
          for (var c = data.nlobjSublistIds.exchangeCustom.lines.length - 1; c >= 0; c--) {
            if (!(data.nlobjSublistIds.exchangeCustom.lines[c].hasOwnProperty('rate') && Math.abs(data.nlobjSublistIds.exchangeCustom.lines[c].rate) != '0')) {
              data.nlobjSublistIds.exchangeCustom.lines.splice(c, 1)
            }
          }
          if (Array.isArray(data.nlobjSublistIds.exchangeCustom.lines) && data.nlobjSublistIds.exchangeCustom.lines.length) {
            data.nlobjSublistIds.item.lines = data.nlobjSublistIds.item.lines.concat(data.nlobjSublistIds.exchangeCustom.lines);
          }
          delete data.nlobjSublistIds.exchangeCustom;
        }
      }

      nlapiLogExecution('DEBUG', 'returnlyReturnAuthPostMapHook data', JSON.stringify(data))
      //responsedata.push({code: 200,ignored: true})


      if (data.hasOwnProperty('nlobjSublistIds') && data.nlobjSublistIds.hasOwnProperty('instantRefundVoucherLines') && data.nlobjSublistIds.instantRefundVoucherLines.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.instantRefundVoucherLines.lines) && data.nlobjSublistIds.instantRefundVoucherLines.lines.length && data.nlobjSublistIds.hasOwnProperty('item') && data.nlobjSublistIds.item.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.item.lines) && data.nlobjSublistIds.item.lines.length) {
        for (var c = data.nlobjSublistIds.instantRefundVoucherLines.lines.length - 1; c >= 0; c--) {
          if (!(data.nlobjSublistIds.instantRefundVoucherLines.lines[c].hasOwnProperty('rate') && Math.abs(data.nlobjSublistIds.instantRefundVoucherLines.lines[c].rate) != '0')) {
            data.nlobjSublistIds.instantRefundVoucherLines.lines.splice(c, 1)
          }
        }
        if (Array.isArray(data.nlobjSublistIds.instantRefundVoucherLines.lines) && data.nlobjSublistIds.instantRefundVoucherLines.lines.length) {
          data.nlobjSublistIds.item.lines = data.nlobjSublistIds.item.lines.concat(data.nlobjSublistIds.instantRefundVoucherLines.lines);
        }
        delete data.nlobjSublistIds.instantRefundVoucherLines;
      }
      if (data.nlobjFieldIds.hasOwnProperty('internalid') && data.nlobjFieldIds.internalid != '') {
        var rtid = data.nlobjFieldIds.internalid;
        var itemObj = getTheLineItems(rtid);
      }
      if (data.hasOwnProperty('nlobjFieldIds') && data.nlobjFieldIds.hasOwnProperty('celigo_replaceAllLines_item') && data.nlobjFieldIds.celigo_replaceAllLines_item == "true" && data.hasOwnProperty('nlobjSublistIds') && data.nlobjSublistIds.hasOwnProperty('item') && data.nlobjSublistIds.item.hasOwnProperty('lines') && Array.isArray(data.nlobjSublistIds.item.lines) && data.nlobjSublistIds.item.lines.length) {
        for (var linc = 0; linc < data.nlobjSublistIds.item.lines.length; linc++) {
          if (data.nlobjFieldIds.hasOwnProperty('internalid') && data.nlobjFieldIds.internalid != '') {
            if (!isEmpty(itemObj)) {
              var itemid = data.nlobjSublistIds.item.lines[linc]['item'];
              if (itemObj.hasOwnProperty(itemid)) {
                for (var iteminc = 0; iteminc < itemObj[itemid].length; iteminc++) {
                  if (typeof data.nlobjSublistIds.item.lines[linc]['item'] != "undefined" && data.nlobjSublistIds.item.lines[linc]['quantity'] == itemObj[itemid][iteminc]['qty']) {
                    data.nlobjSublistIds.item.lines[linc]["line"] = itemObj[itemid][iteminc]['line'];
                    itemObj[itemid].splice(iteminc, 1);
                    break;
                  }
                }
              }
            }
          } else {
            data.nlobjSublistIds.item.lines[linc]["line"] = (linc + 1) * 10;
          }
        }
      }
      responsedata.push({ data: data })
    } catch (e) {
      nlapiLogExecution('ERROR', e.name, e.message);
      responsedata.push({
        errors: [{
          code: e.name || "Hook Processing error",
          message: e.message
        }]
      })
    }
  }
  nlapiLogExecution('DEBUG', 'returnlyReturnAuthPostMapHook responsedata', JSON.stringify(responsedata))
  developerlogMessage("returnlyReturnAuthPostMapHook responsedata", JSON.stringify(responsedata), developerLog)
  return responsedata
}

function getTheLineItems(rtid) {
  var itemObj = {};
  var r = nlapiLoadRecord("returnauthorization", rtid);
  var recordsCount = r.getLineItemCount('item');
  for (var m = 1; m <= recordsCount; m++) {
    var itemid = r.getLineItemValue('item', 'item', m);
    var line = r.getLineItemValue('item', 'line', m);
    var qty = r.getLineItemValue('item', 'quantity', m);
    var itemType = r.getLineItemValue('item', 'itemtype', m);
    if (itemType == "Discount" && !qty) {
      qty = 1;
    }
    var itemname = r.getLineItemValue('item', 'item_display', m);
    if (itemObj.hasOwnProperty(itemid)) {
      itemObj[itemid].push({ itemid: itemid, line: parseInt(line), qty: parseInt(qty), itemname: itemname });
    } else {
      itemObj[itemid] = []
      itemObj[itemid].push({ itemid: itemid, line: parseInt(line), qty: parseInt(qty), itemname: itemname })
    }
  }
  return itemObj;
}

function processReturnAuthPostMap(postMapRecord, options) {
  var settingVal = getBillingSettingValue(options.settings)
  nlapiLogExecution('AUDIT', 'getBillingSettingValue', settingVal)
  nlapiLogExecution('DEBUG', 'postMapRecord before', JSON.stringify(postMapRecord))
  var fields = postMapRecord.nlobjFieldIds
  if (settingVal === "cashsale") {
    if (!!fields.cashSaleId) {
      fields.celigo_nlobjTransformId = fields.cashSaleId
      fields.celigo_nlobjTransformType = "cashsale"
      delete fields.cashSaleId
    } else {
      throw new Error("Unable to find Cash Sale to create Return Authorization against.")
    }
  } else if (settingVal == "invoice") {
    if (!!fields.invoiceId) {
      fields.celigo_nlobjTransformId = fields.invoiceId
      fields.celigo_nlobjTransformType = "invoice"
      delete fields.invoiceId
    } else {
      throw new Error("Unable to find Invoice to create Return Authorization against.")
    }
  } else {
    if (!!fields.cashSaleId) {
      fields.celigo_nlobjTransformId = fields.cashSaleId
      fields.celigo_nlobjTransformType = "cashsale"
      delete fields.cashSaleId
      if (!!fields.invoiceId)
        delete fields.invoiceId
    } else if (!!fields.invoiceId) {
      fields.celigo_nlobjTransformId = fields.invoiceId
      fields.celigo_nlobjTransformType = "invoice"
      delete fields.invoiceId
      if (!!fields.cashSaleId)
        delete fields.cashSaleId
    } else {
      throw new Error("Unable to find Invoice/Cash Sale to create Return Authorization against.")
    }
  }
  postMapRecord.nlobjFieldIds = fields
  nlapiLogExecution('DEBUG', 'postMapRecord after', JSON.stringify(postMapRecord))
  return postMapRecord
}

function getBillingSettingValue(settings) {
  for (var subFieldsIndx in settings.sections) {
    var subFields = settings.sections[subFieldsIndx];
    if (subFields.title == "Returns") {
      var fields = subFields.fields;
      for (var fldIndex in fields) {
        if (fields[fldIndex].name.indexOf("saveBillingSetting") !== -1) {
          nlapiLogExecution('DEBUG', 'Found saveBillingSetting', JSON.stringify(fields))
          return fields[fldIndex].value;
        }
      }
    }
  } 
  return "cashsale"
}
function getDiscountBodyLevelItem(orderId) {
  var salesorder = nlapiLoadRecord('salesorder', orderId);
  var discountitem = salesorder.getFieldValue('discountitem');
  nlapiLogExecution('DEBUG', 'getDiscountBodyLevelItem orderId', JSON.stringify(orderId))
  nlapiLogExecution('DEBUG', 'getDiscountBodyLevelItem discountitem', JSON.stringify(discountitem))
  return discountitem;
}
function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return JSON.stringify(obj) === JSON.stringify({});
}
function developerlogMessage(title, message, logStatus) {
  if (logStatus == 1) {
    try {
      var nsRecord = nlapiCreateRecord('customrecord_nm_returnly_logs');
      nsRecord.setFieldValue('name', title);
      nsRecord.setFieldValue('custrecord_nm_returnly_err_msg', message);
      nlapiSubmitRecord(nsRecord);
    } catch (e) { }
  }
}