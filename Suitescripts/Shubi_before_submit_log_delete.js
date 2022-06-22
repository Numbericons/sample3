function beforeSubmit(context) {
  var currentRec = context.newRecord;
  var triggerMode = context.type;
  log.debug('rec_type', currentRec.type);


  if (triggerMode == "delete") {
    try {
      recType = currentRec.type;
      rId = currentRec.id;
      var userObj = runtime.getCurrentUser().id;
      log.debug("Current User is: ", "AfterSubmit Current User is: " + userObj);

      var folder_Id = getFolder(recType);
      if (isEmpty(folder_Id)) {
        var folder_Id = getUnknownFolder();
      }
      var contents = JSON.stringify(currentRec);
      var employeeRec = record.load({ type: record.Type.EMPLOYEE, id: userObj, isDynamic: true, });
      var empName = employeeRec.getValue({ fieldId: 'entityid' });
      log.debug('Contents: ', contents);
      log.debug(' ', 'Sub folder_Id: ' + folder_Id);

      var fileObj = file.create({
        name: recType + '_ID_' + rId + '_Deleted_By_' + empName + '_' + new Date() + '.json',
        fileType: file.Type.JSON,
        contents: contents,
        description: 'This record was deleted by    >>>> ' + empName,
        encoding: file.Encoding.UTF8,
        folder: folder_Id
      });
      var fileId = fileObj.save();
      log.debug('Record Type ', recType + '   File ID:  ' + fileId);
    } catch (e) {
      log.debug("Error in Creating a Backup" + e.toString(), " >>> END <<< ");
    }
  } else {
    log.debug("triggerMode is " + triggerMode, " >>> END <<< ");
    return;
  }
}