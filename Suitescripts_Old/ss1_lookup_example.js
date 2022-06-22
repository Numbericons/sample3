//from Finn

var mediaType = response[j].data._PARENT.mediaTypeName;

var filter = new nlobjSearchFilter('custrecordnsts_strata_name', null, 'is', mediaType);

var item = nlapiSearchRecord('customrecord_strata_media_types', null, filter, new nlobjSearchColumn('custrecordnsts_item_mapping'))[0];
var itemId = item.getValue(new nlobjSearchColumn('custrecordnsts_item_mapping'));