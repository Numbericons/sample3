/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/message', 'N/url', 'N/ui/dialog'],
/**
 * @param {record} record
 * @param {message} message
 * @param {url} url
 */
function(record, message, url, dialog) {
    var exports = {};

    function pageInit(context) {
        //implement
    }

    function onButtonClick(context) {
        dialog.alert({
            title: 'Hello',
            message: "Hello World!"
        })
    }

    exports.onButtonClick = onButtonClick;
    exports.pageInit = pageInit;
    return exports;
});