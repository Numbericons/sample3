define(["require", "exports", "N/search", "N/task", "N/format"], function (require, exports, search, task, format) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLogs = exports.getInstances = exports.runScript = exports.getDeployments = void 0;
    exports.getDeployments = () => {
        const results = [];
        search
            .create({
            type: search.Type.SCRIPT_DEPLOYMENT,
            filters: [
                ['script.scripttype', search.Operator.ANYOF, 'MAPREDUCE'],
                'AND',
                ['isdeployed', search.Operator.IS, 'T'],
            ],
            columns: [
                'title',
                'scriptid',
                search.createColumn({ name: 'scriptid', join: 'script' }),
                search.createColumn({ name: 'name', join: 'script' }),
            ],
        })
            .run()
            .each((result) => {
            results.push({
                text: result.getValue({ name: 'title' }),
                value: {
                    scriptId: result.getValue({ name: 'scriptid', join: 'script' }),
                    scriptName: result.getValue({ name: 'name', join: 'script' }),
                    deploymentId: result.getValue({ name: 'scriptid' }),
                    deploymentInternalID: result.id,
                },
            });
            return true;
        });
        return results;
    };
    exports.runScript = (payload) => {
        const taskId = task
            .create({
            taskType: task.TaskType.MAP_REDUCE,
            scriptId: payload.scriptId,
            deploymentId: payload.deploymentId,
        })
            .submit();
        const status = task.checkStatus({ taskId });
        return { taskId, status };
    };
    function convertPacificDateToEpoch(date) {
        const dateObj = format.parse({
            value: date,
            type: format.Type.DATETIMETZ,
            timezone: format.Timezone.AMERICA_LOS_ANGELES,
        });
        // @ts-ignore
        return typeof dateObj.getTime === 'function' ? dateObj.getTime() : null;
    }
    function getRecentTasks(deploymentId) {
        const results = [];
        let count = 0;
        search
            .create({
            type: search.Type.SCHEDULED_SCRIPT_INSTANCE,
            filters: [
                ['scriptdeployment.internalid', search.Operator.ANYOF, deploymentId],
            ],
            columns: [
                search.createColumn({
                    name: 'taskid',
                    summary: search.Summary.GROUP,
                }),
                search.createColumn({
                    name: 'datecreated',
                    summary: search.Summary.MIN,
                    sort: search.Sort.DESC,
                }),
            ],
        })
            .run()
            .each((result) => {
            const taskId = result.getValue({
                name: 'taskid',
                summary: search.Summary.GROUP,
            });
            results.push(taskId);
            return ++count < 5;
        });
        return results;
    }
    function getTasksStageDetails(taskIds) {
        if (!taskIds.length) {
            return [];
        }
        const results = {};
        const filters = [];
        taskIds.forEach((taskId, index) => {
            filters.push(['taskid', search.Operator.IS, taskId]);
            if (index < taskIds.length - 1) {
                filters.push('OR');
            }
        });
        search
            .create({
            type: search.Type.SCHEDULED_SCRIPT_INSTANCE,
            filters,
            columns: [
                'taskid',
                'datecreated',
                'status',
                'percentcomplete',
                'mapreducestage',
                'startdate',
                'enddate',
            ],
        })
            .run()
            .each((result) => {
            const taskId = String(result.getValue({ name: 'taskid' }));
            if (!results.hasOwnProperty(taskId)) {
                results[taskId] = [];
            }
            results[taskId].push({
                stage: result.getValue({ name: 'mapreducestage' }),
                dateCreated: convertPacificDateToEpoch(result.getValue({ name: 'datecreated' })),
                startDate: convertPacificDateToEpoch(result.getValue({ name: 'startdate' })),
                endDate: convertPacificDateToEpoch(result.getValue({ name: 'enddate' })),
                status: result.getValue({ name: 'status' }),
                percentComplete: result.getValue({ name: 'percentcomplete' }),
            });
            return true;
        });
        return results;
    }
    exports.getInstances = (params) => {
        const capitalize = (text) => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        const stagesSortOrder = {
            'Get Input Data': 1,
            Map: 2,
            Reduce: 3,
            Shuffle: 4,
            Summarize: 5,
        };
        const recentTasks = getRecentTasks(params.deploymentInternalID);
        const stageDetails = getTasksStageDetails(recentTasks);
        const tasks = recentTasks.map((taskId) => {
            const status = task.checkStatus(taskId);
            const stages = stageDetails[taskId].sort((a, b) => stagesSortOrder[a.stage] - stagesSortOrder[b.stage]);
            return {
                taskId,
                dateCreated: stages[0].dateCreated,
                startDate: stages[0].startDate,
                endDate: stages[stages.length - 1].endDate,
                percentComplete: status.getPercentageCompleted(),
                status: capitalize(String(status.status)),
                currentStage: capitalize(String(status.stage)),
                stages,
            };
        });
        return tasks;
    };
    exports.getLogs = (params) => {
        const results = [];
        search
            .create({
            type: 'scriptexecutionlog',
            filters: [
                ['date', search.Operator.WITHIN, 'today'],
                'AND',
                [
                    'scriptdeployment.internalid',
                    search.Operator.ANYOF,
                    params.deploymentInternalID,
                ],
                'AND',
                ['internalidnumber', search.Operator.GREATERTHAN, params.lastLogId],
            ],
            columns: [
                'type',
                'date',
                'time',
                'title',
                'detail',
                search.createColumn({
                    name: 'internalid',
                    sort: search.Sort.ASC,
                }),
            ],
        })
            .run()
            .each((result) => {
            results.push({
                id: result.id,
                type: result.getValue({ name: 'type' }),
                date: result.getValue({ name: 'date' }),
                time: result.getValue({ name: 'time' }),
                title: result.getValue({ name: 'title' }),
                detail: result.getValue({ name: 'detail' }),
            });
            return true;
        });
        return results;
    };
});
