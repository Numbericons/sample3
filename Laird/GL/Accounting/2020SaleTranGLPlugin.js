// var srcCreditAccount = 54; //49001 Sales
// var targetWholesaleAccount = 730; //40002 
// var targetDirectAccount = 719; //41002 
// var targetAmazonAccount = 725; //42002

var srcAccounts = {
  '54' : { //49001 Sales
    wholesale: 730, //40002
    foodservice: 832, //44202 - added for 2020
    direct: 719, //41002
    amazon: 725 //42002
  },
  '230': { // 50091 Cost of Goods Sold-Materials
    isCogs:true,
    marketing0amount: 323, // 80110 Marketing Samples
    unclass0amount: 230, // 50091 Cost of Goods Sold-Materials
    wholesale: 761,	//50002	Cost of Goods Sold- Wholesale
    foodservice: 836,	//50044	Cost of Goods Sold- Food Service
    direct: 759, //	50012	Cost of Goods Sold- Direct 
    amazon: 760 //	50022	Cost of Goods Sold- Amazon
  },
  '213': { // 50001 Cost of Goods Sold-Materials -same logic as 50091
    isCogs:true,
    marketing0amount: 323, // 80110 Marketing Samples
    unclass0amount: 230, // 50091 Cost of Goods Sold-Materials
    wholesale: 761,	//50002	Cost of Goods Sold- Wholesale
    foodservice: 836,	//50044	Cost of Goods Sold- Food Service
    direct: 759, //	50012	Cost of Goods Sold- Direct 
    amazon: 760 //	50022	Cost of Goods Sold- Amazon
  },
  '108': { //49002	Shipping Income
    wholesale: 732, //	40003	Shipping Income- Wholesale
    foodservice: 833, //44203 - added for 2020
    direct: 723, //	41003	Shipping Income- Direct
    amazon: 728 //	42003	Shipping Income- Amazon
  }

};

function customizeGlImpact(tran, standardLines, customLines, book){
  
  var needCustomLineForLineDiscounts = false;
  //order source = Website or Amazon will account for 80% of transactions
  var orderSrc = tran.getFieldText('custbody_order_source');
  var txType = tran.getFieldValue('type');
  var docNum = tran.getFieldValue('tranid');
  var custId = tran.getFieldValue('entity');
  
  
  //look to see if orderSrc is present in the createdFrom transaction
  if(!orderSrc) {
    nlapiLogExecution('DEBUG', 'orderSrc is NULL', 'working on tran:'+docNum+' type:'+txType);
    if (txType=='itemship'){
      var cfInfo = nlapiLookupField('salesorder', tran.getFieldValue('createdfrom'), 'custbody_order_source', true);
      if(cfInfo){
        orderSrc=cfInfo;
      }else{
        orderSrc = null;
      }
    }else if (txType=='itemrcpt'){
      var cfInfo = nlapiLookupField('returnauthorization', tran.getFieldValue('createdfrom'), 'custbody_order_source', true);
      if(cfInfo){
        orderSrc=cfInfo;
      }else{
        orderSrc = null;
      }
    }else if (txType=='custcred'){
      var cfInfo = nlapiLookupField('invoice', tran.getFieldValue('createdfrom'), 'custbody_order_source', true);
      if(cfInfo){
        orderSrc=cfInfo;
      }else{
        orderSrc = null;
      }
    }
  }
  
  if(!custId) return;
  var customerType = nlapiLookupField('customer', custId, 'custentity_wholesale', true);
  
  
  if (txType=='itemship'){
    //Sometimes an IF record is created from a Vendor Return Authorization (VRMA)
    //Skipping reclass processing for those cases
    
    //need to determine the type of the createdFrom record
    var parentId = tran.getFieldValue('createdfrom')
    //if createdFrom is NULL then skip processing
    if (parentId) {
      var parentTxType = nlapiLookupField('transaction', parentId, 'type');
      nlapiLogExecution('DEBUG', 'Loaded Type of Parent Tx on IF Record', 'type='+parentTxType);
      if (parentTxType=='SalesOrd'){
        var departmentId = nlapiLookupField('salesorder', tran.getFieldValue('createdfrom'), 'department');
        var orderDiscountName = nlapiLookupField('salesorder', tran.getFieldValue('createdfrom'), 'custbody_bbc_stored_order_disc_item');
        if (orderDiscountName){
          orderDiscountName = orderDiscountName.toLowerCase()
        }else{
          orderDiscountName = 'no order level discount found';
        }
        var loadParentTx = nlapiLoadRecord('salesorder', tran.getFieldValue('createdfrom'));
        //var orderDiscountTotal = loadParentTx.getFieldValue('discounttotal');
        var intCount = loadParentTx.getLineItemCount('item');
        var marketingLineCredits = 0;
        var replacementLineCredits = 0;
        for (j=1; j <= intCount; j++)
        {
          var recItem = loadParentTx.getLineItemValue('item', 'item', j);
          var recItemName = loadParentTx.getLineItemText('item', 'item', j).toLowerCase();
          var recRate = loadParentTx.getLineItemValue('item', 'rate', j);
          var recAmount = parseFloat(loadParentTx.getLineItemValue('item', 'amount', j));
          if (recAmount<0){
            if (recItemName.indexOf('marketing') >=0){
              var recCost = parseFloat(loadParentTx.getLineItemValue('item', 'costestimate', j-1));
              marketingLineCredits = marketingLineCredits + recCost;
              //marketingLineCredits = marketingLineCredits - recAmount;
              //needCustomLineForLineDiscounts = true;
              //commented out on 8/30/2020 after discussion with Kim Ausk. COGS only needs to be remapped if order has 100% order-level discount
            }
            nlapiLogExecution('DEBUG', 'Processing SO Lines', 'item='+recItem+'-'+recItemName+' rate='+recRate+' amount='+recAmount+' recCost='+recCost);
          }
        }
        nlapiLogExecution('DEBUG', 'Total Line Discounts', 'marketingLineCredits='+marketingLineCredits);
      } //if the type of the IF parent is not salesOrd then nothing to do
    } //if no parent on IF Tx then nothing to do
  }else{
    var departmentId = tran.getFieldValue('department');
    var orderDiscountName = 'x';//currently only needed for IF records
  }

  var isDirect = 'Website' == orderSrc;
  var isAmazon = 'Amazon' == orderSrc;
  //2019 code commented out
  //var isWholesale = !isDirect && 'Wholesale Item' == customerType;
  var isWholesale = '8' == departmentId; //Geoff following same structure as Brett
  var isFoodService = '9' == departmentId; //Geoff following same structure as Brett
  //fallback if nothing else matches
  isDirect = isDirect || (!orderSrc && !isAmazon && !isWholesale && !isFoodService);

  var saleTotal = null;
	//log.debug('Debug Values','departmentId='+departmentId+'isFoodService='+isFoodService+'isWholesale='+isWholesale);
    nlapiLogExecution('DEBUG', 'Debug Values','orderSrc='+orderSrc+'docNum='+docNum+ ' departmentId='+departmentId+' isFoodService='+isFoodService+' isWholesale='+isWholesale+' txType='+txType+' orderDiscountName='+orderDiscountName);

  
  if(isDirect || isAmazon || isWholesale || isFoodService){
  //if(false){

    for(var i = standardLines.getCount() -1; i>= 0; i--){
      var line = standardLines.getLine(i);
      var accountMap = srcAccounts[''+line.getAccountId()];
      if(accountMap){
        if(accountMap.isCogs) {
        //nlapiLogExecution('DEBUG', 'Inside iscogs', '');
          if(saleTotal === null){
            nlapiLogExecution('DEBUG', 'Look at saleTotal', 'saleTotal='+saleTotal);
            //identifies the first loop through the order when we will eval order total amount
            try{ // assumes an item fulfillment; anything else will error looking up sales order
              if (txType=='itemship'){
                saleTotal = parseFloat(nlapiLookupField('salesorder', tran.getFieldValue('createdfrom'), 'total')) || 0;
              }else{
                saleTotal = 1;//don't check for marketing
              }
              if (saleTotal == 0){
                //this sequence covers when the originating order has a $0 amount, which is one case of marketing/replacement discount
                var indexMktgDiscItem = orderDiscountName.indexOf('marketing');
                var indexReplacementDiscItem = orderDiscountName.indexOf('replacement');
                if (indexMktgDiscItem>=0 || orderDiscountName==''){
                  //typically orderDiscountName will contain a string stamped as a result of 
                  //a scheduled workflow script. On the rare case that the field is empty, assume that it's a marketing order
                  var isMarketing=true;
                  var isUnclassDiscount=false;
                }else if(indexReplacementDiscItem>=0){
                  var isMarketing=false;
                  var isUnclassDiscount=false;
                  //let the existing Direct or Amazon processes capture
                }else{
                  var isMarketing=false;
                  if (orderDiscountName=='no order level discount found'){
                    var isUnclassDiscount=false;
                    //leave both variables False so that the line item discount handling can occur
                  }else{
                  	var isUnclassDiscount=true;
                    nlapiLogExecution('AUDIT', 'Unmatched Order Level Discount', 'orderDiscountName='+orderDiscountName);
                  }
                }
                nlapiLogExecution('DEBUG', 'Inside 0 Value Order', 'indexMktgDiscItem='+indexMktgDiscItem+'indexReplacementDiscItem='+indexReplacementDiscItem);
              }
            }
            catch(e){
              nlapiLogExecution('AUDIT', 'should not have checked marketing cogs on '+ tran.getFieldValue('tranid'), (e.message || e.toString()) + (e.getStackTrace ? (' \n \n' + e.getStackTrace().join(' \n')) : ''));
              saleTotal = -1;
            }
          }//don't recheck order variables for each line
          //this sequence covers when the originating order has > $0 amount but one or more discount lines have been applied
          
          //var itemId = loadParentTx.getLineItemValue('item', 'item', i);
          // var itemCFlist = loadParentTx.getLineItemValue('item', 'customFieldList', i);
          //  var itemOrderLine = loadParentTx.getLineItemValue('item', 'orderline', i);
          //nlapiLogExecution('DEBUG', 'Inside >0 Value Order', 'i='+i+' account='+line.getAccountId()+' orderDiscountTotal='+orderDiscountTotal);
          
        }
        //nlapiLogExecution('DEBUG', 'Eval COGS Params', isMarketing ? 'marketing0amount' : isUnclassDiscount ? 'unclass0amount' : isDirect ? 'direct' : isAmazon ? 'amazon' : isFoodService ? 'foodservice' : 'wholesale');
        var targetAccount = accountMap[isMarketing ? 'marketing0amount' : isUnclassDiscount ? 'unclass0amount' : isDirect ? 'direct' : isAmazon ? 'amazon' : isFoodService ? 'foodservice' : 'wholesale']; //CHECK if mapping altered
        var srcCredit = (parseFloat(line.getCreditAmount()) || 0) ;
        var srcDebit =  (parseFloat(line.getDebitAmount()) ||0); 
        if(srcCredit || srcDebit){
          var reverseLine = customLines.addNewLine();
          reverseLine.setAccountId(line.getAccountId());
          if(srcCredit){
            reverseLine.setDebitAmount(srcCredit.toFixed(2));
          }
          if(srcDebit){
            reverseLine.setCreditAmount(srcDebit.toFixed(2));
          }

          transferValues(line, reverseLine);

          var salesLine = customLines.addNewLine();
          salesLine.setAccountId(targetAccount);
          if(srcCredit){
            salesLine.setCreditAmount(srcCredit.toFixed(2));
          }
          if(srcDebit){
            salesLine.setDebitAmount(srcDebit.toFixed(2));
          }
          transferValues(line, salesLine);

        }
      }
    }
    //final reconciliation needed if some of the lines were marketing or replacement discounts
    if(needCustomLineForLineDiscounts){
      if(marketingLineCredits>0){
        var accountMap = srcAccounts['230'];
        targetAccount = accountMap[isMarketing ? 'marketing0amount' : isUnclassDiscount ? 'unclass0amount' : isDirect ? 'direct' : isAmazon ? 'amazon' : isFoodService ? 'foodservice' : 'wholesale'];
        //reverse from departmental COGS
        //current setting of targetAccount should be reversed
        isMarketing = true;
        var newTargetAccount = accountMap[isMarketing ? 'marketing0amount' : isUnclassDiscount ? 'unclass0amount' : isDirect ? 'direct' : isAmazon ? 'amazon' : isFoodService ? 'foodservice' : 'wholesale'];
        //read additional properties from first GL Line
        var tempLine = standardLines.getLine(0);
        var adjustDownLine = customLines.addNewLine();
        adjustDownLine.setAccountId(targetAccount);
        adjustDownLine.setCreditAmount(marketingLineCredits.toFixed(2));
        adjustDownLine.setLocationId(tempLine.getLocationId());
        adjustDownLine.setEntityId(tempLine.getEntityId());
        adjustDownLine.setDepartmentId(tempLine.getDepartmentId());
        adjustDownLine.setClassId(tempLine.getClassId());
        adjustDownLine.setMemo('Adjustments to account for line item marketing discounts');
        
        var adjustUpLine = customLines.addNewLine();
        adjustUpLine.setAccountId(newTargetAccount);
        adjustUpLine.setDebitAmount(marketingLineCredits.toFixed(2));
        adjustUpLine.setLocationId(tempLine.getLocationId());
        adjustUpLine.setEntityId(tempLine.getEntityId());
        adjustUpLine.setDepartmentId(tempLine.getDepartmentId());
        adjustUpLine.setClassId(tempLine.getClassId());
        adjustUpLine.setMemo('Adjustments to account for line item marketing discounts');
        nlapiLogExecution('DEBUG', 'Total Line Discounts', 'marketingLineCredits='+marketingLineCredits+' newTargetAccount='+newTargetAccount);
      }
    }
  }


}


function transferValues(srcLine, destLine){
  destLine.setLocationId(srcLine.getLocationId());
  destLine.setEntityId(srcLine.getEntityId());
  destLine.setDepartmentId(srcLine.getDepartmentId());
  destLine.setClassId(srcLine.getClassId());
  destLine.setMemo(srcLine.getMemo());
}