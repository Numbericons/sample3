/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/message', 'N/url'], 
/**
 * @param {record} record
 * @param {message} message
 * @param {url} url
 */
(record, message, url) => {
    const createEstimate = (custId) => {
        const r = record.load({type: record.Type.CUSTOMER, id: custId});
        // ... etc ...
        if (somethingWrong) {
            const errorMsg = message.create({
                title: 'Something wrong',
                message: `Could not find something`,
                type: message.Type.ERROR
            });
            errorMsg.show();
            return null;
        }
        // ... etc ...
        const estId = createEstimate(data);
        const urlLink = url.resolveRecord({
            isEditMode: false,
            recordId: estId,
            recordType: record.Type.ESTIMATE
        });
        const successMsg = message.create({
            title: 'Estimate created',
            message: `Estimate has been successfully created <a href=${urlLink} target="_blank">here</a>.`;
            type: message.Type.CONFIRMATION
        });
    }
    return {createEstimate}
});