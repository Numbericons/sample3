/**
 * Print LPT Shipping Label from Item Fulfillment
 *
 * Author: Sam Durst
 *
 * @NApiVersion 2.1
 *
 * @NScriptType Suitelet
 */
 define(['N/file', 'N/record', 'N/render', 'N/search', 'N/https'],
 /**
  * @param{file} file
  * @param{record} record
  * @param{render} render
  * @param{search} search
  */
 (file, record, render, search, https) => {
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

         const itemFul = record.load({
             type: record.Type.ITEM_FULFILLMENT,
             id: recId
         });

         const orderType = itemFul.getValue('ordertype');
         log.debug('orderType', orderType);

         // Start of Transfer Order Scenario - Item fulfillment
         //////////////////////////////////////////////////////
         if (orderType == 'TrnfrOrd') {
           
           const itemFul = record.load({
             type: record.Type.ITEM_FULFILLMENT,
             id: recId
         });

             const itemLines = itemFul.getLineCount({ sublistId: 'item' })
             
             var renderer = render.create();

             var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">";

             xml += "<pdfset>";

             for (var x = 0; x < itemLines; x++) {
               
               const toId = itemFul.getValue('createdfrom');
             
               const memo = itemFul.getValue('memo');

             const transferOrder = record.load({
                 type: record.Type.TRANSFER_ORDER,
                 id: toId
             });

             const toNumber = transferOrder.getValue('tranid');
             log.debug('toNumber', toNumber);
               
               const sub = transferOrder.getText('subsidiary');
             log.debug('sub', sub);
               
               const branchLocation = transferOrder.getText('location');

             const division = transferOrder.getText('cseg_vel_division');
             log.debug('Branch Location/Division', branchLocation + ' - ' + division);
               
                 const itemNumber = itemFul.getSublistValue({
                     sublistId: 'item',
                     fieldId: 'custcol_ava_item',
                     line: x
                 });

                 const itemDesc = itemFul.getSublistValue({
                     sublistId: 'item',
                     fieldId: 'description',
                     line: x
                 });

                 const quantity = itemFul.getSublistValue({
                     sublistId: 'item',
                     fieldId: 'quantity',
                     line: x
                 });
                 log.debug('quantity', quantity);
               
               const item = itemFul.getSublistValue({
                     sublistId: 'item',
                     fieldId: 'item',
                     line: x
                 });
               
               const aqNum = itemFul.getSublistValue({
                     sublistId: 'item',
                     fieldId: 'custcol_soc1_aq_line_number',
                     line: x
                 });
                 const itemRec = record.load({
                     type: record.Type.INVENTORY_ITEM,
                     id: item
                 });

                 const desc = itemRec.getValue('displayname');
                 log.debug('Item/Description', itemNumber + ' - ' + desc);
               
               const displayDesc = desc.replace(/&/g, 'and');
               log.debug('NEW', displayDesc);

                 //Get Inventory Detail subrecord
                 const invDetail = itemFul.getSublistSubrecord({
                     sublistId: 'item',
                     fieldId: 'inventorydetail',
                     line: x
                 });

                 const invLines = invDetail.getLineCount('inventoryassignment');
                 
                 var text = '';
                 
                 var xmlFile = file.load({
                     id: '2393858'
                 });
                 
                 var xmlFileValue = xmlFile.getContents();
                      renderer.addRecord({
                         templateName: 'record',// + itemNumber,
                         record: itemFul
                     });
                 //Get Inventory Detail subrecord - Serial numbers
                 for (var i = 0; i < invLines; i++) { // for each line

                     const serialLot = invDetail.getSublistText({
                         sublistId: 'inventoryassignment',
                         fieldId: 'issueinventorynumber',
                         line: i
                     });

                     log.debug('serialLot', serialLot)
if(serialLot) {
                     //text = '<#list record.item as item><#list 0..<label_count as x><#if item.custcol_vel_serial_num != "">'
                     text += '<tr>'
                     text += '<td colspan="12" height= "60px" margin-top="12px"><b>' + sub + '</b></td>'
                   text += '<td colspan="1" height= "60px" margin-top="12px"></td>'
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="6" height= "60px" style="font-size: 18pt;"><u><b></b></u></td>'
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="7" height= "60px"><b>' + itemNumber + '</b></td>'
                       if(aqNum){text += '<td colspan="5" height= "60px" align= "right">AQ LINE #: <b>' + aqNum + '</b></td>'}
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="12" height= "60px"><b>' + displayDesc + '</b></td>'
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="8" height= "60px">SERIAL NUMBER: <b>' + serialLot + '</b></td>'
                     text += '<td colspan= "4" align= "right" style="padding: 0;" height= "50px"><barcode codetype="code128" showtext="true" value="' + serialLot + '"/></td>'
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="9" height= "60px"><b>' + toNumber + '</b><br /><br /></td>'
                     text += '<td colspan= "3" align= "right" style="padding: 0;" height= "60px"><barcode codetype="code128" showtext="true" value="' + toNumber + '"/></td>'
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="6" height= "105px"><b>' + branchLocation + ' / ' + division + '</b></td>'
                     text += '<td colspan="6" height= "105px" align= "right"><b>' + memo + '</b></td>'
                     text += '</tr>'
                     //  text += '</#if></#list></#list>'

}

                     // create PDF
                     /* var xmlFile = file.load({
                                 id: '1677573'
                             });
                         
                         var xmlFileValue = xmlFile.getContents();
                             
                               xmlFileValue = xmlFileValue.replace('serialLot', serialLot);
            
                                xmlFileValue = xmlFileValue.replace('label_count', itemLines);*/
                     //renderer.templateContent = xmlFileValue;



                     renderer.addRecord({
                         templateName: 'salesorder',
                         record: transferOrder
                     });

                     renderer.addRecord({
                         templateName: 'itemss',
                         record: itemRec
                     });


                 }
                   log.debug('text', text)
               
                 xmlFileValue = xmlFileValue.replace('replaceMe', text);

                 var xmlAdd = xmlFileValue;

                 xml += xmlAdd;
                 log.debug('xmlFileValue', xmlFileValue)
             }

             xml += "</pdfset>";

             renderer.templateContent = xml;

             var xmlString = renderer.renderAsString();

             scriptContext.response.renderPdf(xmlString);


         }

         
         // Start of Sales Order Scenario - Item fulfillment
         ///////////////////////////////////////////////////
         else {
           
           const itemFul = record.load({
             type: record.Type.ITEM_FULFILLMENT,
             id: recId
         });

             const soId = itemFul.getValue('createdfrom');
             
               const memo = itemFul.getValue('memo');

             const salesOrder = record.load({
                 type: record.Type.SALES_ORDER,
                 id: soId
             });

             const soNumber = salesOrder.getValue('tranid');
             log.debug('SO Number', soNumber);

             const branchLocation = salesOrder.getText('location');

             const division = salesOrder.getText('cseg_vel_division');
             log.debug('Branch Location/Division', branchLocation + ' - ' + division);

             const projectName = salesOrder.getText('job');
             log.debug('Project Name', projectName);
           
           const projectNameNoAnd = projectName.replace(/&/g, 'and');
               log.debug('NEW', projectNameNoAnd);

             const custId = salesOrder.getValue('entity');

             const customer = record.load({
                 type: record.Type.CUSTOMER,
                 id: custId
             });

             const custName = customer.getValue('companyname');
           
           const custNameNoAnd = custName.replace(/&/g, 'and');
               log.debug('NEW', custNameNoAnd);

             const custNumber = customer.getValue('entityid');
             log.debug('Customer Name/Number', custName + ' - ' + custNumber);

             const itemLines = itemFul.getLineCount({ sublistId: 'item' });
             log.debug('itemLines', itemLines);


             var renderer = render.create();

             var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">";

             xml += "<pdfset>";

             for (var x = 0; x < itemLines; x++) {

                 const itemNumber = itemFul.getSublistValue({
                     sublistId: 'item',
                     fieldId: 'custcol_ava_item',
                     line: x
                 });

                 const itemDesc = itemFul.getSublistValue({
                     sublistId: 'item',
                     fieldId: 'description',
                     line: x
                 });

                 const quantity = itemFul.getSublistValue({
                     sublistId: 'item',
                     fieldId: 'quantity',
                     line: x
                 });
                 log.debug('quantity', quantity);

                 const item = itemFul.getSublistValue({
                     sublistId: 'item',
                     fieldId: 'item',
                     line: x
                 });
                 const aqNum = itemFul.getSublistValue({
                     sublistId: 'item',
                     fieldId: 'custcol_soc1_aq_line_number',
                     line: x
                 });
                 const itemRec = record.load({
                     type: record.Type.INVENTORY_ITEM,
                     id: item
                 });

                 const desc = itemRec.getValue('displayname');
                 log.debug('Item/Description', itemNumber + ' - ' + desc);

               const displayDesc = desc.replace(/&/g, 'and');
               log.debug('NEW', displayDesc);
               
                 const invDetail = itemFul.getSublistSubrecord({
                     sublistId: 'item',
                     fieldId: 'inventorydetail',
                     line: x
                 });

                 const invLines = invDetail.getLineCount('inventoryassignment');
                 
                 var text = '';
                 
                 var xmlFile = file.load({
                     id: '2393856'
                 });
                 
                 var xmlFileValue = xmlFile.getContents();
                      renderer.addRecord({
                         templateName: 'record',// + itemNumber,
                         record: itemFul
                     });
                 //Get Inventory Detail subrecord - Serial numbers
                 for (var i = 0; i < invLines; i++) { // for each line

                     const serialLot = invDetail.getSublistText({
                         sublistId: 'inventoryassignment',
                         fieldId: 'issueinventorynumber',
                         line: i
                     });

                     log.debug('serialLot', serialLot)
if(serialLot){
                     //text = '<#list record.item as item><#list 0..<label_count as x><#if item.custcol_vel_serial_num != "">'
                     text += '<tr>'
                     text += '<td colspan="9" height= "60px" margin-top="12px"><b>' + custNameNoAnd + ' / ' + custId + '</b></td>'
                     if(custNumber){text += '<td colspan= "3" align= "right" style="padding: 0;" height= "60px" margin-top="12px"><barcode codetype="code128" showtext="true" value="' + custNumber + '"/></td>'}
                     text += '<td colspan="1" height= "60px" margin-top="12px"></td>'
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="12" height= "60px" style="font-size: 19pt;"><u><b>' + projectNameNoAnd + '</b></u></td>'
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="7" height= "60px"><b>' + itemNumber + '</b></td>'
                       if(aqNum){text += '<td colspan="5" height= "60px" align= "right">AQ LINE #: <b>' + aqNum + '</b></td>'}
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="12" height= "60px"><b>' + displayDesc + '</b></td>'
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="9" height= "60px">SERIAL NUMBER: <b>' + serialLot + '</b></td>'
                     if(serialLot){text += '<td colspan= "3" align= "right" style="padding: 0;" height= "60px"><barcode codetype="code128" showtext="true" value="' + serialLot + '"/></td>'}
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="9" height= "60px"><b>' + soNumber + '</b><br /><br /></td>'
                     if(soNumber){text += '<td colspan= "3" align= "right" style="padding: 0;" height= "50px"><barcode codetype="code128" showtext="true" value="' + soNumber + '"/></td>'}
                     text += '</tr>'
                     text += '<tr>'
                     text += '<td colspan="6" height= "105px"><b>' + branchLocation + ' / ' + division + '</b></td>'
                     text += '<td colspan="6" height= "105px" align= "right"><b>' + memo + '</b></td>'
                     text += '</tr>'
                     //  text += '</#if></#list></#list>'
}


                     // create PDF
                     /* var xmlFile = file.load({
                                 id: '1677573'
                             });
                         
                         var xmlFileValue = xmlFile.getContents();
                             
                               xmlFileValue = xmlFileValue.replace('serialLot', serialLot);
            
                                xmlFileValue = xmlFileValue.replace('label_count', itemLines);*/
                     //renderer.templateContent = xmlFileValue;



                     renderer.addRecord({
                         templateName: 'salesorder',
                         record: salesOrder
                     });

                     renderer.addRecord({
                         templateName: 'customer',
                         record: customer
                     });

                     renderer.addRecord({
                         templateName: 'itemss',
                         record: itemRec
                     });


                 }
                   log.debug('text', text)
               
                 xmlFileValue = xmlFileValue.replace('replaceMe', text);

                 var xmlAdd = xmlFileValue;

                 xml += xmlAdd;
                 log.debug('xmlFileValue', xmlFileValue)
             }

             xml += "</pdfset>";

             renderer.templateContent = xml;

             var xmlString = renderer.renderAsString();

             scriptContext.response.renderPdf(xmlString);



         }

     }
     return { onRequest }

 });
