/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */

define(['N/runtime', 'N/record', 'N/search', 'N/task'],		
    /**
     * @param runtime
     * @param record
     * @param search
     * @param task
     */
    function (runtime, record, search, task) {

  function copyDeploymentRecord(scriptid) {
    try {
      var objNextDeploymentDetails = getNextDeploymentDetails(scriptid);
      var deploymentid = objNextDeploymentDetails.internalid;

      log.debug('objNextDeploymentDetails', objNextDeploymentDetails);

      var objRec = record.copy({
        type: record.Type.SCRIPT_DEPLOYMENT,
        id: deploymentid
      });

      objRec.setValue({
        fieldId: 'isdeployed',
        value: true
      });

      objRec.setValue({
        fieldId: 'loglevel',
        value: 'AUDIT'
      });

      var strRecID = objRec.save();

      var objScriptDep = search.lookupFields({
        type: record.Type.SCRIPT_DEPLOYMENT,
        id: strRecID,
        columns: ['scriptid']
      });
      log.debug('new deployment record', strRecID);
      log.debug('deployment record id', objScriptDep.scriptid);

      return objScriptDep.scriptid;

    } catch(ex) {
      var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
      log.error('Error: copyDeploymentRecord()', errorStr);
      throw ex;
    }
  }

  function createMRTaskAndSubmit(scriptid, deploymentid, params) {
    var strScriptTaskId = '';
    try {
      var objScriptTask = task.create({taskType: task.TaskType.MAP_REDUCE});
      objScriptTask.scriptId = scriptid;

      if (deploymentid) {
        objScriptTask.deploymentId = deploymentid;
      }

      objScriptTask.params = params;

      strScriptTaskId = objScriptTask.submit();

      log.audit('strScriptTaskId', strScriptTaskId);

    } catch(ex) {
      var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
      log.debug('Error: createMRTaskAndSubmit()', errorStr);
      strScriptTaskId = ex.name
    }

    return strScriptTaskId;
  }


  function createSchedTaskAndSubmit(scriptid, deploymentid, params) {
    log.audit('createSchedTaskAndSubmit', 'scriptid='+scriptid);
    log.audit('createSchedTaskAndSubmit', 'deploymentid='+deploymentid);
    var strScriptTaskId = '';
    try {
      var objScriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
      objScriptTask.scriptId = scriptid;

      if (deploymentid) {
        objScriptTask.deploymentId = deploymentid;
      }

      objScriptTask.params = params;

      strScriptTaskId = objScriptTask.submit();

      log.audit('strScriptTaskId', strScriptTaskId);

    } catch(ex) {
      var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
      log.debug('Error: createSchedTaskAndSubmit()', errorStr);

      strScriptTaskId = ex.name
    }
    log.audit('createSchedTaskAndSubmit', 'END');
    return strScriptTaskId;
  }


  function getTaskInfo(strScriptTaskId) {
    try {
      var objTaskStatus = task.checkStatus(strScriptTaskId)
      ,	objTaskInfo = {
        deploymentid: objTaskStatus.deploymentId,
        status: objTaskStatus.status
      }

      log.debug('objTaskInfo', objTaskInfo);

      return objTaskInfo;

    } catch(ex) {
      var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
      log.debug('Error: getTaskInfo()', errorStr);

      return {};
    }
  }

  function getNextDeploymentDetails(scriptid) {
    try {
      var arrFilters = [];
      if(isNaN(parseInt(scriptid)))
        arrFilters.push(['script.scriptid','is', scriptid]);
      else
        arrFilters.push(['script','anyof', scriptid]);

      var scriptdeploymentSearchObj = search.create({
        type: 'scriptdeployment',
        filters: arrFilters,
        columns:
          [
            search.createColumn({
              name: 'internalid',
              sort: search.Sort.DESC
            }),
            search.createColumn({name: 'title'}),
            search.createColumn({name: 'scriptid'}),
            search.createColumn({name: 'script'})
            ]
      })
      ,	objDeploymentDetails = {};

      // default value; will override this if there's already an existing deployment to pattern name and ID
      var	strDeploymentID = 'customdeploy_default_id_'	
        ,	strDeploymentName = 'MHI | Default Name | MR'
          ,   strDeploymentInternalID = '';

      scriptdeploymentSearchObj.run().each(function(result) {
        strDeploymentID = result.getValue('scriptid');
        strDeploymentName = result.getValue('title');
        strDeploymentInternalID = result.id;
        return false; // get only first result
      });

      objDeploymentDetails = {
          id: strDeploymentID,
          name: strDeploymentName,
          internalid: strDeploymentInternalID
      }

      log.debug('objDeploymentDetails', objDeploymentDetails);

      return objDeploymentDetails;

    } catch(ex) {
      var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
      log.debug('Error: getNextDeploymentDetails()', errorStr);
      throw ex;
    }
  }

  return {
    copyDeploymentRecord: copyDeploymentRecord,
    getTaskInfo: getTaskInfo,
    getNextDeploymentDetails: getNextDeploymentDetails,
    createMRTaskAndSubmit: createMRTaskAndSubmit,
    createSchedTaskAndSubmit : createSchedTaskAndSubmit
  };

});