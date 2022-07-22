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
	
            var item = record.load({
                type: record.Type.INVENTORY_ITEM,
                id: recId
            });

            log.debug('record: ', item)

            // create PDF
            var xmlFile = file.load({
                id: '3294508'
            }); // internal id of XML file
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

        const createText = (itemRec) => {
            var text =  '<tr>';
            var test = 'test'
            const display = itemRec.getValue('displayname');
            const units = itemRec.getValue('saleunit');

            
            text += `<td colspan="12" height= "60px" style="font-size: 19pt;">${display}</td>`;
            text += '</tr>';
            text += '<tr>';
            text += `<td colspan="12" height= "60px" style="font-size: 19pt;">${units}</td>`;
            text += '</tr>';

            return text;
        }

        return {onRequest}
    });