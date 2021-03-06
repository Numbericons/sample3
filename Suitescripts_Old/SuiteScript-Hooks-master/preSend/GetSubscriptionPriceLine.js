/**
 * Assume that rows are grouped on the export
 * 
 * @param {Object}
 *            options The data sent to the hook. See SamplePreSendDataBatch.json
 *            for format
 * @return {Object} response containing the data sent to integrator.io
 */
var getSubscriptionPrice = function(options) {

	// The object that will be returned from this hook
	var response = {};
	response.data = [];
	response.errors = [];

	for (var i = 0; i < options.data.length; i++) {
		/*
		 * The response object contains of a data array and an errors array The data
		 * array is the elements that will be processed by integrator.io The errors
		 * array will show up as failed records on the integrator.io dashboard. Each
		 * element in the array may consist of one or more errors
		 */

		response.data.push(JSON.parse(JSON.stringify(options.data[i])));
	}

	try {
		for(var r =0; r<response.data.length; r++){
			var subscription = nlapiLoadRecord('subscription', response.data[r][0].id);
			if(!subscription)
				continue;

			for(var l = 1; l<= subscription.getLineItemCount('priceinterval'); l++){
				for(var k =0; k<response.data[r].length; k++){
					if(response.data[r][k]['Line Number'] != subscription.getLineItemValue('priceinterval','linenumber', l))
						continue;

					if(!response.data[r][k].intervals)
						response.data[r][k].intervals = [];

					response.data[r][k].intervals.push({
						'frequency': subscription.getLineItemText('priceinterval','frequency', l),
						'amount': subscription.getLineItemValue('priceinterval','recurringamount', l),
						'status': subscription.getLineItemText('priceinterval','status', l)
					});
				}
			}
		}
	} catch (e) {
		nlapiLogExecution('ERROR', e.name, e.message);
		/*
		 * the individual error should be logged in the function called within
		 * the try-catch block
		 */
		for (var i = 0; i < response.data.length; i++) {
			response.data[i] = null;
			response.errors.push({
				code : e.name,
				message : e.message
			});
		}

	}

	// Send the data to integrator.io for further processing
	return response;

};

/**
 * Log the data passed into the hook into the SuiteScript logs of the Scheduled
 * Script
 * 
 * @param {Object}
 *            options Data passed into the PreSend hook
 * @param {Object}
 *            response The object that is passed on to integrator.io
 * @return null
 */
var logOptions = function(options, response) {
	nlapiLogExecution('AUDIT', 'PreSend Options', JSON.stringify(options));
	nlapiLogExecution('AUDIT', 'PreSend Response', JSON.stringify(response));
};