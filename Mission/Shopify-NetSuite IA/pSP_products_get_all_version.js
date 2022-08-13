function preSavePage (options) {
  if (options.data) {
    options.data.forEach(rec => {
      
      //const desc = rec.body_html.replace(/[^a-zA-Z0-9 ]/g, '');
      
      //console.log(desc)
      
    let titleArray = (rec.title).split(' ');
    
    let sku = '';
    
    titleArray.forEach(title => {
      const venTitle = title.replace('-', ' ');
      if (title.length > 1) {
        if (title.includes('-') == true && venTitle !== rec.vendor) {
          if (sku === '') sku = title;
        }
      }
    });
    rec.sku = sku;
    
    console.log(sku);
    });
  }
  
  let combined = { products: [] };
  
  for (let i=0; i<options.data.length; i++){
    combined.products.push(options.data[i]);
  }
  
  return {
    data: [combined],
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}