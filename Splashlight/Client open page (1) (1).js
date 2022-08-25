function openURL()
{
    /*
    nlapiGetFieldValue() gets the url client side in a changeable field, which nlapiLookupField (which looks it up server side) can't do
    if your url is hidden/unchanging or you only care about view mode, you can just get rid of the below and use nlapiLookupField() instead
    */ 
 
  
  	var id = nlapiGetFieldValue('id');
	var amount = nlapiGetFieldValue('amount');
  	var vendor = nlapiLookupField('purchaseorder' , id ,'entity')
  	var getmoney = nlapiLookupField ( 'purchaseorder' , id , 'total');
  	var POdate = nlapiLookupField ('purchaseorder' , id ,'trandate');


  
    var url = 'https://4513917.app.netsuite.com/app/site/hosting/scriptlet.nl?script=675&deploy=1&amount='+getmoney+'&thisid='+id+'&vendorid='+vendor+'&_d_t='+POdate//nlapiGetFieldValue('custbody_url');


    /*
    nlapiGetFieldValue() doesn't work in view mode (it returns null), so we need to use nlapiLookupField() instead
    if you only care about edit mode, you don't need to use nlapiLookupField so you can ignore this
    */
    if(url == null)
    {
        var myType = nlapiGetRecordType();
        var myId = nlapiGetRecordId();
      	
        url = 'https://4513917.app.netsuite.com/app/site/hosting/scriptlet.nl?script=675&deploy=1&amount='+amount+'&thisid='+myId//nlapiLookupField(myType, myId,'custbody_url');
    }

    //opening up the url
    window.open(url);
}

function secondURL()
{
  var whoami = nlapiGetContext().getUser();
  var email = nlapiGetContext().getEmail();
  var thepoId = nlapiGetFieldValue('custpage_poid');
  console.log(whoami);
 // var thisven = nlapiGetFieldValue('ven_name'); 
  // console.log(thisven);
 var url2 = "https://4513917.extforms.netsuite.com/app/site/crm/externalcasepage.nl?compid=4513917&formid=3&h=AAFdikaIKZHULFzd1oGux_S4XbBKDSS3P2_piCvEgSAiCaaV_vw&custevent_vel_ven="+whoami+"&custevent_vel_transaction="+thepoId+"&email="+email+"&companyname=8"

    if(url2 == null)
    {

        url2 = "https://4513917.extforms.netsuite.com/app/site/crm/externalcasepage.nl?compid=4513917&formid=3&h=AAFdikaIKZHULFzd1oGux_S4XbBKDSS3P2_piCvEgSAiCaaV_vw&custevent_vel_ven="+whoami+"&custevent_vel_transaction="+thepoId+"&email="+email+"&companyname=8"
    }

    //opening up the url
    window.open(url2);    
}
function thirdURL()
{
  var whoami = nlapiGetContext().getUser();
   var email = nlapiGetContext().getEmail();
  var gettra = nlapiGetFieldValue('id');
  var thepoId = nlapiGetFieldValue('custpage_poid');
  console.log(whoami);
 // var thisven = nlapiGetFieldValue('ven_name'); 
 console.log(id); 
 console.log(email);
 var url3 = "https://4513917.extforms.netsuite.com/app/site/crm/externalcasepage.nl?compid=4513917&formid=3&h=AAFdikaIKZHULFzd1oGux_S4XbBKDSS3P2_piCvEgSAiCaaV_vw&custevent_vel_ven="+whoami+"&custevent_vel_transaction="+gettra+"&email="+email+"&companyname=8"

    if(url3 == null)
    {

        url3 = "https://4513917.extforms.netsuite.com/app/site/crm/externalcasepage.nl?compid=4513917&formid=3&h=AAFdikaIKZHULFzd1oGux_S4XbBKDSS3P2_piCvEgSAiCaaV_vw&custevent_vel_ven="+whoami+"&custevent_vel_transaction="+gettra+"&email="+email+"&companyname=8"
    }

    //opening up the url
    window.open(url3);    
}
function checkinput(){


var fileText = nlapiGetFieldValue('file');
var amounten = nlapiGetFieldValue('custpage_compareamount');
var amountpo = nlapiGetFieldValue('custpage_initamount');
var venpo = nlapiGetFieldValue('custpage_vendo');
var inNo = nlapiGetFieldValue('custpage_invnum');
var todDate = nlapiGetFieldValue('todaydate');
var Hiddendate = nlapiGetFieldValue('hiddendate');
console.log(inNo);
  console.log(venpo);
  console.log(amountpo);
              console.log(amounten);
  var splitString = fileText.split(".");
  var suffix = splitString.length - 1;
  
  if(splitString[suffix].toLowerCase() !== 'pdf'){
    alert('The file you attached is not a PDF, please attach a PDF')
    return false;
     }
var startTime = new Date(todDate);
var endTime = new Date(Hiddendate);
if( startTime < endTime){
    alert('The invoice date you entered cannot be set before the shoot date')
    return false;
   }
  
  if(amounten !== amountpo){
     alert('The amount you entered does not match the amount on the Purchase Order')
    return false;
     }
var vendorbillSearch = nlapiSearchRecord("vendorbill",null,
[
   [["mainline","is","T"],"AND",["type","anyof","VendBill"],"AND",["formulatext: {entity.id}","is",venpo],"AND",["formulatext: {tranid}","is",inNo]], 
   "OR",
   [["type","anyof","PurchOrd"],"AND",["mainline","is","T"],"AND",["formulatext: {entity.id}","is",venpo],"AND",["custbody_vel_inv_num","is",inNo]]
],
[
   new nlobjSearchColumn("trandate"),
   new nlobjSearchColumn("line"),
   new nlobjSearchColumn("entity")
]
);
for (var i = 0; vendorbillSearch != null && i < vendorbillSearch.length; i++)
 {
 var searchresult2 = vendorbillSearch[0].getValue('entity');
nlapiLogExecution("Debug", "Search", searchresult2);
 }
if (searchresult2 != null)
    {
     alert('A bill with this invoice number already exist')
    return false;
    };

  // Upload the file
		// Fetch the file ID
		// Load sales order record
		// attach file id as related record
	return true;	// Save sales order record
		// window.close()

}