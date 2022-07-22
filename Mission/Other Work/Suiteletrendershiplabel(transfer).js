/**
 * Print custom Shipping Label from Item Fulfillment
 *
 * Author: Jakob Watson
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
          	var recType = request.parameters.type;
            log.debug(logTitle, 'Id: ' + recId);
            log.debug(logTitle, 'Whats the type: ' + recType);
	if(recType == "transferorder"){
            var itfRec = record.load({
                type: record.Type.TRANSFER_ORDER,
                id: recId
            });
            var orderType = itfRec.getValue('ordertype');

          /*  if (orderType == 'SalesOrd') {
                var soId = itfRec.getValue('createdfrom');
                var custId = itfRec.getValue('entity');

                var soRec = record.load({
                    type: record.Type.SALES_ORDER,
                    id: soId
                });
                var custRec = record.load({
                    type: record.Type.CUSTOMER,
                    id: custId
                });
            }*/
		}
         else if(recType == 'itemreceipt'){
          
          var itfRec = record.load({
                type: record.Type.ITEM_RECEIPT,
                id: recId
            });
            var orderType = itfRec.getValue('ordertype');
            }
          else{
            var itfRec = record.load({
                type: record.Type.ITEM_FULFILLMENT,
                id: recId
            });
            var orderType = itfRec.getValue('ordertype');
          }
            // create PDF
            var xmlFile = file.load({
                id: '1356074'
            }); // internal id of XML file
            var xmlFileValue = xmlFile.getContents();

            var renderer = render.create();
            renderer.templateContent = xmlFileValue;
            renderer.addRecord({
                templateName: 'record',
                record: itfRec
            });

        /*    if (orderType == 'SalesOrd') {
                renderer.addRecord({
                    templateName: 'salesorder',
                    record: soRec
                });
                renderer.addRecord({
                    templateName: 'customer',
                    record: custRec
                });
            } */

            var xmlString = renderer.renderAsString();

            scriptContext.response.renderPdf(xmlString);

        }

        return {onRequest}

    });