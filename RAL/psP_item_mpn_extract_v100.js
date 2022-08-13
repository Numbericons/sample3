function preSavePage (options) {
  if (options.data) {
    options.data.forEach(rec => {
      
    let titleArray = (rec.title).split(' ');
    
    let sku = '';
    
    titleArray.forEach(title => {
      if (title.length > 1) {
        if (title.includes('-') == true && title !== rec.vendor) {
          if (sku === '') sku = title;
        }
      }
    });
    rec.sku = sku;
    
    console.log(sku);
    });
  }
  
  return {
    data: options.data,
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}