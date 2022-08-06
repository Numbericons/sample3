/**
 * Record Type: Item
 *
 * Print Item Shelf Label
 *
 * Author: Zachary Oliver
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget', 'N/url'],
    /**
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
(serverWidget, url) => {
    /**
     * Defines the function definition that is executed before record is loaded.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @param {Form} scriptContext.form - Current form
     * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
     * @since 2015.2
     */
    const beforeLoad = (scriptContext) => {
        var logTitle = 'beforeLoad';
        var type = scriptContext.type;

        if (type == scriptContext.UserEventType.VIEW) {
            var form = scriptContext.form;
            var newRec = scriptContext.newRecord;
            var recId = newRec.id;
          	var recType = newRec.type;
            log.debug(logTitle, 'TO ID: ' + recId);

        //     var suiteletUrl = url.resolveScript({
        //         scriptId: 'customscript_vel_render_transfer',
        //         deploymentId: 'customdeploy_vel_render_transfer',
        //         params: {
        //             'id': recId,
        //           	'type' : recType
        //         }
        //     });

        //     var script = "window.open('" + suiteletUrl + "', '_blank');";

            form.addButton({
                id: 'custpage_vel_shelf_label',
                label: 'Shelf Label'
                // functionName: script
            });
        }
    }

    return { beforeLoad }
});