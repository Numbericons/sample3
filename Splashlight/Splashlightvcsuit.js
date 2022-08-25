function uploader(request, response)
{

  if (request.getMethod() == 'GET')
  {
      var amount = request.getParameterValues('amount');
      var thisid = request.getParameterValues('thisid');
      var vendorid = request.getParameterValues('vendorid');
      var date = request.getParameterValues('_d_t');
      var form = nlapiCreateForm('Upload File');
      var toddate = form.addField('todaydate', 'date', 'Invoice Date');

    var fileField = form.addField('file', 'file', 'Add invoice (PDF)');
    toddate.setLayoutType('normal', 'startcol');
	var venentit = nlapiLookupField('vendor',vendorid,'entityid');
    var vencomp = nlapiLookupField('vendor',vendorid,'companyname');
    var concatv = venentit.concat(' ',vencomp);
    
    var invnum = form.addField('custpage_invnum', 'text', 'Invoice Number');
    
    var check = form.addField('custpage_compareamount', 'currency', 'Invoice Amount');

	var hidedate = form.addField('hiddendate', 'date', 'Hidden');    
    	
    	form.insertField(fileField, 'custpage_invnum');
	//	form.insertField(toddate, 'file');

    var poid = form.addField('custpage_poid', 'text', 'PO ID');
    var venname = form.addField('ven_name', 'text', 'ven nm');
    var POamount = form.addField('custpage_initamount', 'currency', 'OG Amount');
	var POvendor = form.addField('custpage_vendo', 'text', 'Vendor');
    POamount.setDisplayType('hidden');
    poid.setDisplayType('hidden');
	POvendor.setDisplayType('hidden');
    venname.setDisplayType('hidden');
	venname.defaultValue = concatv;
    toddate.defaultValue = date;//new Date();
   // toddate.setDisplayType('disabled');
    hidedate.defaultValue = date;//new Date();
    hidedate.setDisplayType('hidden');
    POvendor.defaultValue = vendorid;
    POamount.defaultValue = amount;
    poid.defaultValue = thisid;
    //var POID = form.addField('custpage_PoId', 'text', 'ID');
    invnum.setMandatory(true);
    check.setMandatory(true);
	fileField.setMandatory(true);
    form.setScript("customscript_vel_client_page");
// var url = "https://4513917-sb1.extforms.netsuite.com/app/site/crm/externalcasepage.nl?compid=4513917_SB1&formid=1&h=AAFdikaIHljMJspxBptEWaw6fqzazm-79LV67YIRj5wZNKWuCCQ&companyname="+vendorid
      form.addButton('case_url','Create Case','secondURL()');
	  form.addSubmitButton();
      form.addResetButton();
      response.writePage(form);
    var test = request.getParameter('file')
    nlapiLogExecution("Debug", "Input", test);
  }
else
   {
     var field = request.getParameter('file');
     var popinv = request.getParameter('custpage_invnum');
     var setfile = request.getParameter('custpage_poid');
     var file = request.getFile("file");

     var folderSearch = nlapiSearchRecord("folder",null,
			[
  				 ["name","is",setfile]
			],
				[
  					 new nlobjSearchColumn("internalid")
				]
			);
for (var i = 0; folderSearch != null && i < folderSearch.length; i++)
 {
 var searchresult = folderSearch[0].getValue('internalid');
nlapiLogExecution("Debug", "Search", searchresult);
 }
nlapiLogExecution("Debug", "Search", folderSearch);
if(searchresult == null){
     var folder = nlapiCreateRecord('folder');
     		folder.setFieldValue('name',setfile);
     var parentFolderId = nlapiSubmitRecord(folder,true);
     		file.setFolder(parentFolderId); //internalid of Folder
}
     else
{
file.setFolder(searchresult);
};
     var id = nlapiSubmitFile(file);
     var form = nlapiCreateForm('Upload File');
     response.writePage(form);
     nlapiAttachRecord("file",id,"purchaseorder",setfile);
     var todaydate = new Date();
	 var currentdate = nlapiDateToString(todaydate);
     var rec = nlapiLoadRecord('purchaseorder', setfile); 
    // var test = rec.getFieldValue('employee');
     rec.setFieldValue('custbody_vel_invoice_date', currentdate);
     rec.setFieldValue('custbody_vel_link_invoice', id);
     rec.setFieldValue('custbody_vel_inv_num', popinv);
	 nlapiSubmitRecord(rec, true);
     var text1=form.addField('success', 'label', 'Upload Successful!');

  }




   }