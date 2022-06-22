// Saved Search Importing: to automate entry of reusable saved searches so you don't have to manually re-enter.

// Video Link of example of how this works: https://drive.google.com/file/d/1PpaSRnb9Pryi-1jOdxbfZVMY3Os9L0t0/view?usp=sharing

// Step one: Get a chrome extension called NetSuite: Search Export: https://chrome.google.com/webstore/detail/netsuite-search-export/gglbgdfbkaelbjpjkiepdmfaihdokglp?hl=en-US

// Step two: Edit the saved search you would like to export, and you'll see the "Export as Script" link 
// in the top-right. Click it and scroll down, and copy the SS2.X script and save it somewhere. You'll 
// need to paste the columns and filters into the next step.

// Step three: Run the below code (replacing as needed) in a browser console after navigating to creating
// a new (transaction type) saved search. Change filters, and columns (paste what you got from saved search
// chrome extension export). Change title and id as desired but id has to start with 'customsearch_' and 
// if whatever you are importing doesn't have a certain field, such as 'fedexshipalert' then the code won't
// work until you add the field or it's added with the right bundle.

// extra note: type can use search.Type.SALES_ORDER or the many other saved search types, OR you can simply
// paste the type string from the extension's export. I only realized this later so updating this with a note. 

require(['N/search'],
  function (search) {
    function createSearch() {
      var mySalesOrderSearch = search.create({
        type: 'purchaseorder',
        title: 'DF7 Celigo | Line Details | Cole Hardware - PO Lookup helper',
        id: 'customsearch_cps_coles_df7_lineid',
        columns: [
          search.createColumn({
            name: "internalid",
            sort: search.Sort.ASC,
            label: "POInternalId"
          }),
          search.createColumn({ name: "custcol_item_number", label: "itemId" }),
          search.createColumn({ name: "line", label: "lineId" }),
          search.createColumn({ name: "quantity", label: "qty" }),
          search.createColumn({
            name: "internalid",
            join: "item",
            label: "nsItemInternalId"
          })
        ],
        filters: [
          ["vendor.internalidnumber", "equalto", "2288"],
          "AND",
          ["mainline", "is", "F"],
          "AND",
          ["type", "anyof", "PurchOrd"]
        ]
      });
      mySalesOrderSearch.save();
    }
    createSearch();
  });