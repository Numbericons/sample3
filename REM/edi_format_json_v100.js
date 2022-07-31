/*
* preSavePageFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one 'options' argument that has the following fields://
*   'data' - an array of records representing one page of data. A record can be an object {} or array [] depending on the data source.
*   'files' - file exports only. files[i] contains source file metadata for data[i]. i.e. files[i].fileMeta.fileName.
*   'errors' - an array of errors where each error has the structure {code: '', message: '', source: '', retryDataKey: ''}.
*   'retryData' - a dictionary object containing the retry data for all errors: {retryDataKey: { data: <record>, stage: '', traceKey: ''}}.
*   '_exportId' - the _exportId currently running.
*   '_connectionId' - the _connectionId currently running.
*   '_flowId' - the _flowId currently running.
*   '_integrationId' - the _integrationId currently running.
*   'pageIndex' - 0 based. context is the batch export currently running.
*   'lastExportDateTime' - delta exports only.
*   'currentExportDateTime' - delta exports only.
*   'settings' - all custom settings in scope for the export currently running.
*
* The function needs to return an object that has the following fields:
*   'data' - your modified data.
*   'errors' - your modified errors.
*   'abort' - instruct the batch export currently running to stop generating new pages of data.
*   'newErrorsAndRetryData' - return brand new errors linked to retry data: [{retryData: <record>, errors: [<error>]}].
* Throwing an exception will signal a fatal error and stop the flow.
*/
function preSavePage (options) {
  // sample code that simply passes on what has been exported
  
  if(options.data) {
    
    //var rec = options.data;
    //console.log(rec)
    
    options.data.forEach(po => {
      
      var root = po.root;
      //trandate
      var date = root.trandate;
      //console.log(date)
      
      var year = date.substring(0,4)
      var month = date.substring(4,6)
      var day = date.substring(6,8)
      
      var newTranDate = month + '/' + day + '/' + year;
            //console.log(newTranDate)
            
            root.trandate = newTranDate;
 
      //shipdate
      var ship = root.shipdate;
      //console.log(ship)
      
      var yearShip = date.substring(0,4)
      var monthShip = date.substring(4,6)
      var dayShip = date.substring(6,8)
      
      var newShipDate = monthShip + '/' + dayShip + '/' + yearShip;
            //console.log(newShipDate)
            
            root.shipdate = newShipDate;
      
      //item name
      
      var items = root.items;
      console.log(items)
      if (items.length > 1) {
        items.forEach(i => {
        var name = i.item;
  
        var newName = name[0].concat('-', name[1]);
  
        i.item = newName.replace('VN-', '');
          
        });

      } else {
      var name = items.item;
      
      var newName = name[0].concat('-', name[1]);
      
      items.item = newName.replace('VN-', '');
        
      }
      //special notes
      var notes = root.custbody_vel_special_notes;

      var newNotes = notes[0].concat(' ', notes[1]);
      console.log(newNotes)
      
      root.custbody_vel_special_notes = newNotes;

    });
    
    
    
  }
  
  return {
    data: options.data,
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}