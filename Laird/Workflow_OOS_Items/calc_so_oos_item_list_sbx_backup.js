/**
  * @NApiVersion 2.x
  * @NScriptType WorkflowActionScript
  */
define(['N/record','N/search','N/runtime'],function(record,search,runtime){
  function onAction(scriptContext) {

    var newRecord = scriptContext.newRecord;
    log.debug({
      title: 'Start Script - internalid='+newRecord.id
    });
    var currDateTime = new Date();
    var currHour = currDateTime.getHours();
    var currDay = currDateTime.getDay();
    //script only needs to execute M-F 7am to 6pm
    if (currDay==0 || currDay==6){
      //run twice at 10am and 4pm on the weekends
      if (currHour==10 || currHour==16){
        var scheduledToRun = true;
      }else{
        var scheduledToRun = false;
      }//end of time check
    }else{
      if (currHour<7 || currHour>18){
        var scheduledToRun = false;
      }else{
        var scheduledToRun = true;
      }//end of time check
    }//end of day check
    //var scheduledToRun = true;
    log.debug('Schedule Check','day='+currDay+' hour='+currHour+' scheduledToRun='+scheduledToRun);
    if (scheduledToRun){
      try {

        var oosListCustomFieldId = 'custbody_oos_item_list';
        var internalOrderId = newRecord.id;
        //var internalOrderId = updatedTranId;
        var salesOrderRecord= record.load({
          type: record.Type.SALES_ORDER,
          id: internalOrderId,
          isDynamic: false
        });

        var docNum = salesOrderRecord.getValue('tranid');

        var savedOosText = salesOrderRecord.getValue(oosListCustomFieldId);
        var needToSave = false;


        var mySearch = search.load({
          id: 'customsearch4019'
        });
        
        var newFilter = search.createFilter({"name":"tranid","operator":"is","values":[docNum],"isor":false,"isnot":false,"leftparens":0,"rightparens":0});
        mySearch.filters.push(newFilter);
        //log.debug('NEW search.filters',JSON.stringify(fullFilters));
        //mySearch.filters = fullFilters;
        log.debug('search.filters',mySearch.filters);
        var soSearchResultSet = mySearch.run();
        var soSearchResultPage = soSearchResultSet.getRange({
          start: 0,
          end: 200
        });
        var notFinishedBuildingCount = soSearchResultPage.length
        log.debug({
          title: 'Search Results',
          details:  notFinishedBuildingCount + ' matching line records in search'
        });

        var oosText='';
        var lineBuildableCount=0;
        for (var i = 0; i < soSearchResultPage.length; i++) {

          //var lineBuildable = soSearchResultPage[i].getValue(soSearchResultSet.columns[5]);
          var lineItemDisplayname = soSearchResultPage[i].getValue(soSearchResultSet.columns[1]);

          //if (lineBuildable=='yes'){
          lineBuildableCount++;
          oosText += lineItemDisplayname+', ';
          //}else{
          //  unbuildableText += lineItemDisplayname+', ';
          //}
          log.debug({
            title: 'Line process',
            details: 'item='+lineItemDisplayname
          });
        }//end of loop that iterates through order list 


        if(oosText==savedOosText){
          //no reason to save
        }else{

          salesOrderRecord.setValue({
            fieldId: oosListCustomFieldId,
            value: oosText,
            ignoreFieldChange: true
          });

          var needToSave = true;

        }




        if (needToSave){
          log.audit({
            title: 'Sales Order Object to be saved',
            details: salesOrderRecord
          });
          var updatedOrderId = salesOrderRecord.save({
            enableSourcing: false,
            ignoreMandatoryFields: false
          });
          log.audit({
            title: 'updatedOrderId',
            details: updatedOrderId
          });
        }

        return salesOrderRecord;
      } catch (e){
        log.error ({
          title: e.name,
          details: e.message
        });
        return false;
      }
    }//end of check schedule
    log.debug({
      title: 'End Script'
    });
  }
  return {
    onAction: onAction
  }
});