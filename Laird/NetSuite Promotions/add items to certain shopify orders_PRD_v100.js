/**
*@NApiVersion 2.x
*@NScriptType UserEventScript
*/
define(['N/error','N/search','N/record','N/workflow','N/runtime'],function(error,search,record,workflow,runtime) {
  function afterSubmit(context) {
    var contextRecord = context.newRecord;
    var contextInternalId = contextRecord.id;
    //**** PAST PROMO DETAILS BELOW - JULY 20, 2021
    //var itemAddedToOrderInternalId = 4124; //OatMac promo card July 20, 2021
    //var itemDebugName = 'Oat Mac Milk and Creamer Postcard'
    //var specifiedOrderCount = 1;
    //disable promotion 1 at 11:15 on Aug 24th

    // **** CURRENT PROMO 2 DETAILS BELOW - MAY 18, 2022
    var specifiedOrderCount = 1;
    var itemAddedToOrderInternalId = 7058;
    var itemDebugName = '1st One-Time Order Inbox Card ($10 off)'

    // **** CURRENT PROMO 3 DETAILS BELOW - Aug 15, 2022
    var itemsAddedToOrderIds = [7194, 7195];
    var promo3itemDebugName = 'Active Immune Support product & Postcard'

    var currentRecord= record.load({
      type: record.Type.SALES_ORDER,
      id: contextInternalId,
      isDynamic: true
    });

    log.debug({title:'currentRecord',details: currentRecord});
    var custOrderCount = currentRecord.getValue({
      fieldId: 'custbody_kotn_nth_order'
    });
    var orderStatus = currentRecord.getValue({
      fieldId: 'status'
    });
    var channelText = currentRecord.getText({
      fieldId: 'custbody_celigo_etail_channel'
    });
    //log.debug('Script parameters','orderStatus='+orderStatus+' eTailChannel='+channelText+' NthOrderCount='+custOrderCount);
    //
    //if (channelText=='Shopify' && custOrderCount==specifiedOrderCount){
    //above is when custOrderCount matters
    //
    if (channelText=='Shopify'){
      //TWO SIMULTANEOUS PROMOTIONS FOR AUG 2021
      //SO MULTIPLE CONDITIONS ARE CHECKED BELOW
      //AUTHOR: GEOFF PETKUS

      //with OatMac card we need to ensure certain products are not present in the order
      //var promoOneExcludedProductsFound = 0; //when true (1) then don't add to order for this promo
      var promoOneAddItemsToOrder = 1; //adding a variable name more consistent with promo 2 handling, this exclusion approach assumes we add the item until we find a condition that invalidates that assumption
      //var excludedProductsArray = [3625,3627,3628,3948,3947,3633,3634,3635,3636,3950,3949,3654,3655,3656,3657,3952,3951,3800,4091,3801,3802,3803,4092,3037,3957,3958,4080,4094,4082,4095,4096,4097,4124,4106,3746];
      //disable promotion 1 at 11:15 on Aug 24th


      if(custOrderCount==specifiedOrderCount){
        //already set to true
      }else{
        promoOneAddItemsToOrder = 0;
      }

      //below is used to skip promo card for certain products found in the order. Sometimes not used.
      if(false){
        //Promo 1 - better to loop through the excluded array and use findSublistLineWithValue
        for ( var arrayIter=0; arrayIter<=excludedProductsArray.length; arrayIter++) {

          var foundLineNumber = currentRecord.findSublistLineWithValue({
            sublistId: 'item',
            fieldId: 'item',
            value: excludedProductsArray[arrayIter]
          });

          if (foundLineNumber>=0){
            log.debug('Found Excluded Product','item to check='+excludedProductsArray[arrayIter]+'foundLineNumber='+foundLineNumber);
            var promoOneExcludedProductsFound = 1;
            var promoOneAddItemsToOrder = 0;
            break;
          } else {
            //log.debug('Line Check Log','item to check='+excludedProductsArray[arrayIter]+'foundLineNumber='+foundLineNumber);
          }
        }
      }//disable promotion 1 at 11:15 on Aug 24th

      //Promo 2 - check to see if dates are valid and order contains pancake mix item internalid=4698, was 3518 updated 5/9/2022 JT
      var promoTwoAddItemToOrder = 0;
      var promoTwoAddItemToOrderQuantity = 0;
      var promoTwoItemAddedToOrderInternalId = 5322;//JT-legacy id 4161
      var promoTwoItemDebugName = 'Apple Cider Vinegar Shot'
      var promoTwoQualifyingProductsArray = [4698,4184];//JT-legacy for 4698 was 3518
      var currDateTime = new Date();
      var promoTwoStartDateTime = '5/10/2022 00:00:01';//JT-old date 8/23/2021 00:00:01
      var promoTwoEndDateTime = '9/30/2022 23:59:00';//JT-old date 11/27/2021 08:00:00
      var startDateCheck = currDateTime > new Date(promoTwoStartDateTime);
      var endDateCheck = currDateTime < new Date(promoTwoEndDateTime);
      //log.audit('Date Check Promo 2','>start = '+startDateCheck+' <end '+endDateCheck);
      if(startDateCheck && endDateCheck){
        for ( var arrayIter2=0; arrayIter2<=promoTwoQualifyingProductsArray.length; arrayIter2++) {

          var foundLineNumber2 = currentRecord.findSublistLineWithValue({
            sublistId: 'item',
            fieldId: 'item',
            value: promoTwoQualifyingProductsArray[arrayIter2]
          });

          if (foundLineNumber2>=0){
            log.debug('Found Qualifying Product','item to check='+promoTwoQualifyingProductsArray[arrayIter2]+'foundLineNumber2='+foundLineNumber2);
            promoTwoAddItemToOrder = 1;
            if (promoTwoQualifyingProductsArray[arrayIter2] == 4184){
              if(promoTwoAddItemToOrderQuantity == 1){
                promoTwoAddItemToOrderQuantity = 3; //fringe case where one of each sku is found
              }else{
                promoTwoAddItemToOrderQuantity = 2;
              }
            }
            if (promoTwoQualifyingProductsArray[arrayIter2] == 4698)//JT-old 3518
            {
              promoTwoAddItemToOrderQuantity = 1;
            }
            //break;
            //no longer breaking since we are looking for two qualifying products
            //
          } else {
            //do nothing, continue the loop
          }
        }// end of looping through qualifying products
      }

      //below is used to skip promo card for certain products found in the order. Sometimes not used.
      //Promo 3 - better to loop through the excluded array and use findSublistLineWithValue

      var promo3excludedProds = [4686, 3928, 3955];
      var promoThreeAddItemsToOrder = 1;
      var promoThreeExcludedProductsFound = 0;
      var date = new Date();
      var promoThreeEndDateTime = '9/15/2022 23:59:00';//JT-old date 11/27/2021 08:00:00
      var validEndDate = currDateTime < new Date(promoThreeEndDateTime);

      if (validEndDate) {
        for (var arrayIter=0; arrayIter<=promo3excludedProds.length; arrayIter++) {
  
          var foundLineNumber = currentRecord.findSublistLineWithValue({
            sublistId: 'item',
            fieldId: 'item',
            value: promo3excludedProds[arrayIter]
          });
  
          if (foundLineNumber>=0){
            log.debug('Found Excluded Product','item to check='+promo3excludedProds[arrayIter]+'foundLineNumber='+foundLineNumber);
            promoThreeExcludedProductsFound = 1;
            promoThreeAddItemsToOrder = 0;
            break;
          } else {
            //log.debug('Line Check Log','item to check='+promo3excludedProds[arrayIter]+'foundLineNumber='+foundLineNumber);
          }
        };
      }


      if(promoOneAddItemsToOrder==1 || promoTwoAddItemToOrder==1 || promoThreeAddItemsToOrder==1){
        if(promoOneAddItemsToOrder==1){
          log.audit('Adding Item to Order','item='+itemDebugName+', orderStatus='+orderStatus+' eTailChannel='+channelText+' NthOrderCount='+custOrderCount);
          //add the specified item to the order for when custOrderCount=specifiedOrderCount
          currentRecord.selectNewLine({
            sublistId: 'item'
          });
          currentRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: itemAddedToOrderInternalId
          });
          currentRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            value: 1 
          });
          currentRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            value: 0
          });
          currentRecord.commitLine({
            sublistId: 'item'
          });
        }//promo 1 triggered handling

        if(promoTwoAddItemToOrder==1){
          log.audit('Adding Item to Order','item='+promoTwoItemDebugName+', orderStatus='+orderStatus+' eTailChannel='+channelText+' NthOrderCount='+custOrderCount);
          //add the specified item to the order for when custOrderCount=specifiedOrderCount
          currentRecord.selectNewLine({
            sublistId: 'item'
          });
          currentRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: promoTwoItemAddedToOrderInternalId
          });
          currentRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            value: promoTwoAddItemToOrderQuantity
          });
          currentRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            value: 0
          });
          currentRecord.commitLine({
            sublistId: 'item'
          });
        }//promo 2 triggered handling

        if(promoThreeAddItemsToOrder==1){
          log.audit('Adding Item to Order','item='+promo3itemDebugName+', orderStatus='+orderStatus+' eTailChannel='+channelText+' NthOrderCount='+custOrderCount);
          //add the specified item to the order for when custOrderCount=specifiedOrderCount

          for (var i=0; i<itemsAddedToOrderIds.length; i++){
            currentRecord.selectNewLine({
              sublistId: 'item'
            });
            currentRecord.setCurrentSublistValue({
              sublistId: 'item',
              fieldId: 'item',
              value: itemsAddedToOrderIds[i]
            });
            currentRecord.setCurrentSublistValue({
              sublistId: 'item',
              fieldId: 'quantity',
              value: 1 
            });
            currentRecord.setCurrentSublistValue({
              sublistId: 'item',
              fieldId: 'rate',
              value: 0
            });
            currentRecord.commitLine({
              sublistId: 'item'
            });
          };
        }//promo 3 triggered handling

        //need to write transaction level values here
        var updatedTranId = currentRecord.save({
          enableSourcing: false,
          ignoreMandatoryFields: false
        });
        log.audit({title:'Saved updated order',details: 'updatedTranId='+updatedTranId}); 
      }
    }else{
      log.debug('No Items to Add to Order','internalId='+contextInternalId+' orderStatus='+orderStatus+' eTailChannel='+channelText+' NthOrderCount='+custOrderCount);
    }
    return true;

  }
  return {
    afterSubmit: afterSubmit
  };
});