function userEvent_beforeLoad(type, form, request)
{
    /*
    Add the specified client script to the document that is being shown
    It looks it up by id, so you'll want to make sure the id is correct
    */
//var useri = nlapiGetContext().getUser(); 
  var orderid = nlapiGetFieldValue('id');
  var stat = nlapiGetFieldValue('status');
  	   var rec = nlapiLoadRecord('purchaseorder',orderid);
		nlapiLogExecution('debug', 'title', stat);
  		var cust = rec.getFieldValue('entity');
 		 var invoiceAdded = rec.getFieldValue('custbody_vel_inv_num');
  //nlapiLogExecution('debug', 'title', invoiceAdded);
form.setScript("customscript_vel_client_page");
  if((stat == "Pending Bill") || (stat == "Approved by Supervisor/Pending Bill")){
    /*
    Add a button to the page which calls the openURL() method from a client script
    */
  if(!invoiceAdded){
      form.addButton("custpage_open_url", "Add Invoice", "openURL()");    
    }
  }
  form.addButton("custpage_open_case", "Create Case", "thirdURL()");
}