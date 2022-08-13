    /**
     * Print Shelf Label for Items
     *
     * Author: Zachary Oliver
     * 
     * Version: v112
     *
     * @NApiVersion 2.1
     * @NScriptType Suitelet
     */
    define(['N/file', 'N/record', 'N/render', 'N/search'],
        /**
         * @param{file} file
         * @param{record} record
         * @param{render} render
         * @param{search} search
         */
        (file, record, render, search) => {
            /**
             * Defines the Suitelet script trigger point.
             * @param {Object} scriptContext
             * @param {ServerRequest} scriptContext.request - Incoming request
             * @param {ServerResponse} scriptContext.response - Suitelet response
             * @since 2015.2
             */
            const onRequest = (scriptContext) => {
                var logTitle = 'onRequest';
                var request = scriptContext.request;
                var recId = request.parameters.id;
                log.debug(logTitle, 'Id: ' + recId);
        
                var item = record.load({
                    type: record.Type.INVENTORY_ITEM,
                    id: recId
                });

                // create PDF
                var xmlFile = file.load({
                    id: '3294508'
                });
                var xmlFileValue = xmlFile.getContents();

                log.error('xmlFileValue: ', xmlFileValue);

                var text = createText(item);

                xmlFileValue = xmlFileValue.replace('replaceMe', text);

                var renderer = render.create();
                renderer.templateContent = xmlFileValue;
                renderer.addRecord({
                    templateName: 'record',
                    record: item
                });

                var xmlString = renderer.renderAsString();
                scriptContext.response.renderPdf(xmlString);
            }

            const getUnits = (item_record) => {
                var units = item_record.getValue('unitstype');
                
                var unitRec = record.load({
                    type: record.Type.UNITS_TYPE,
                    id: units
                });

                var unitText = unitRec.getSublistValue({
                        sublistId: 'uom',
                        fieldId: 'unitname',
                        line: 0
                });

                return unitText;
            }

            const getQuantities = (item_record) => {
                const quantities = ["pricequantity1","pricequantity2", "pricequantity3", "pricequantity4"];
                var priceQuants = {};

                for (let k=0; k<quantities.length; k++){ 
                    var priceBreak = item_record.getValue(quantities[k]);
                    priceQuants[quantities[k]] = priceBreak;
                }

                return priceQuants;
            }

            const getPrice = (item_record) => {
                const priceCount = item_record.getLineCount({ sublistId: 'price' });

                const priceQuantities = getQuantities(item_record);
                const prices = ["price_1_", "price_2_", "price_3_", "price_4_"];
                
                for (let k=0; k<priceCount; k++){
                    var price = item_record.getSublistValue({
                            sublistId: 'price',
                            fieldId: 'pricelevelname',
                            line: k
                    });

                    log.debug(price, price);
                    if (price !== "Retail Price") continue;

                    var priceRet = {};
                    priceRet.retailPrice = item_record.getSublistValue({
                            sublistId: 'price',
                            fieldId: 'price_1_',
                            line: k
                    });
                    priceRet.retailPrice = setDecimal(priceRet.retailPrice);
                    log.debug('Price ret with retail:', priceRet);

                    for (let i=1; i<prices.length; i++){

                        var currPrice = item_record.getSublistValue({
                            sublistId: 'price',
                            fieldId: prices[i],
                            line: k
                        });
                        if (!currPrice) continue;

                        priceRet.qtyPrice = setDecimal(currPrice);
                        priceRet.qtyBreak = priceQuantities[`pricequantity${i+1}`];

                        log.debug('priceRet: ', priceRet);
                        return priceRet;
                    }

                    return priceRet;
                }
            }

            const setItem = (itemRec) => {
                var newItem = {};

                newItem.id = itemRec.getValue('itemid');
                newItem.name = itemRec.getValue('name');
                newItem.display = itemRec.getValue('displayname');
                newItem.unitText = getUnits(itemRec);
                newItem.vendor = itemRec.getValue('vendorname');
                newItem.pricing = getPrice(itemRec);

                return newItem;
            }

            const setDecimal = (amount) => {
                const strAmt = amount.toString();
                const array = strAmt.split('.');

                if (array.length === 1) {
                    return strAmt + '.00';
                } else {
                    let decimal = array[1];

                    if (decimal.length === 0) {
                        decimal = '.00'
                    } else if (decimal.length === 1) {
                        decimal = decimal + '0';
                    } else {
                        decimal = decimal.slice(0,2);
                    }
                    return array[0] + '.' + decimal;
                }
            }

            const dateFormat = () => {
              let date = new Date;

              var year = date.getFullYear();
              var month = date.getMonth() + 1;
              var day = date.getDate();

              if (month.toString().length === 1) month = '0' + month.toString();
              if (day.toString().length === 1) day = '0' + day.toString();

              return `${year}${month}${day}`;
            }

            const createText = (itemRec) => {
                var text =  '<table><tr>';
                item = setItem(itemRec);
                const itemOffset = item.pricing.qtyPrice ? '-115px' : '-105px';
                
                text += `<td colspan="12" height= "21px" style="font-size: 10pt;">${item.display}</td>`;
                text += '</tr><tr>';
                text += `<td colspan="1" height= "15px" style="font-size: 16pt; margin-right: 30px;">$${item.pricing.retailPrice}</td>`;
                text += `<td colspan="1" height= "15px" style="font-size: 14pt; margin: 2px 20px 0px -65px;">${item.unitText}</td>`;

                if (item.pricing.qtyPrice) {
                    text += `<td colspan="1" height= "0px" style="font-size: 16pt; line-height: 1px; margin-top: -8px; background-color: #e9e8e8; padding: 10px 15px 5px 10px;"><p style="font-size: 10pt;">Buy ${item.pricing.qtyBreak} ${item.unitText} for </p><p style="font-size: 16pt; margin-top: -2px">$${item.pricing.qtyPrice} ${item.unitText}</p></td>`;
                  } else {
                  text += `<td colspan="1" height= "0px" width= "120px" style="font-size: 16pt; line-height: 1px; margin-top: -8px; background-color: white; padding: 10px 15px 10px 15px;"><p style="font-size: 10pt;"></p><p style="font-size: 16pt;"></p></td>`;
                }
                text += '</tr><tr>';
                text += `<td colspan="1" height= "25px" style="font-size: 8pt; margin-top: -3px;">${dateFormat()}</td>`;
                text += '</tr><tr>';
                text += `<td colspan="1" height= "22px" style="font-size: 14pt; margin: -17px 0px 0px -10px;"><barcode codetype="code128" height="17px" showtext="false" value="${item.id}"/></td>`;
                text += '</tr><tr>';
                text += `<td colspan="1" height= "25px" style="font-size: 14pt; margin-top: -19px">${item.id}</td>`;
                text += '</tr></table>';

                return text;
            }

            return { onRequest }
        });