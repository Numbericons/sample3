/**
 * nts_md_loaded_cost.js
 * 
 * @NApiVersion 2.x
 */
define([ 'N/record', 'N/runtime', 'N/search' ],

function(record, runtime, search) {

	var CALC_METHOD_LC = {
		standard_cost : 1,
		average_cost : 2
	};

	function apply_loaded_costing(sales_order) {

		var loaded_cost = null;

		return loaded_cost;
	}

	function results(search_obj) {
		var results_array = [];
		var page = search_obj.runPaged({
			pageSize : 4000
		});

		for (var i = 0; i < page.pageRanges.length; i++) {
			var pageRange = page.fetch({
				index : page.pageRanges[i].index
			});
			results_array = results_array.concat(pageRange.data);
		}

		return results_array;
	}

	function isEmpty(value) {
		if (value === null) {
			return true;
		} else if (value === undefined) {
			return true;
		} else if (value === '') {
			return true;
		} else if (value === ' ') {
			return true;
		} else if (value === 'null') {
			return true;
		} else {
			return false;
		}
	}

	return {
		apply_loaded_costing : apply_loaded_costing
	};

});