/**
 * Print Shelf Label for Items
 *
 * Author: Zachary Oliver
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
	
            var itfRec = record.load({
                type: record.Type.INVENTORY_ITEM,
                id: recId
            });

            log.debug('record: ', itfRec)

            // create PDF
            var xmlFile = file.load({
                id: '3294508'
            }); // internal id of XML file
            var xmlFileValue = xmlFile.getContents();

            log.error('xmlFileValue: ', xmlFileValue)

            var renderer = render.create();
            renderer.templateContent = xmlFileValue;
            renderer.addRecord({
                templateName: 'record',
                record: itfRec
            });

            var text =  '<tr>'
            text += '<td colspan="12" height= "60px" style="font-size: 19pt;">From Suitelet</td>'
            text += '</tr>'

            var xmlString = renderer.renderAsString();
            scriptContext.response.renderPdf(xmlString);

        }

        return {onRequest}

    });