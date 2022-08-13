function preSavePage (options) {
  if (options.data) {
    options.data.forEach(rec => {
      //const desc = rec.body_html.replace(/[^a-zA-Z0-9 ]/g, '');
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
  
  return {
    data: options.data,
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}