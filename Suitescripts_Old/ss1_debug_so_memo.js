//require('N/record','N/search'],function(record,search){
  x = nlapiLoadRecord('salesorder', 3221)
  x.setFieldValue('memo', 'test2')
  x.fields.memo
  nlapiLogExecution('DEBUG', 'PreMap Options', x.fields.memo)
//});