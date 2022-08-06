// v100

function PreMap(options) {
    if (options.data.length > 0) {
        const {aa, arr, Con, Contact, Prospect} = options.data[0];
        if (aa){
         const contact = aa.filter(c => c.ContactType == "Sales" || c.ContactType == "Salesperson"); 
          var test = '';
         if(contact !=''){
             test = contact[0].ContactAddressID;
         }
         var vend = Con.filter(a => a.ConID === test || a.ConID === Prospect);
         
            }
        else{ 
          var vend = Con.filter(a => a.ConID === Prospect);
        }
        const Invalid = arr.filter(b => b.Status == "Inactive");
     // console.log(JSON.stringify(test));
        const objs = [];
        for (let obj of arr) {
            const {Price, Itemname, Description,Externalid,item} = obj;
            if(obj.Externalid == null || obj.Externalid == ""|| obj.item == "" || obj.item == null){ // This catches values that do not have an external id
            objs.push({
                ...obj,
                Price: Number(Math.round(Price + 'e' + 2) + 'e-' + 2),
                Itemname: "noitemname",
                Description: Description.substr(0,2500),
                Externalid: "Nothinghere",
                item: "noitem"
            })
        }
        else{ //this will push regular items with External Id
                objs.push({
                ...obj,
                Price: Number(Math.round(Price + 'e' + 2) + 'e-' + 2),
                Itemname: Itemname.replace(/[^\w\s]/gi, ''),
                Description: Description.substr(0,2500),
                           })
        }
        }
        const res = {
            ...options.data[0],
            arr: objs,
            ContactID: vend.length > 0 ? vend[0].fname.trim().concat(" ", vend[0].lName) : '' //.trim added 1/8/1997 First names had xtra space
        };
       
        const pros = vend.filter(v => v.ConID === Prospect);
        if (pros.length > 0) {
          if (pros[0].ConID === Prospect && pros[0].Prospect) {
            res.Prospect = pros[0].Prospect.trim(); //.trim added 1/8/1997 Prospects names had xtra space
          }  
        }
  
 res.arr =  res.arr.filter(v => v.Status != "Inactive");
  
  
  /*var lines = res.arr;
  for(var i in lines){
    if(lines[i].Status == 'Inactive'){
  // lines[i].Status = "yo"
   lines.splice(i,i);
    }
  }*/
        
        delete res.Con;
        delete res.aa;
        
        return {
            data: [res],
            errors: options.errors
        };
      
        }
        else 
         return {
            data: options.data,
            errors: options.errors
        };
}

const options = {
  "data": [
    {
  "arr": [
    {
      "quantity": 1,
      "item": "WARRANTY",
      "Description": "2 YEAR PARTS AND LABOR WARRANTY STANDARD FOR ALL K-12 APPLICATIONS. ",
      "Price": 0,
      "Externalid": null,
      "Itemname": "WARRANTY",
      "Status": "Active",
      "modelforfield": "WARRANTY",
      "Number": "NOTE"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "Hamburger Line",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "NOTE"
    },
    {
      "quantity": 1,
      "item": "INFFT-5-MOD",
      "Description": "Utility Solid Top, 77-3/4\"W, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified",
      "Price": 4743,
      "Externalid": "d5b468c4-9478-44b7-9a4e-2cc1bf04fdd0",
      "Itemname": "INFFT-5-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-5-MOD",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "TS-5",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 1124,
      "Externalid": "e874a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-5",
      "Status": "Active",
      "modelforfield": "TS-5",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "S-5",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 77-1/2\"L units",
      "Price": 341,
      "Externalid": "2773a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-5",
      "Status": "Active",
      "modelforfield": "S-5",
      "Number": "1"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 862,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "SH-3",
      "Description": "Work Shelf, 8\" wide, stainless steel, for 50\"L units",
      "Price": 569,
      "Externalid": "ac73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SH-3",
      "Status": "Active",
      "modelforfield": "SH-3",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "WIH-3",
      "Description": "Hot Food Drop-In Well Unit, electric, 3-well, individual pan design, wet or dry operation, holds (3) 12\" x 20\" pans, control panel with individual thermostatic controls, stainless steel top & wells, galvanized outer liner, with fiberglass insulation, UL, ETL-Sanitation",
      "Price": 2467,
      "Externalid": "a67aa094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "WIH-3",
      "Status": "Active",
      "modelforfield": "WIH-3",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: Drains are optional",
      "Price": 0,
      "Externalid": "a6910b7a-eac2-e011-93f8-001018721196",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "DM-3",
      "Description": "Individual Drain, for each well with manifold to single valve, for drop-in units",
      "Price": 432,
      "Externalid": "45e6f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "DM-3",
      "Status": "Active",
      "modelforfield": "DM-3",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "AF",
      "Description": "Automatic Water Fill",
      "Price": 1689,
      "Externalid": "f3daf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "AF",
      "Status": "Active",
      "modelforfield": "AF",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: DM-3 must be added when AF is selected",
      "Price": 0,
      "Externalid": "0f7ca094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: A water filtration system is highly recommended when using the automatic water fill.",
      "Price": 0,
      "Externalid": "c4c16925-a213-4a45-aeb4-71909af9e424",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "MS",
      "Description": "Master On/Off Switch",
      "Price": 249,
      "Externalid": "a1eef191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "MS",
      "Status": "Active",
      "modelforfield": "MS",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "AMC-3",
      "Description": "Apron Mounted Controls, for 50\"L units",
      "Price": 541,
      "Externalid": "02dbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "AMC-3",
      "Status": "Active",
      "modelforfield": "AMC-3",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "CSG-3A",
      "Description": "Custom Sneeze Guard, 49-7/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, stainless steel mounting brackets, UL EPH CLASSIFIED",
      "Price": 2721,
      "Externalid": "48e3f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-3A",
      "Status": "Active",
      "modelforfield": "CSG-3A",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "CSG-3FL",
      "Description": "LED Light, for 49-1/2\"L sneeze guard",
      "Price": 862,
      "Externalid": "24e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-3FL",
      "Status": "Active",
      "modelforfield": "CSG-3FL",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "CSG-3ASG",
      "Description": "Adjustable Front Sneeze Guard, 49-1/2\"L",
      "Price": 579,
      "Externalid": "11dbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-3ASG",
      "Status": "Active",
      "modelforfield": "CSG-3ASG",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "USM-5",
      "Description": "Undershelves, stainless steel, middle (BL-units)",
      "Price": 594,
      "Externalid": "dedf95da-85e7-44d7-99da-3c503628047d",
      "Itemname": "USM-5",
      "Status": "Active",
      "modelforfield": "USM-5",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "BSR-5",
      "Description": "Rear Skirt ",
      "Price": 215,
      "Externalid": "33e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-5",
      "Status": "Active",
      "modelforfield": "BSR-5",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "JBH",
      "Description": "Junction box for hot unit, 4\" x 4\", 120/240 volt",
      "Price": 648,
      "Externalid": "2ceaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "JBH",
      "Status": "Active",
      "modelforfield": "JBH",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "FH",
      "Description": "Ferruled hole in END PANEL, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "SPECIAL",
      "Description": "5\" HIGH BACKSPLASH FOR END OF COUNTER",
      "Price": 485,
      "Externalid": null,
      "Itemname": "SPECIAL",
      "Status": "Active",
      "modelforfield": "SPECIAL",
      "Number": "1"
    },
    {
      "quantity": 1,
      "item": "INFRM-2",
      "Description": "Refrigerated Cold Food Unit, 36-1/2\"W, open cabinet base with 3\" recessed top, self-contained refrigeration, (2) 12\" x 20\"pan capacity, 16/304 stainless steel top, stainless steel frame with laminate panels, NO undershelf, 5\" casters (2 with brakes), UL EPH Classified",
      "Price": 7624,
      "Externalid": "f4e7a198-77aa-403e-9bc5-7287ff2eb366",
      "Itemname": "INFRM-2",
      "Status": "Active",
      "modelforfield": "INFRM-2",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1 year parts & labor warranty standard",
      "Price": 0,
      "Externalid": "45aba175-5e6c-4c89-8a1c-2bbfed1556b7",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "5-year compressor warranty (net)",
      "Price": 152,
      "Externalid": "402dcd0c-1054-485e-89c8-7111f77ec641",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "120v/60/1-ph, 1/4 HP, 4.2 amps, NEMA 5-15P, standard",
      "Price": 0,
      "Externalid": "ec65730a-6cde-4bad-976a-fbe95548a73a",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "RS",
      "Description": "Remote On/Off Switch, for counter mounting",
      "Price": 171,
      "Externalid": "df72a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RS",
      "Status": "Active",
      "modelforfield": "RS",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "TS-2",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 915,
      "Externalid": "d974a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-2",
      "Status": "Active",
      "modelforfield": "TS-2",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "S-2",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 36-1/4\"L units",
      "Price": 298,
      "Externalid": "1e73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-2",
      "Status": "Active",
      "modelforfield": "S-2",
      "Number": "2"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 404,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "CSG-2A",
      "Description": "Custom Sneeze Guard, 36-1/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, stainless steel mounting brackets, UL EPH CLASSIFIED",
      "Price": 2585,
      "Externalid": "02e3f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2A",
      "Status": "Active",
      "modelforfield": "CSG-2A",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "CSG-2FL",
      "Description": "LED Light, for 35-3/4\"L sneeze guard",
      "Price": 804,
      "Externalid": "21e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2FL",
      "Status": "Active",
      "modelforfield": "CSG-2FL",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "CSG-2ASG",
      "Description": "Adjustable Front Sneeze Guard, 35-3/4\"L",
      "Price": 568,
      "Externalid": "0edbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2ASG",
      "Status": "Active",
      "modelforfield": "CSG-2ASG",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "BSR-2",
      "Description": "Rear Skirt ",
      "Price": 143,
      "Externalid": "2ae0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-2",
      "Status": "Active",
      "modelforfield": "BSR-2",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "2"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in END PANEL, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "2"
    },
    {
      "quantity": 1,
      "item": "INFFT-4-MOD",
      "Description": "Utility Solid Top, 64\"W, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 36-7/8\" WIDE",
      "Price": 5296,
      "Externalid": "a866ccb4-5b6c-4a38-bb7a-70dad7d0d44d",
      "Itemname": "INFFT-4-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-4-MOD",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "TS-4",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 1032,
      "Externalid": "e274a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-4",
      "Status": "Active",
      "modelforfield": "TS-4",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 709,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "3"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in top, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "LABOR",
      "Description": "Labor to install special units: TURBO AIR DROP IN MODEL #TOM-48L-UF-S-3SI-N \"SUPPLIED BY OTHERS\"",
      "Price": 406,
      "Externalid": "2feaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "LABOR",
      "Status": "Active",
      "modelforfield": "LABOR",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "TOM-48L-UF-S-3SI-N",
      "Description": "Drop-In Horizontal Open Display Case, low profile, 15.2 cu. ft. capacity, 47-7/8\"W x 33\"D x 52-1/2\"H, self-contained refrigeration with self-cleaning condenser, (2) glass shelves + deck, tempered glass front shield & side walls, solar digital thermometer, digital electronic thermostat with defrost control, LED interior lighting, stainless steel interior, back wall & deck pan, specify exterior color, front air intake & rear air discharge, includes night cover, R290 Hydrocarbon refrigerant, (2) 3/4 HP, 115v/60/1-v/60/1-ph, 13.6 amp, cord with NEMA 5-20P, CSA Sanitation, cCSAus",
      "Price": 11404,
      "Externalid": "93c44f5b-5696-4b51-83d3-949fb82b108d",
      "Itemname": "TOM-48L-UF-S-3SI-N",
      "Status": "Active",
      "modelforfield": "TOM-48L-UF-S-3SI-N",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Note: Contact factory representative for parts & accessories discounts",
      "Price": 0,
      "Externalid": "0373af47-5d0f-4adc-8a84-24ff867cda22",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "2 year parts & labor warranty, standard",
      "Price": 0,
      "Externalid": "e20ed3d4-a9d2-4c0e-84ef-7e4022b19ac0",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Additional 3 year compressor warranty (5 year total), standard",
      "Price": 0,
      "Externalid": "5e11589f-7756-4656-9356-9e42d3c89e52",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Self-cleaning condenser device equipped, standard",
      "Price": 0,
      "Externalid": "b9c79357-435d-4be8-959c-b45b3ef36cea",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Must specify exterior finish - STAINLESS STEEL",
      "Price": 0,
      "Externalid": "c9207f24-57cf-46f9-89e9-c7ef1e6b699f",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "JBC",
      "Description": "Junction box for cold unit, 4\" x 4\", 120 volt",
      "Price": 390,
      "Externalid": "29eaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "JBC",
      "Status": "Active",
      "modelforfield": "JBC",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "S-4",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 63-3/4\"L units",
      "Price": 320,
      "Externalid": "2473a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-4",
      "Status": "Active",
      "modelforfield": "S-4",
      "Number": "3"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "BSR-4",
      "Description": "Rear Skirt ",
      "Price": 178,
      "Externalid": "30e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-4",
      "Status": "Active",
      "modelforfield": "BSR-4",
      "Number": "3"
    },
    {
      "quantity": 1,
      "item": "INFFT-3-MOD",
      "Description": "Utility Solid Top, , open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 42-3/4\" LONG",
      "Price": 4969,
      "Externalid": "cd9c1dbe-a573-473f-9f89-16facfed4be1",
      "Itemname": "INFFT-3-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-3-MOD",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "TS-3-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 42-3/4\" LONG",
      "Price": 1211,
      "Externalid": "dc74a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-3-MOD",
      "Status": "Active",
      "modelforfield": "TS-3-MOD",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "S-3-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 42-3/4\" LONG",
      "Price": 378,
      "Externalid": "2173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-3-MOD",
      "Status": "Active",
      "modelforfield": "S-3-MOD",
      "Number": "4"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 495,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "FH",
      "Description": "Ferruled hole in top, 3\" dia.",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "CD",
      "Description": "Cash Drawer, stainless steel, locking",
      "Price": 715,
      "Externalid": "93e2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CD",
      "Status": "Active",
      "modelforfield": "CD",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "CO-DUP",
      "Description": "Duplex receptacle (specify apron mount or base mount)",
      "Price": 267,
      "Externalid": "9ce2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CO-DUP",
      "Status": "Active",
      "modelforfield": "CO-DUP",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "ERS",
      "Description": "Electrical Raceway System",
      "Price": 2122,
      "Externalid": "efe8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "ERS",
      "Status": "Active",
      "modelforfield": "ERS",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "PP",
      "Description": "POWER POLE, 2\" X 2\", 10 FEET MAXIMUM HEIGHT",
      "Price": 483,
      "Externalid": null,
      "Itemname": "PP",
      "Status": "Active",
      "modelforfield": "PP",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "LC",
      "Description": "LOAD CENTER",
      "Price": 1783,
      "Externalid": null,
      "Itemname": "LC",
      "Status": "Active",
      "modelforfield": "LC",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "BSR-3",
      "Description": "Rear Skirt, MODIFIED: 42-3/4\" LONG",
      "Price": 201,
      "Externalid": "2de0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-3",
      "Status": "Active",
      "modelforfield": "BSR-3",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "FH",
      "Description": "Ferruled hole in END PANEL, 3\" dia.",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "4"
    },
    {
      "quantity": 1,
      "item": "RP-1-MOD",
      "Description": "Fixed Rear Panel, MODIFIED: 22\" LONG",
      "Price": 347,
      "Externalid": "8872a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RP-1-MOD",
      "Status": "Active",
      "modelforfield": "RP-1-MOD",
      "Number": "4"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IT IS HIGHLY RECOMMENDED THAT YOU USE A FORK LIFT TO REMOVE TEH INFINITI FIT UNITS FROM CRATE BASES TO ENSURE NO DAMAGE IS DONE TO THE LAMINATE\r\n",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IF YOU DO NOT HAVE ACCESS TO A FORK LIFT, WE RECOMMEND YOU ORDER A SET OF RAMPS AT COST TO REMOVE CARTS FROM PALLETS.",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 1,
      "item": "RAMPS",
      "Description": "RAMPS TO REMOVE UNITS FROM CRATE BASES",
      "Price": 104,
      "Externalid": null,
      "Itemname": "RAMPS",
      "Status": "Active",
      "modelforfield": "RAMPS",
      "Number": "5"
    },
    {
      "quantity": 1,
      "item": "EDUS",
      "Description": "Equipment Delivery, Uncrate and Set in Place\r\n\r\nMRS will deliver, uncrate, and set the quoted equipment. \r\nCold equipment will be assembled, set, and started if correct power is available. \r\nHot equipment will be assembled and set in place only. \r\n\r\nAll gas and electrical final connections BY OTHERS. \r\n\r\nAny existing equipment will need to be removed PRIOR to our delivery.\r\n",
      "Price": 1365,
      "Externalid": "f620e54c-0964-4a4f-87a0-45687c0a0c80",
      "Itemname": "EDUS",
      "Status": "Active",
      "modelforfield": "EDUS",
      "Number": "6"
    },
    {
      "quantity": 1,
      "item": "EERR",
      "Description": "Existing Equipment Removal\r\n\r\nMRS will disconnect, remove, haul away, and properly dispose of existing equipment.",
      "Price": 1050,
      "Externalid": "8d712132-d8b6-421e-8cb0-384993083d73",
      "Itemname": "EERR",
      "Status": "Active",
      "modelforfield": "EERR",
      "Number": "7"
    },
    {
      "quantity": 1,
      "item": "INSTALLATION",
      "Description": "Keller HS - Hamburger Line - Integrus Fabrication Installation Connections\r\nElectrical: Hardwire 1 load center\r\ninto schools existing power supply.\r\nPower supply within 5 feet of load\r\ncenter\r\nWater Inlet connection: Connect 1\r\nauto-fill water connection to water\r\nsupply. Water supply within 7 feet\r\nof water inlet\r\nDrain connection: Connect 1 drain\r\n(7ft max) for hot well and 1 drain\r\n(7ft max) for cold well",
      "Price": 2080,
      "Externalid": null,
      "Itemname": "INSTALLATION",
      "Status": "Active",
      "modelforfield": "INSTALLATION",
      "Number": "8"
    },
    {
      "quantity": 1,
      "item": "WARRANTY",
      "Description": "2 YEAR PARTS AND LABOR WARRANTY STANDARD FOR ALL K-12 APPLICATIONS. ",
      "Price": 0,
      "Externalid": null,
      "Itemname": "WARRANTY",
      "Status": "Active",
      "modelforfield": "WARRANTY",
      "Number": "NOTE"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "Adventure Line",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "NOTE"
    },
    {
      "quantity": 1,
      "item": "INFCS",
      "Description": "Cashier Station, mobile, 16/304 stainless steel top, stainless steel cash drawer with key lock, stainless steel frame with laminate panels, 4\" swivel casters (2 with brakes), UL, UL EPH-Classified",
      "Price": 4187,
      "Externalid": "7fb08f01-f337-4d4a-b9ab-8263b0387613",
      "Itemname": "INFCS",
      "Status": "Active",
      "modelforfield": "INFCS",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1 year parts & labor warranty standard",
      "Price": 0,
      "Externalid": "45aba175-5e6c-4c89-8a1c-2bbfed1556b7",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "TS-1",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 583,
      "Externalid": "d674a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-1",
      "Status": "Active",
      "modelforfield": "TS-1",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "S-1",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 24\"L units",
      "Price": 257,
      "Externalid": "1b73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-1",
      "Status": "Active",
      "modelforfield": "S-1",
      "Number": "9"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 269,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "9"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole (1) in top & (1) IN END PANEL, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "CO-DUP",
      "Description": "Duplex receptacle (specify apron mount or base mount)",
      "Price": 267,
      "Externalid": "9ce2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CO-DUP",
      "Status": "Active",
      "modelforfield": "CO-DUP",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "ERS",
      "Description": "Electrical Raceway System",
      "Price": 2122,
      "Externalid": "efe8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "ERS",
      "Status": "Active",
      "modelforfield": "ERS",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "PP",
      "Description": "POWER POLE, 2\" X 2\", 10 FEET MAXIMUM HEIGHT",
      "Price": 483,
      "Externalid": null,
      "Itemname": "PP",
      "Status": "Active",
      "modelforfield": "PP",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "LC",
      "Description": "LOAD CENTER",
      "Price": 1783,
      "Externalid": null,
      "Itemname": "LC",
      "Status": "Active",
      "modelforfield": "LC",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "BSE",
      "Description": "End Skirt  ",
      "Price": 142,
      "Externalid": "12e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSE",
      "Status": "Active",
      "modelforfield": "BSE",
      "Number": "9"
    },
    {
      "quantity": 1,
      "item": "INFFT-4-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 36-7/8\" WIDE",
      "Price": 5296,
      "Externalid": "a866ccb4-5b6c-4a38-bb7a-70dad7d0d44d",
      "Itemname": "INFFT-4-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-4-MOD",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "TS-4",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 1032,
      "Externalid": "e274a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-4",
      "Status": "Active",
      "modelforfield": "TS-4",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 709,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "LABOR",
      "Description": "Labor to install special units: TURBO AIR DROP IN MODEL #TOM-48L-UF-S-3SI-N \"SUPPLIED BY OTHERS\"",
      "Price": 406,
      "Externalid": "2feaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "LABOR",
      "Status": "Active",
      "modelforfield": "LABOR",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "TOM-48L-UF-S-3SI-N",
      "Description": "Drop-In Horizontal Open Display Case, low profile, 15.2 cu. ft. capacity, 47-7/8\"W x 33\"D x 52-1/2\"H, self-contained refrigeration with self-cleaning condenser, (2) glass shelves + deck, tempered glass front shield & side walls, solar digital thermometer, digital electronic thermostat with defrost control, LED interior lighting, stainless steel interior, back wall & deck pan, specify exterior color, front air intake & rear air discharge, includes night cover, R290 Hydrocarbon refrigerant, (2) 3/4 HP, 115v/60/1-v/60/1-ph, 13.6 amp, cord with NEMA 5-20P, CSA Sanitation, cCSAus",
      "Price": 11513,
      "Externalid": "93c44f5b-5696-4b51-83d3-949fb82b108d",
      "Itemname": "TOM-48L-UF-S-3SI-N",
      "Status": "Active",
      "modelforfield": "TOM-48L-UF-S-3SI-N",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Note: Contact factory representative for parts & accessories discounts",
      "Price": 0,
      "Externalid": "0373af47-5d0f-4adc-8a84-24ff867cda22",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "2 year parts & labor warranty, standard",
      "Price": 0,
      "Externalid": "e20ed3d4-a9d2-4c0e-84ef-7e4022b19ac0",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Additional 3 year compressor warranty (5 year total), standard",
      "Price": 0,
      "Externalid": "5e11589f-7756-4656-9356-9e42d3c89e52",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Self-cleaning condenser device equipped, standard",
      "Price": 0,
      "Externalid": "b9c79357-435d-4be8-959c-b45b3ef36cea",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Must specify exterior finish - STAINLESS STEEL",
      "Price": 0,
      "Externalid": "c9207f24-57cf-46f9-89e9-c7ef1e6b699f",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "10"
    },
    {
      "quantity": 2,
      "item": "CO",
      "Description": "Convenience Outlet, 120v/60/1-ph, 15 amps, (specify apron mount or base mount)",
      "Price": 236,
      "Externalid": "99e2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CO",
      "Status": "Active",
      "modelforfield": "CO",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "S-4",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 63-3/4\"L units",
      "Price": 320,
      "Externalid": "2473a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-4",
      "Status": "Active",
      "modelforfield": "S-4",
      "Number": "10"
    },
    {
      "quantity": 2,
      "item": "EPS-MOD",
      "Description": "End Panel, stainless steel, MODIFIED: 36-7/8\" WIDE",
      "Price": 356,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS-MOD",
      "Status": "Active",
      "modelforfield": "EPS-MOD",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "BSR-4",
      "Description": "Rear Skirt (CW & CA units only)",
      "Price": 178,
      "Externalid": "30e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-4",
      "Status": "Active",
      "modelforfield": "BSR-4",
      "Number": "10"
    },
    {
      "quantity": 1,
      "item": "INFFT-4-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 59-3/4\" LONG",
      "Price": 5296,
      "Externalid": "a866ccb4-5b6c-4a38-bb7a-70dad7d0d44d",
      "Itemname": "INFFT-4-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-4-MOD",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "TS-4-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 59-3/4\" LONG",
      "Price": 1290,
      "Externalid": "e274a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-4-MOD",
      "Status": "Active",
      "modelforfield": "TS-4-MOD",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "S-4-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 59-3/4\" LONG",
      "Price": 401,
      "Externalid": "2473a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-4-MOD",
      "Status": "Active",
      "modelforfield": "S-4-MOD",
      "Number": "11"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 662,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "RM-2",
      "Description": "Cold Food Drop-In Unit, 2-pan size, 18/304 stainless steel top & liner with 3\" recess, holds (2) 12\" x 20\" pans, self-contained refrigeration, insulated pan with 22 gauge galvanized outer case, 3/4\" drain with strainer, 30-1/4\"W x 24-1/2\"D cutout required, NSF 7, UL",
      "Price": 3759,
      "Externalid": "e871a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RM-2",
      "Status": "Active",
      "modelforfield": "RM-2",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1 year parts & labor warranty standard",
      "Price": 0,
      "Externalid": "45aba175-5e6c-4c89-8a1c-2bbfed1556b7",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "5-year compressor warranty (net)",
      "Price": 152,
      "Externalid": "402dcd0c-1054-485e-89c8-7111f77ec641",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "A 3/4\" diameter drain & valve, separator channels are provided",
      "Price": 0,
      "Externalid": "65bb10d4-505d-4cef-9fdc-7a25469946ee",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "120v/60/1-ph, 1/4 HP, 4.2 amps, NEMA 5-15P, standard",
      "Price": 0,
      "Externalid": "6d516a2b-3a85-4410-acd7-ce881fc954e2",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "RS",
      "Description": "Remote On/Off Switch, for counter mounting",
      "Price": 171,
      "Externalid": "df72a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RS",
      "Status": "Active",
      "modelforfield": "RS",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "CSG-2A",
      "Description": "Custom Sneeze Guard, 36-1/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, stainless steel mounting brackets, UL EPH CLASSIFIED",
      "Price": 2585,
      "Externalid": "02e3f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2A",
      "Status": "Active",
      "modelforfield": "CSG-2A",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "CSG-2FL",
      "Description": "LED Light, for 35-3/4\"L sneeze guard",
      "Price": 804,
      "Externalid": "21e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2FL",
      "Status": "Active",
      "modelforfield": "CSG-2FL",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "CSG-2ASG",
      "Description": "Adjustable Front Sneeze Guard, 35-3/4\"L",
      "Price": 568,
      "Externalid": "0edbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2ASG",
      "Status": "Active",
      "modelforfield": "CSG-2ASG",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "JBC",
      "Description": "Junction box for cold unit, 4\" x 4\", 120 volt",
      "Price": 390,
      "Externalid": "29eaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "JBC",
      "Status": "Active",
      "modelforfield": "JBC",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "BSR-4-MOD",
      "Description": "Rear Skirt, MODIFIED: 59-3/4\" LONG",
      "Price": 222,
      "Externalid": "30e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-4-MOD",
      "Status": "Active",
      "modelforfield": "BSR-4-MOD",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "11"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in END PANELS, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "11"
    },
    {
      "quantity": 1,
      "item": "INFFT-6-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 88\" LONG",
      "Price": 7044,
      "Externalid": "95af43da-3142-4cf9-a760-fd32a6d836c0",
      "Itemname": "INFFT-6-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-6-MOD",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "TS-6-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 88\" LONG",
      "Price": 1692,
      "Externalid": "ee74a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-6-MOD",
      "Status": "Active",
      "modelforfield": "TS-6-MOD",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "S-6-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 88\" LONG",
      "Price": 449,
      "Externalid": "2a73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-6-MOD",
      "Status": "Active",
      "modelforfield": "S-6-MOD",
      "Number": "12"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 976,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "WIH-4",
      "Description": "Hot Food Drop-In Well Unit, electric, 4-well, individual pan design, wet or dry operation, holds (4) 12\" x 20\" pans, control panel with individual thermostatic controls, stainless steel top & wells, galvanized outer liner, with fiberglass insulation, UL, ETL-Sanitation",
      "Price": 3107,
      "Externalid": "b87aa094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "WIH-4",
      "Status": "Active",
      "modelforfield": "WIH-4",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: Drains are optional",
      "Price": 0,
      "Externalid": "a6910b7a-eac2-e011-93f8-001018721196",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "208v/60/1-ph, 3.4 kW, 16.4 amps, NEMA L6-30P, 850 watt elements",
      "Price": 0,
      "Externalid": "e72f1f62-8e24-de11-9c95-001ec95274b6",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "DM-4",
      "Description": "Individual Drain, for each well with manifold to single valve, for drop-in units",
      "Price": 569,
      "Externalid": "48e6f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "DM-4",
      "Status": "Active",
      "modelforfield": "DM-4",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "AF",
      "Description": "Automatic Water Fill",
      "Price": 1689,
      "Externalid": "f3daf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "AF",
      "Status": "Active",
      "modelforfield": "AF",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: DM-4 must be added when AF is selected",
      "Price": 0,
      "Externalid": "127ca094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: A water filtration system is highly recommended when using the automatic water fill.",
      "Price": 0,
      "Externalid": "c4c16925-a213-4a45-aeb4-71909af9e424",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "MS",
      "Description": "Master On/Off Switch",
      "Price": 249,
      "Externalid": "a1eef191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "MS",
      "Status": "Active",
      "modelforfield": "MS",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "AMC-4",
      "Description": "Apron Mounted Controls, for 63-3/4\"L units",
      "Price": 609,
      "Externalid": "05dbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "AMC-4",
      "Status": "Active",
      "modelforfield": "AMC-4",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "CSG-4A",
      "Description": "Custom Sneeze Guard, 63-5/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, stainless steel mounting brackets, UL EPH CLASSIFIED",
      "Price": 3353,
      "Externalid": "d5e3f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-4A",
      "Status": "Active",
      "modelforfield": "CSG-4A",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "CSG-4FWL",
      "Description": "Food Warmer, with light, for CSG series 63-1/4\"L sneeze guard",
      "Price": 1368,
      "Externalid": "a5e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-4FWL",
      "Status": "Active",
      "modelforfield": "CSG-4FWL",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "CSG-4ASG",
      "Description": "Adjustable Front Sneeze Guard, 63-1/4\"L",
      "Price": 1129,
      "Externalid": "14dbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-4ASG",
      "Status": "Active",
      "modelforfield": "CSG-4ASG",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "SH-4",
      "Description": "Work Shelf, 8\" wide, stainless steel, for 63-3/4\"L units",
      "Price": 634,
      "Externalid": "b073a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SH-4",
      "Status": "Active",
      "modelforfield": "SH-4",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "USM-2-MOD",
      "Description": "Undershelves, stainless steel, middle, MODIFIED: 24\" LONG",
      "Price": 576,
      "Externalid": "73fd0e88-cd88-49a3-8036-eaf44ef5cab7",
      "Itemname": "USM-2-MOD",
      "Status": "Active",
      "modelforfield": "USM-2-MOD",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "JBH",
      "Description": "Junction box for hot unit, 4\" x 4\", 120/240 volt",
      "Price": 648,
      "Externalid": "2ceaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "JBH",
      "Status": "Active",
      "modelforfield": "JBH",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "BSR-6-MOD",
      "Description": "Rear Skirt, MODIFIED: 88\" LONG",
      "Price": 375,
      "Externalid": "36e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-6-MOD",
      "Status": "Active",
      "modelforfield": "BSR-6-MOD",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "FH",
      "Description": "Ferruled hole in END PANEL, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "12"
    },
    {
      "quantity": 1,
      "item": "SPECIAL",
      "Description": "5\" HIGH BACKSPLASH FOR END OF COUNTER",
      "Price": 485,
      "Externalid": null,
      "Itemname": "SPECIAL",
      "Status": "Active",
      "modelforfield": "SPECIAL",
      "Number": "12"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IT IS HIGHLY RECOMMENDED THAT YOU USE A FORK LIFT TO REMOVE THE INFINITI FIT UNITS FROM CRATE BASES TO ENSURE NO DAMAGE IS DONE TO THE LAMINATE.",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IF YOU DO NOT HAVE ACCESS TO A FORK LIFT, WE RECOMMEND YOU ORDER A SET OF RAMPS AT COST TO REMOVE CARTS FROM PALLETS.",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 1,
      "item": "RAMP",
      "Description": "RAMPS TO REMOVE UNITS FROM CRATE BASES",
      "Price": 104,
      "Externalid": null,
      "Itemname": "RAMP",
      "Status": "Active",
      "modelforfield": "RAMP",
      "Number": "13"
    },
    {
      "quantity": 1,
      "item": "EDUS",
      "Description": "Equipment Delivery, Uncrate and Set in Place\r\n\r\nMRS will deliver, uncrate, and set the quoted equipment. \r\nCold equipment will be assembled, set, and started if correct power is available. \r\nHot equipment will be assembled and set in place only. \r\n\r\nAll gas and electrical final connections BY OTHERS. \r\n\r\nAny existing equipment will need to be removed PRIOR to our delivery.\r\n",
      "Price": 1365,
      "Externalid": "f620e54c-0964-4a4f-87a0-45687c0a0c80",
      "Itemname": "EDUS",
      "Status": "Active",
      "modelforfield": "EDUS",
      "Number": "14"
    },
    {
      "quantity": 1,
      "item": "EERR",
      "Description": "Existing Equipment Removal\r\n\r\nMRS will disconnect, remove, haul away, and properly dispose of existing equipment.",
      "Price": 1050,
      "Externalid": "8d712132-d8b6-421e-8cb0-384993083d73",
      "Itemname": "EERR",
      "Status": "Active",
      "modelforfield": "EERR",
      "Number": "15"
    },
    {
      "quantity": 1,
      "item": "INSTALLATION",
      "Description": "Keller HS - Adventure Line - Integrus Fabrication Installation Connections\r\nElectrical: Hardwire 1 load center\r\ninto schools existing power supply.\r\nPower supply within 5 feet of load\r\ncenter\r\nWater Inlet connection: Connect 1\r\nauto-fill water connection to water\r\nsupply. Water supply within 7 feet\r\nof water inlet\r\nDrain connection: Connect 1 drain\r\n(7ft max) for hot well and 1 drain\r\n(7ft max) for cold well",
      "Price": 2080,
      "Externalid": null,
      "Itemname": "INSTALLATION",
      "Status": "Active",
      "modelforfield": "INSTALLATION",
      "Number": "16"
    },
    {
      "quantity": 1,
      "item": "WARRANTY",
      "Description": "2 YEAR PARTS AND LABOR WARRANTY STANDARD FOR ALL K-12 APPLICATIONS. ",
      "Price": 0,
      "Externalid": null,
      "Itemname": "WARRANTY",
      "Status": "Active",
      "modelforfield": "WARRANTY",
      "Number": "NOTE"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "Pizza Line",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "NOTE"
    },
    {
      "quantity": 1,
      "item": "INFFT-4-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 54\" LONG",
      "Price": 5296,
      "Externalid": "a866ccb4-5b6c-4a38-bb7a-70dad7d0d44d",
      "Itemname": "INFFT-4-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-4-MOD",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "TS-4-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 54\" LONG",
      "Price": 1290,
      "Externalid": "e274a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-4-MOD",
      "Status": "Active",
      "modelforfield": "TS-4-MOD",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "S-4-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 54\" LONG",
      "Price": 386,
      "Externalid": "2473a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-4-MOD",
      "Status": "Active",
      "modelforfield": "S-4-MOD",
      "Number": "17"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 597,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "17"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in top, 3\" dia.",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "CD",
      "Description": "Cash Drawer, stainless steel, locking",
      "Price": 715,
      "Externalid": "93e2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CD",
      "Status": "Active",
      "modelforfield": "CD",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "CO-DUP",
      "Description": "Duplex receptacle (specify apron mount or base mount)",
      "Price": 267,
      "Externalid": "9ce2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CO-DUP",
      "Status": "Active",
      "modelforfield": "CO-DUP",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "ERS",
      "Description": "Electrical Raceway System",
      "Price": 2122,
      "Externalid": "efe8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "ERS",
      "Status": "Active",
      "modelforfield": "ERS",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "BSR-4-MOD",
      "Description": "Rear Skirt, MODIFIED: 54\" LONG",
      "Price": 222,
      "Externalid": "30e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-4-MOD",
      "Status": "Active",
      "modelforfield": "BSR-4-MOD",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "BSE",
      "Description": "End Skirt  ",
      "Price": 142,
      "Externalid": "12e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSE",
      "Status": "Active",
      "modelforfield": "BSE",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "LC",
      "Description": "LOAD CENTER",
      "Price": 1783,
      "Externalid": null,
      "Itemname": "LC",
      "Status": "Active",
      "modelforfield": "LC",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "RP-1",
      "Description": "Fixed Rear Panel, for 24\"L units",
      "Price": 277,
      "Externalid": "8872a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RP-1",
      "Status": "Active",
      "modelforfield": "RP-1",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "PP",
      "Description": "POWER POLE, 2\" X 2\", 10 FEET MAXIMUM HEIGHT",
      "Price": 483,
      "Externalid": null,
      "Itemname": "PP",
      "Status": "Active",
      "modelforfield": "PP",
      "Number": "17"
    },
    {
      "quantity": 1,
      "item": "INFFT-4-MOD",
      "Description": "Utility Solid Top, 64\"W, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 36-7/8\" WIDE",
      "Price": 5296,
      "Externalid": "a866ccb4-5b6c-4a38-bb7a-70dad7d0d44d",
      "Itemname": "INFFT-4-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-4-MOD",
      "Number": "18"
    },
    {
      "quantity": 1,
      "item": "TS-4",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 1032,
      "Externalid": "e274a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-4",
      "Status": "Active",
      "modelforfield": "TS-4",
      "Number": "18"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 709,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "18"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in top, 3\" dia.",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "18"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "18"
    },
    {
      "quantity": 1,
      "item": "LABOR",
      "Description": "Labor to install special units: TURBO AIR DROP IN MODEL #TOM-48L-UF-S-3SI-N \"SUPPLIED BY OTHERS\"",
      "Price": 406,
      "Externalid": "2feaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "LABOR",
      "Status": "Active",
      "modelforfield": "LABOR",
      "Number": "18"
    },
    {
      "quantity": 1,
      "item": "JBC",
      "Description": "Junction box for cold unit, 4\" x 4\", 120 volt",
      "Price": 390,
      "Externalid": "29eaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "JBC",
      "Status": "Active",
      "modelforfield": "JBC",
      "Number": "18"
    },
    {
      "quantity": 1,
      "item": "S-4",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 63-3/4\"L units",
      "Price": 320,
      "Externalid": "2473a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-4",
      "Status": "Active",
      "modelforfield": "S-4",
      "Number": "18"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "18"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "18"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "18"
    },
    {
      "quantity": 1,
      "item": "BSR-4",
      "Description": "Rear Skirt (CW & CA units only)",
      "Price": 178,
      "Externalid": "30e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-4",
      "Status": "Active",
      "modelforfield": "BSR-4",
      "Number": "18"
    },
    {
      "quantity": 1,
      "item": "INFFT-6-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 103\" LONG",
      "Price": 7044,
      "Externalid": "95af43da-3142-4cf9-a760-fd32a6d836c0",
      "Itemname": "INFFT-6-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-6-MOD",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "TS-6-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 103\" LONG",
      "Price": 1692,
      "Externalid": "ee74a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-6-MOD",
      "Status": "Active",
      "modelforfield": "TS-6-MOD",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "S-6-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 103\" LONG",
      "Price": 449,
      "Externalid": "2a73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-6-MOD",
      "Status": "Active",
      "modelforfield": "S-6-MOD",
      "Number": "19"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 1142,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "19"
    },
    {
      "quantity": 3,
      "item": "SC",
      "Description": "Square Cutout (2) In Top & (1) IN APRON",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "RM-1",
      "Description": "Cold Food Drop-In Unit, 1-pan size, 18/304 stainless steel top & liner with 3\" recess, holds (1) 12\" x 20\" pan, self-contained refrigeration, insulated pan with 22 gauge galvanized outer case, 3/4\" drain with strainer, 16-1/2\"W x 24-1/2\"D cutout required, NSF 7, UL",
      "Price": 3065,
      "Externalid": "e171a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RM-1",
      "Status": "Active",
      "modelforfield": "RM-1",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1 year parts & labor warranty standard",
      "Price": 0,
      "Externalid": "45aba175-5e6c-4c89-8a1c-2bbfed1556b7",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "5-year compressor warranty (net)",
      "Price": 152,
      "Externalid": "402dcd0c-1054-485e-89c8-7111f77ec641",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "A 3/4\" diameter drain & valve, separator channels are provided",
      "Price": 0,
      "Externalid": "65bb10d4-505d-4cef-9fdc-7a25469946ee",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "120v/60/1-ph, 1/5 HP, 4.2 amps, NEMA 5-15P, standard",
      "Price": 0,
      "Externalid": "b04c67d4-d3bb-450b-b23a-8c8b088f6d2a",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "RS",
      "Description": "Remote On/Off Switch, for counter mounting",
      "Price": 171,
      "Externalid": "df72a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RS",
      "Status": "Active",
      "modelforfield": "RS",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "CSG-1A",
      "Description": "Custom Sneeze Guard, 23-7/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, stainless steel mounting brackets, UL EPH CLASSIFIED (contact factory for pricing)",
      "Price": 2585,
      "Externalid": "95817930-3d5b-4abb-a7cb-c0fd19625d6c",
      "Itemname": "CSG-1A",
      "Status": "Active",
      "modelforfield": "CSG-1A",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "CSG-1FL",
      "Description": "LED Light, for 23-7/8\"L sneeze guard",
      "Price": 804,
      "Externalid": "21e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-1FL",
      "Status": "Active",
      "modelforfield": "CSG-1FL",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "CSG-1ASG",
      "Description": "Adjustable Front Sneeze Guard, 23-7/8\"L",
      "Price": 568,
      "Externalid": "0edbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-1ASG",
      "Status": "Active",
      "modelforfield": "CSG-1ASG",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "GRSBF-72-I",
      "Description": "Glo-Ray® Built In Heated Shelf with Flush Top, 73-1/2\" x 21\" surface area, hardcoat aluminum top, control thermostat, illuminated on/off switch & mounting bracket, 1440 watts, NSF, CE, cUL, UL, UL EPH Classified, CSA",
      "Price": 1695,
      "Externalid": null,
      "Itemname": "GRSBF-72-I",
      "Status": "Active",
      "modelforfield": "GRSBF-72-I",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: Sale of this product must comply with Hatco's Minimum Resale Price Policy; consult order acknowledgement for details",
      "Price": 0,
      "Externalid": "e33b6595-d55e-4204-a66b-00aa274536fa",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: Includes 24/7 parts & service assistance, call 800-558-0607",
      "Price": 0,
      "Externalid": "08535e81-f1ce-4b0e-a569-83580838dbd6",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1-Yr Warranty on Blanket Heating Elements against burnout, standard",
      "Price": 0,
      "Externalid": "5ef83a36-c671-433c-83d5-24a80f2dd62f",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "120v/60/1-ph, 1440 watts, 12.0 amps, NEMA 5-15P (domestic voltage), standard",
      "Price": 0,
      "Externalid": "f9a8ddc3-da31-4703-a526-02f503a88006",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: Recommended for use in metallic countertop, verify that the material is suitable for temperatures up to 200 degree F",
      "Price": 0,
      "Externalid": "922dee2f-9cdf-4d2a-9021-93201da02a42",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "GRSB-FLUSH-ITC",
      "Description": "Flush mount electronic control box with lighted power switch, stainless steel (available at time of purchase only)",
      "Price": 123,
      "Externalid": null,
      "Itemname": "GRSB-FLUSH-ITC",
      "Status": "Active",
      "modelforfield": "GRSB-FLUSH-ITC",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "STANDARD",
      "Description": "Stainless Steel Finish, flush mounted bezel, standard (available at time of purchase only)",
      "Price": 0,
      "Externalid": null,
      "Itemname": "STANDARD",
      "Status": "Active",
      "modelforfield": "STANDARD",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "LABOR",
      "Description": "Labor to install special units: sink, griddle, broiler, fryer, etc.",
      "Price": 406,
      "Externalid": "2feaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "LABOR",
      "Status": "Active",
      "modelforfield": "LABOR",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "CSG-6A-MOD",
      "Description": "Custom Sneeze Guard, 90-1/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, center support, stainless steel mounting brackets, UL EPH CLASSIFIED",
      "Price": 5213,
      "Externalid": "ede4f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-6A-MOD",
      "Status": "Active",
      "modelforfield": "CSG-6A-MOD",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "CSG-5FWL",
      "Description": "Food Warmer, with light, for CSG series 77\"L sneeze guard",
      "Price": 1964,
      "Externalid": "abe9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-5FWL",
      "Status": "Active",
      "modelforfield": "CSG-5FWL",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "CSG-6ASG-MOD",
      "Description": "Adjustable Front Sneeze Guard, 90-3/4\"L",
      "Price": 1642,
      "Externalid": "20dbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-6ASG-MOD",
      "Status": "Active",
      "modelforfield": "CSG-6ASG-MOD",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "USM-5",
      "Description": "Undershelves, stainless steel, middle (BL-units)",
      "Price": 594,
      "Externalid": "dedf95da-85e7-44d7-99da-3c503628047d",
      "Itemname": "USM-5",
      "Status": "Active",
      "modelforfield": "USM-5",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "BSR-6",
      "Description": "Rear Skirt ",
      "Price": 301,
      "Externalid": "36e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-6",
      "Status": "Active",
      "modelforfield": "BSR-6",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "FH",
      "Description": "Ferruled hole in top, 3\" dia.",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "19"
    },
    {
      "quantity": 1,
      "item": "SPECIAL",
      "Description": "5\" HIGH BACKSPLASH FOR END OF COUNTER",
      "Price": 485,
      "Externalid": null,
      "Itemname": "SPECIAL",
      "Status": "Active",
      "modelforfield": "SPECIAL",
      "Number": "19"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IT IS HIGHLY RECOMMENDED THAT YOU USE A FORK LIFT TO REMOVE TEH INFINITI FIT UNITS FROM CRATE BASES TO ENSURE NO DAMAGE IS DONE TO THE LAMINATE\r\n",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IF YOU DO NOT HAVE ACCESS TO A FORK LIFT, WE RECOMMEND YOU ORDER A SET OF RAMPS AT COST TO REMOVE CARTS FROM PALLETS.",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 1,
      "item": "RAMPS",
      "Description": "RAMPS TO REMOVE UNITS FROM CRATE BASES",
      "Price": 104,
      "Externalid": null,
      "Itemname": "RAMPS",
      "Status": "Active",
      "modelforfield": "RAMPS",
      "Number": "20"
    },
    {
      "quantity": 1,
      "item": "EDUS",
      "Description": "Equipment Delivery, Uncrate and Set in Place\r\n\r\nMRS will deliver, uncrate, and set the quoted equipment. \r\nCold equipment will be assembled, set, and started if correct power is available. \r\nHot equipment will be assembled and set in place only. \r\n\r\nAll gas and electrical final connections BY OTHERS. \r\n\r\nAny existing equipment will need to be removed PRIOR to our delivery.\r\n",
      "Price": 1365,
      "Externalid": "f620e54c-0964-4a4f-87a0-45687c0a0c80",
      "Itemname": "EDUS",
      "Status": "Active",
      "modelforfield": "EDUS",
      "Number": "21"
    },
    {
      "quantity": 1,
      "item": "EERR",
      "Description": "Existing Equipment Removal\r\n\r\nMRS will disconnect, remove, haul away, and properly dispose of existing equipment.",
      "Price": 1050,
      "Externalid": "8d712132-d8b6-421e-8cb0-384993083d73",
      "Itemname": "EERR",
      "Status": "Active",
      "modelforfield": "EERR",
      "Number": "22"
    },
    {
      "quantity": 1,
      "item": "INSTALLATION",
      "Description": "Keller HS - Pizza  Line - Integrus Fabrication Installation Connections\r\nElectrical: Hardwire 1 load center\r\ninto schools existing power supply.\r\nPower supply within 5 feet of load\r\ncenter\r\nDrain connection: Connect 1 drain\r\n(7ft max) for cold well",
      "Price": 1612,
      "Externalid": null,
      "Itemname": "INSTALLATION",
      "Status": "Active",
      "modelforfield": "INSTALLATION",
      "Number": "23"
    },
    {
      "quantity": 1,
      "item": "WARRANTY",
      "Description": "2 YEAR PARTS AND LABOR WARRANTY STANDARD FOR ALL K-12 APPLICATIONS. ",
      "Price": 0,
      "Externalid": null,
      "Itemname": "WARRANTY",
      "Status": "Active",
      "modelforfield": "WARRANTY",
      "Number": "NOTE"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "Fast Takes Line",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "NOTE"
    },
    {
      "quantity": 1,
      "item": "INFCS",
      "Description": "Cashier Station, mobile, 16/304 stainless steel top, stainless steel cash drawer with key lock, stainless steel frame with laminate panels, 4\" swivel casters (2 with brakes), UL, UL EPH-Classified",
      "Price": 4187,
      "Externalid": "7fb08f01-f337-4d4a-b9ab-8263b0387613",
      "Itemname": "INFCS",
      "Status": "Active",
      "modelforfield": "INFCS",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1 year parts & labor warranty standard",
      "Price": 0,
      "Externalid": "45aba175-5e6c-4c89-8a1c-2bbfed1556b7",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "TS-1",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 583,
      "Externalid": "d674a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-1",
      "Status": "Active",
      "modelforfield": "TS-1",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "S-1",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 24\"L units",
      "Price": 257,
      "Externalid": "1b73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-1",
      "Status": "Active",
      "modelforfield": "S-1",
      "Number": "24"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 269,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "24"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole (1) in top & (1) IN END PANEL, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "CO-DUP",
      "Description": "Duplex receptacle (specify apron mount or base mount)",
      "Price": 267,
      "Externalid": "9ce2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CO-DUP",
      "Status": "Active",
      "modelforfield": "CO-DUP",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "ERS",
      "Description": "Electrical Raceway System",
      "Price": 2122,
      "Externalid": "efe8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "ERS",
      "Status": "Active",
      "modelforfield": "ERS",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "PP",
      "Description": "POWER POLE, 2\" X 2\", 10 FEET MAXIMUM HEIGHT",
      "Price": 483,
      "Externalid": null,
      "Itemname": "PP",
      "Status": "Active",
      "modelforfield": "PP",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "LC",
      "Description": "LOAD CENTER",
      "Price": 1783,
      "Externalid": null,
      "Itemname": "LC",
      "Status": "Active",
      "modelforfield": "LC",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "BSE",
      "Description": "End Skirt ",
      "Price": 142,
      "Externalid": "12e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSE",
      "Status": "Active",
      "modelforfield": "BSE",
      "Number": "24"
    },
    {
      "quantity": 1,
      "item": "INFFT-4-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 56-7/8\" LONG",
      "Price": 5296,
      "Externalid": "a866ccb4-5b6c-4a38-bb7a-70dad7d0d44d",
      "Itemname": "INFFT-4-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-4-MOD",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "TS-4-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 56-7/8 LONG",
      "Price": 1290,
      "Externalid": "e274a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-4-MOD",
      "Status": "Active",
      "modelforfield": "TS-4-MOD",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "S-4-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 56-7/8\" LONG",
      "Price": 401,
      "Externalid": "2473a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-4-MOD",
      "Status": "Active",
      "modelforfield": "S-4-MOD",
      "Number": "25"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "25"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in END PANELS, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 629,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "25"
    },
    {
      "quantity": 2,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "WDF-L",
      "Description": "Slim-Line Ice Cream Freezer, drop-in type, with self-contained refrigeration, 1.9 cu.ft/65 lbs. capacity, stainless steel top & inner liner, galvanized outer liner, with hinged lids, on/off thermostat switch & pilot light",
      "Price": 3601,
      "Externalid": "5879a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "WDF-L",
      "Status": "Active",
      "modelforfield": "WDF-L",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1 year parts & labor warranty standard",
      "Price": 0,
      "Externalid": "45aba175-5e6c-4c89-8a1c-2bbfed1556b7",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "5-year compressor warranty (net)",
      "Price": 152,
      "Externalid": "402dcd0c-1054-485e-89c8-7111f77ec641",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "120v/60/1-ph, 1/5 HP, 4.2 amps, NEMA 5-15P, standard",
      "Price": 0,
      "Externalid": "d747f4db-b1d8-4fd2-9091-9b3b6a6564dd",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Hinged plexiglas lid",
      "Price": 284,
      "Externalid": "25834296-714c-4e91-bfbf-ef658a66030d",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "RS",
      "Description": "Remote On/Off Switch, for counter mounting",
      "Price": 171,
      "Externalid": "df72a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RS",
      "Status": "Active",
      "modelforfield": "RS",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "JBC",
      "Description": "Junction box for cold unit, 4\" x 4\", 120 volt",
      "Price": 390,
      "Externalid": "29eaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "JBC",
      "Status": "Active",
      "modelforfield": "JBC",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "BSR-4-MOD",
      "Description": "Rear Skirt, MODIFIED: 56-3/4\" LONG",
      "Price": 222,
      "Externalid": "30e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-4-MOD",
      "Status": "Active",
      "modelforfield": "BSR-4-MOD",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "25"
    },
    {
      "quantity": 1,
      "item": "INFFT-4-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 56-7/8\" LONG",
      "Price": 5296,
      "Externalid": "a866ccb4-5b6c-4a38-bb7a-70dad7d0d44d",
      "Itemname": "INFFT-4-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-4-MOD",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "TS-4-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 56-7/8\" LONG",
      "Price": 1290,
      "Externalid": "e274a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-4-MOD",
      "Status": "Active",
      "modelforfield": "TS-4-MOD",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "S-4-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 56-7/8\" LONG",
      "Price": 401,
      "Externalid": "2473a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-4-MOD",
      "Status": "Active",
      "modelforfield": "S-4-MOD",
      "Number": "26"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "FH",
      "Description": "Ferruled hole in END PANEL, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "JBH",
      "Description": "Junction box for hot unit, 4\" x 4\", 120/240 volt",
      "Price": 648,
      "Externalid": "2ceaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "JBH",
      "Status": "Active",
      "modelforfield": "JBH",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 620,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "WIH-2",
      "Description": "Hot Food Drop-In Well Unit, electric, 2-well, individual pan design, wet or dry operation, holds (2) 12\" x 20\" pans, control panel with individual thermostatic controls, stainless steel top & wells, galvanized outer liner, with fiberglass insulation, UL, ETL-Sanitation",
      "Price": 1872,
      "Externalid": "947aa094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "WIH-2",
      "Status": "Active",
      "modelforfield": "WIH-2",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: Drains are optional",
      "Price": 0,
      "Externalid": "a6910b7a-eac2-e011-93f8-001018721196",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "240v/60/1-ph, 1.7 kW, 8.2 amps, NEMA 5-20P, 850 watt elements",
      "Price": 0,
      "Externalid": "c92f1f62-8e24-de11-9c95-001ec95274b6",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "DM-4",
      "Description": "Individual Drain, for each well with manifold to single valve, for drop-in units",
      "Price": 569,
      "Externalid": "48e6f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "DM-4",
      "Status": "Active",
      "modelforfield": "DM-4",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "AF",
      "Description": "Automatic Water Fill",
      "Price": 1689,
      "Externalid": "f3daf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "AF",
      "Status": "Active",
      "modelforfield": "AF",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: DM-2 must be added when AF is selected",
      "Price": 0,
      "Externalid": "0c7ca094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: A water filtration system is highly recommended when using the automatic water fill.",
      "Price": 0,
      "Externalid": "c4c16925-a213-4a45-aeb4-71909af9e424",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "MS",
      "Description": "Master On/Off Switch",
      "Price": 249,
      "Externalid": "a1eef191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "MS",
      "Status": "Active",
      "modelforfield": "MS",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "AMC-2",
      "Description": "Apron Mounted Controls, for 36-1/4\"L units",
      "Price": 446,
      "Externalid": "ffdaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "AMC-2",
      "Status": "Active",
      "modelforfield": "AMC-2",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "CSG-2A",
      "Description": "Custom Sneeze Guard, 36-1/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, stainless steel mounting brackets, UL EPH CLASSIFIED",
      "Price": 2585,
      "Externalid": "02e3f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2A",
      "Status": "Active",
      "modelforfield": "CSG-2A",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "CSG-2FL",
      "Description": "LED Light, for 35-3/4\"L sneeze guard",
      "Price": 804,
      "Externalid": "21e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2FL",
      "Status": "Active",
      "modelforfield": "CSG-2FL",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "CSG-2ASG",
      "Description": "Adjustable Front Sneeze Guard, 35-3/4\"L",
      "Price": 568,
      "Externalid": "0edbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2ASG",
      "Status": "Active",
      "modelforfield": "CSG-2ASG",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "SH-2",
      "Description": "Work Shelf, 8\" wide, stainless steel, for 36-1/4\"L units",
      "Price": 504,
      "Externalid": "a873a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SH-2",
      "Status": "Active",
      "modelforfield": "SH-2",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "BSR-4-MOD",
      "Description": "Rear Skirt, MODIFIED: 56\" LONG",
      "Price": 222,
      "Externalid": "30e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-4-MOD",
      "Status": "Active",
      "modelforfield": "BSR-4-MOD",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "26"
    },
    {
      "quantity": 1,
      "item": "INFFT-5-MOD",
      "Description": "Utility Solid Top, 77-3/4\"W, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified",
      "Price": 5929,
      "Externalid": "d5b468c4-9478-44b7-9a4e-2cc1bf04fdd0",
      "Itemname": "INFFT-5-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-5-MOD",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "TS-5",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 1124,
      "Externalid": "e874a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-5",
      "Status": "Active",
      "modelforfield": "TS-5",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 862,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "LABOR",
      "Description": "Labor to install special units: TURBO AIR DROP IN MODEL #TOM-72L-UFD-S-3SI-N",
      "Price": 406,
      "Externalid": "2feaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "LABOR",
      "Status": "Active",
      "modelforfield": "LABOR",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "TOM-72L-UFD-S-3SI-N",
      "Description": "Drop-In Horizontal Open Display Case, low profile, 23.4 cu. ft. capacity, 71-7/8\"W x 33-3/4\"D x 52-1/2\"H self-contained refrigeration with self-cleaning condenser, (2) glass shelves + deck, tempered glass front shield & side walls, rear sliding glass doors, solar digital thermometer, digital electronic thermostat with defrost control, LED interior lighting, stainless steel interior, specify exterior color, front air intake & rear air discharge, includes night cover, R290 Hydrocarbon refrigerant, (4) 3/4 HP, 220v/60/1-ph, 13.0 amps, cord with NEMA 6-20P, cETLus, ETL-Sanitation",
      "Price": 14312,
      "Externalid": "7a633183-4bcd-4ee3-a3f0-3475021dd64e",
      "Itemname": "TOM-72L-UFD-S-3SI-N",
      "Status": "Active",
      "modelforfield": "TOM-72L-UFD-S-3SI-N",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Note: Contact factory representative for parts & accessories discounts",
      "Price": 0,
      "Externalid": "0373af47-5d0f-4adc-8a84-24ff867cda22",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "2 year parts & labor warranty, standard",
      "Price": 0,
      "Externalid": "e20ed3d4-a9d2-4c0e-84ef-7e4022b19ac0",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Additional 3 year compressor warranty (5 year total), standard",
      "Price": 0,
      "Externalid": "5e11589f-7756-4656-9356-9e42d3c89e52",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Self-cleaning condenser device equipped, standard",
      "Price": 0,
      "Externalid": "b9c79357-435d-4be8-959c-b45b3ef36cea",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "JBC",
      "Description": "Junction box for cold unit, 4\" x 4\", 120 volt",
      "Price": 390,
      "Externalid": "29eaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "JBC",
      "Status": "Active",
      "modelforfield": "JBC",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "S-5",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 77-1/2\"L units",
      "Price": 341,
      "Externalid": "2773a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-5",
      "Status": "Active",
      "modelforfield": "S-5",
      "Number": "27"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "BSR-5",
      "Description": "Rear Skirt",
      "Price": 215,
      "Externalid": "33e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-5",
      "Status": "Active",
      "modelforfield": "BSR-5",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "SPECIAL",
      "Description": "5\" HIGH BACKSPLASH ON END OF COUNTER",
      "Price": 571,
      "Externalid": null,
      "Itemname": "SPECIAL",
      "Status": "Active",
      "modelforfield": "SPECIAL",
      "Number": "27"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "27"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IT IS HIGHLY RECOMMENDED THAT YOU USE A FORK LIFT TO REMOVE TEH INFINITI FIT UNITS FROM CRATE BASES TO ENSURE NO DAMAGE IS DONE TO THE LAMINATE\r\n",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IF YOU DO NOT HAVE ACCESS TO A FORK LIFT, WE RECOMMEND YOU ORDER A SET OF RAMPS AT COST TO REMOVE CARTS FROM PALLETS.",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 1,
      "item": "RAMPS",
      "Description": "RAMPS TO REMOVE UNITS FROM CRATE BASES",
      "Price": 104,
      "Externalid": null,
      "Itemname": "RAMPS",
      "Status": "Active",
      "modelforfield": "RAMPS",
      "Number": "28"
    },
    {
      "quantity": 1,
      "item": "EDUS",
      "Description": "Equipment Delivery, Uncrate and Set in Place\r\n\r\nMRS will deliver, uncrate, and set the quoted equipment. \r\nCold equipment will be assembled, set, and started if correct power is available. \r\nHot equipment will be assembled and set in place only. \r\n\r\nAll gas and electrical final connections BY OTHERS. \r\n\r\nAny existing equipment will need to be removed PRIOR to our delivery.\r\n",
      "Price": 1365,
      "Externalid": "f620e54c-0964-4a4f-87a0-45687c0a0c80",
      "Itemname": "EDUS",
      "Status": "Active",
      "modelforfield": "EDUS",
      "Number": "29"
    },
    {
      "quantity": 1,
      "item": "EERR",
      "Description": "Existing Equipment Removal\r\n\r\nMRS will disconnect, remove, haul away, and properly dispose of existing equipment.",
      "Price": 1050,
      "Externalid": "8d712132-d8b6-421e-8cb0-384993083d73",
      "Itemname": "EERR",
      "Status": "Active",
      "modelforfield": "EERR",
      "Number": "30"
    },
    {
      "quantity": 1,
      "item": "INSTALLATION",
      "Description": "Keller HS - Fast Take - Integrus Fabrication Installation Connections\r\nElectrical: Hardwire 1 load center\r\ninto schools existing power supply.\r\nPower supply within 5 feet of load\r\ncenter\r\nWater Inlet connection: Connect 1\r\nauto-fill water connection to water\r\nsupply. Water supply within 7 feet\r\nof water inlet\r\nDrain connection: Connect 1 drain\r\n(7ft max) for hot well",
      "Price": 1976,
      "Externalid": null,
      "Itemname": "INSTALLATION",
      "Status": "Active",
      "modelforfield": "INSTALLATION",
      "Number": "31"
    },
    {
      "quantity": 1,
      "item": "WARRANTY",
      "Description": "2 YEAR PARTS AND LABOR WARRANTY STANDARD FOR ALL K-12 APPLICATIONS. ",
      "Price": 0,
      "Externalid": null,
      "Itemname": "WARRANTY",
      "Status": "Active",
      "modelforfield": "WARRANTY",
      "Number": "NOTE"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "Deli Line",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "NOTE"
    },
    {
      "quantity": 1,
      "item": "INFFT-2-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 31\" LONG",
      "Price": 4688,
      "Externalid": "26746ac9-3e17-4f41-90d8-4c8d7380bd68",
      "Itemname": "INFFT-2-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-2-MOD",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "TS-2-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 31\" LONG",
      "Price": 1144,
      "Externalid": "d974a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-2-MOD",
      "Status": "Active",
      "modelforfield": "TS-2-MOD",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "S-2-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 31\" LONG",
      "Price": 373,
      "Externalid": "1e73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-2-MOD",
      "Status": "Active",
      "modelforfield": "S-2-MOD",
      "Number": "32"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 344,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "WIH-1",
      "Description": "Hot Food Drop-In Well Unit, electric, 1-well, individual pan design, wet or dry operation, holds (1) 12\" x 20\" pan, control panel with individual thermostatic controls, stainless steel top & wells, galvanized outer liner, with fiberglass insulation, UL, ETL-Sanitation",
      "Price": 1187,
      "Externalid": "827aa094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "WIH-1",
      "Status": "Active",
      "modelforfield": "WIH-1",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: Drains are optional",
      "Price": 0,
      "Externalid": "a6910b7a-eac2-e011-93f8-001018721196",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "120v/60/1-ph, 1.0 kW, 8.3 amps, NEMA 5-15P, 1000 watt element",
      "Price": 0,
      "Externalid": "c02f1f62-8e24-de11-9c95-001ec95274b6",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "D-1",
      "Description": "Individual Drain & Valve, for each well (WIH series only, add (-D) to model no.)",
      "Price": 103,
      "Externalid": "8ee5f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "D-1",
      "Status": "Active",
      "modelforfield": "D-1",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "AF",
      "Description": "Automatic Water Fill",
      "Price": 1689,
      "Externalid": "f3daf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "AF",
      "Status": "Active",
      "modelforfield": "AF",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: D-1 must be added when AF is selected",
      "Price": 0,
      "Externalid": "097ca094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "NOTE: A water filtration system is highly recommended when using the automatic water fill.",
      "Price": 0,
      "Externalid": "c4c16925-a213-4a45-aeb4-71909af9e424",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "MS",
      "Description": "Master On/Off Switch",
      "Price": 249,
      "Externalid": "a1eef191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "MS",
      "Status": "Active",
      "modelforfield": "MS",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "AMC-1",
      "Description": "Apron Mounted Control, for 24\" Long units",
      "Price": 265,
      "Externalid": "d41d5fb6-02a7-4a86-8165-488d02d46654",
      "Itemname": "AMC-1",
      "Status": "Active",
      "modelforfield": "AMC-1",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "CSG-1A",
      "Description": "Custom Sneeze Guard, 23-7/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, stainless steel mounting brackets, UL EPH CLASSIFIED (contact factory for pricing)",
      "Price": 2585,
      "Externalid": "95817930-3d5b-4abb-a7cb-c0fd19625d6c",
      "Itemname": "CSG-1A",
      "Status": "Active",
      "modelforfield": "CSG-1A",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "CSG-1FL",
      "Description": "LED Light, for 23-7/8\"L sneeze guard",
      "Price": 804,
      "Externalid": "21e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-1FL",
      "Status": "Active",
      "modelforfield": "CSG-1FL",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "CSG-1ASG",
      "Description": "Adjustable Front Sneeze Guard, 23-7/8\"",
      "Price": 568,
      "Externalid": "0edbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-1ASG",
      "Status": "Active",
      "modelforfield": "CSG-1ASG",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "USM-2-MOD",
      "Description": "Undershelves, stainless steel, middle, MODIFIED: 31\" LONG",
      "Price": 576,
      "Externalid": "73fd0e88-cd88-49a3-8036-eaf44ef5cab7",
      "Itemname": "USM-2-MOD",
      "Status": "Active",
      "modelforfield": "USM-2-MOD",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "BSR-2-MOD",
      "Description": "Rear Skirt, MODIFIED: 31\" LONG",
      "Price": 181,
      "Externalid": "2ae0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-2-MOD",
      "Status": "Active",
      "modelforfield": "BSR-2-MOD",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "JBH",
      "Description": "Junction box for hot unit, 4\" x 4\", 120/240 volt",
      "Price": 648,
      "Externalid": "2ceaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "JBH",
      "Status": "Active",
      "modelforfield": "JBH",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "FH",
      "Description": "Ferruled hole in IN END PANEL",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "SPECIAL",
      "Description": "5\" HIGH BACKSPLASH ON END OF COUNTER",
      "Price": 485,
      "Externalid": null,
      "Itemname": "SPECIAL",
      "Status": "Active",
      "modelforfield": "SPECIAL",
      "Number": "32"
    },
    {
      "quantity": 1,
      "item": "INFRM-6",
      "Description": "Refrigerated Cold Food Unit, 91-1/2\"W, open cabinet base with 3\" recessed top, self-contained refrigeration, (6) 12\" x 20\"pan capacity, 16/304 stainless steel top, stainless steel frame with laminate panels, NO undershelf, 5\" casters (2 with brakes), UL EPH Classified",
      "Price": 10045,
      "Externalid": "84518617-f299-4246-8c28-70fca5f03b2b",
      "Itemname": "INFRM-6",
      "Status": "Active",
      "modelforfield": "INFRM-6",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1 year parts & labor warranty standard",
      "Price": 0,
      "Externalid": "45aba175-5e6c-4c89-8a1c-2bbfed1556b7",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "5-year compressor warranty (net)",
      "Price": 152,
      "Externalid": "402dcd0c-1054-485e-89c8-7111f77ec641",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "120v/60/1-ph, 3/4 HP, 10.7 amps, NEMA 5-15P, standard",
      "Price": 0,
      "Externalid": "1de67b3e-b1c9-4304-b256-203925ecfd04",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "RS",
      "Description": "Remote On/Off Switch, for counter mounting",
      "Price": 171,
      "Externalid": "df72a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RS",
      "Status": "Active",
      "modelforfield": "RS",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "#2060-1",
      "Description": "Condensate Evaporator",
      "Price": 216,
      "Externalid": "ff727106-f45b-e011-bf97-001018721196",
      "Itemname": "#2060-1",
      "Status": "Active",
      "modelforfield": "#2060-1",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "TS-6",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 1354,
      "Externalid": "ee74a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-6",
      "Status": "Active",
      "modelforfield": "TS-6",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "S-6",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 91-1/4\"L units",
      "Price": 359,
      "Externalid": "2a73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-6",
      "Status": "Active",
      "modelforfield": "S-6",
      "Number": "33"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 1012,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "SH-6",
      "Description": "Work Shelf, 8\" wide, stainless steel, for 91-1/4\"L units",
      "Price": 855,
      "Externalid": "b873a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SH-6",
      "Status": "Active",
      "modelforfield": "SH-6",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "CSG-6A",
      "Description": "Custom Sneeze Guard, 90-1/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, center support, stainless steel mounting brackets, UL EPH CLASSIFIED",
      "Price": 4290,
      "Externalid": "ede4f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-6A",
      "Status": "Active",
      "modelforfield": "CSG-6A",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "CSG-6FL",
      "Description": "LED Light, for 90-3/4\"L sneeze guard",
      "Price": 1264,
      "Externalid": "33e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-6FL",
      "Status": "Active",
      "modelforfield": "CSG-6FL",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "CSG-6ASG",
      "Description": "Adjustable Front Sneeze Guard, 90-3/4\"L",
      "Price": 1313,
      "Externalid": "20dbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-6ASG",
      "Status": "Active",
      "modelforfield": "CSG-6ASG",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "BSR-6",
      "Description": "Rear Skirt (CW & CA units only)",
      "Price": 301,
      "Externalid": "36e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-6",
      "Status": "Active",
      "modelforfield": "BSR-6",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "33"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in END PANEL",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "33"
    },
    {
      "quantity": 1,
      "item": "INFFT-2-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 32\" LONG X 33\" DEEP",
      "Price": 5252,
      "Externalid": "26746ac9-3e17-4f41-90d8-4c8d7380bd68",
      "Itemname": "INFFT-2-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-2-MOD",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "TS-2-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 32\" LONG",
      "Price": 1144,
      "Externalid": "d974a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-2-MOD",
      "Status": "Active",
      "modelforfield": "TS-2-MOD",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "S-2-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 32\" LONG",
      "Price": 373,
      "Externalid": "1e73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-2-MOD",
      "Status": "Active",
      "modelforfield": "S-2-MOD",
      "Number": "34"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 355,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "FH",
      "Description": "Ferruled hole in top, 3\" dia.",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "CO",
      "Description": "Convenience Outlet, 120v/60/1-ph, 15 amps, (specify apron mount or base mount)",
      "Price": 236,
      "Externalid": "99e2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CO",
      "Status": "Active",
      "modelforfield": "CO",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "USM-2-MOD",
      "Description": "Undershelves, stainless steel, middle, MODIFIED: 32\" LONG",
      "Price": 576,
      "Externalid": "73fd0e88-cd88-49a3-8036-eaf44ef5cab7",
      "Itemname": "USM-2-MOD",
      "Status": "Active",
      "modelforfield": "USM-2-MOD",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "BSR-2-MOD",
      "Description": "Rear Skirt, MODIFIED: 32\" LONG",
      "Price": 181,
      "Externalid": "2ae0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-2-MOD",
      "Status": "Active",
      "modelforfield": "BSR-2-MOD",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "CO-DUP",
      "Description": "Duplex receptacle (specify apron mount or base mount)",
      "Price": 267,
      "Externalid": "9ce2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CO-DUP",
      "Status": "Active",
      "modelforfield": "CO-DUP",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 42,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "34"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in END PANEL",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "34"
    },
    {
      "quantity": 1,
      "item": "INFFT-3-MOD",
      "Description": "Utility Solid Top, 50-1/4\"W, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 36-7/8\" WIDE",
      "Price": 4969,
      "Externalid": "cd9c1dbe-a573-473f-9f89-16facfed4be1",
      "Itemname": "INFFT-3-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-3-MOD",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "TS-3",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 968,
      "Externalid": "dc74a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-3",
      "Status": "Active",
      "modelforfield": "TS-3",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 555,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "35"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in top, 3\" dia.",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "LABOR",
      "Description": "Labor to install special units: TURBO AIR DROP IN MODEL #TOM-36L-UF-S-3SI-N \"SUPPLIED BY OTHERS\"",
      "Price": 406,
      "Externalid": "2feaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "LABOR",
      "Status": "Active",
      "modelforfield": "LABOR",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "TOM-36L-UF-S-3SI-N",
      "Description": "Drop-In Horizontal Open Display Case, low profile, 11.1 cu. ft. capacity, 35-7/8\"W x 33\"D x 52-1/2\"H, self-contained refrigeration with self-cleaning condenser, (2) glass shelves + deck, tempered glass front shield & side walls, solar digital thermometer, digital electronic thermostat with defrost control, LED interior lighting, stainless steel interior, back wall & deck pan, specify exterior color, front air intake & rear air discharge, includes night cover, R290 Hydrocarbon refrigerant, (2) 3/4 HP, 115v/60/1-ph, 11.3 amp, cord with NEMA 5-20P, CSA Sanitation, cCSAus",
      "Price": 10912,
      "Externalid": "3bbb5233-c55e-419a-922e-94ae6eb6c269",
      "Itemname": "TOM-36L-UF-S-3SI-N",
      "Status": "Active",
      "modelforfield": "TOM-36L-UF-S-3SI-N",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Note: Contact factory representative for parts & accessories discounts",
      "Price": 0,
      "Externalid": "0373af47-5d0f-4adc-8a84-24ff867cda22",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "2 year parts & labor warranty, standard",
      "Price": 0,
      "Externalid": "e20ed3d4-a9d2-4c0e-84ef-7e4022b19ac0",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Additional 3 year compressor warranty (5 year total), standard",
      "Price": 0,
      "Externalid": "5e11589f-7756-4656-9356-9e42d3c89e52",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Self-cleaning condenser device equipped, standard",
      "Price": 0,
      "Externalid": "b9c79357-435d-4be8-959c-b45b3ef36cea",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Must specify exterior finish - STAINLESS STEEL",
      "Price": 0,
      "Externalid": "c9207f24-57cf-46f9-89e9-c7ef1e6b699f",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "S-3",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 50\"L units",
      "Price": 302,
      "Externalid": "2173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-3",
      "Status": "Active",
      "modelforfield": "S-3",
      "Number": "35"
    },
    {
      "quantity": 2,
      "item": "EPS-MOD",
      "Description": "End Panel, stainless steel, MODIFIED: 36-7/8\" WIDE",
      "Price": 356,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS-MOD",
      "Status": "Active",
      "modelforfield": "EPS-MOD",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "BSR-3",
      "Description": "Rear Skirt ",
      "Price": 161,
      "Externalid": "2de0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-3",
      "Status": "Active",
      "modelforfield": "BSR-3",
      "Number": "35"
    },
    {
      "quantity": 1,
      "item": "INFCS",
      "Description": "Cashier Station, mobile, 16/304 stainless steel top, stainless steel cash drawer with key lock, stainless steel frame with laminate panels, 4\" swivel casters (2 with brakes), UL, UL EPH-Classified",
      "Price": 4187,
      "Externalid": "7fb08f01-f337-4d4a-b9ab-8263b0387613",
      "Itemname": "INFCS",
      "Status": "Active",
      "modelforfield": "INFCS",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1 year parts & labor warranty standard",
      "Price": 0,
      "Externalid": "45aba175-5e6c-4c89-8a1c-2bbfed1556b7",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "TS-1",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 583,
      "Externalid": "d674a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-1",
      "Status": "Active",
      "modelforfield": "TS-1",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "S-1",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 24\"L units",
      "Price": 257,
      "Externalid": "1b73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-1",
      "Status": "Active",
      "modelforfield": "S-1",
      "Number": "36"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 269,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "FH",
      "Description": "Ferruled hole in top, 3\" dia.",
      "Price": 105,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "CO-DUP",
      "Description": "Duplex receptacle (specify apron mount or base mount)",
      "Price": 267,
      "Externalid": "9ce2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CO-DUP",
      "Status": "Active",
      "modelforfield": "CO-DUP",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "ERS",
      "Description": "Electrical Raceway System",
      "Price": 2122,
      "Externalid": "efe8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "ERS",
      "Status": "Active",
      "modelforfield": "ERS",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "BSE",
      "Description": "End Skirt (CW & CA units only)",
      "Price": 142,
      "Externalid": "12e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSE",
      "Status": "Active",
      "modelforfield": "BSE",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "USB-1",
      "Description": "Bottom Shelf, stainless steel",
      "Price": 452,
      "Externalid": "1e75a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "USB-1",
      "Status": "Active",
      "modelforfield": "USB-1",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "PP",
      "Description": "POWER POLE, 2\" X 2\", 10 FEET MAXIMUM",
      "Price": 483,
      "Externalid": null,
      "Itemname": "PP",
      "Status": "Active",
      "modelforfield": "PP",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "LC",
      "Description": "LOAD CENTER",
      "Price": 1783,
      "Externalid": null,
      "Itemname": "LC",
      "Status": "Active",
      "modelforfield": "LC",
      "Number": "36"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "36"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IT IS HIGHLY RECOMMENDED THAT YOU USE A FORK LIFT TO REMOVE TEH INFINITI FIT UNITS FROM CRATE BASES TO ENSURE NO DAMAGE IS DONE TO THE LAMINATE\r\n",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IF YOU DO NOT HAVE ACCESS TO A FORK LIFT, WE RECOMMEND YOU ORDER A SET OF RAMPS AT COST TO REMOVE CARTS FROM PALLETS.",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 1,
      "item": "RAMPS",
      "Description": "RAMPS TO REMOVE UNITS FROM CRATE BASES",
      "Price": 104,
      "Externalid": null,
      "Itemname": "RAMPS",
      "Status": "Active",
      "modelforfield": "RAMPS",
      "Number": "37"
    },
    {
      "quantity": 1,
      "item": "EDUS",
      "Description": "Equipment Delivery, Uncrate and Set in Place\r\n\r\nMRS will deliver, uncrate, and set the quoted equipment. \r\nCold equipment will be assembled, set, and started if correct power is available. \r\nHot equipment will be assembled and set in place only. \r\n\r\nAll gas and electrical final connections BY OTHERS. \r\n\r\nAny existing equipment will need to be removed PRIOR to our delivery.\r\n",
      "Price": 1365,
      "Externalid": "f620e54c-0964-4a4f-87a0-45687c0a0c80",
      "Itemname": "EDUS",
      "Status": "Active",
      "modelforfield": "EDUS",
      "Number": "38"
    },
    {
      "quantity": 1,
      "item": "EERR",
      "Description": "Existing Equipment Removal\r\n\r\nMRS will disconnect, remove, haul away, and properly dispose of existing equipment.",
      "Price": 1050,
      "Externalid": "8d712132-d8b6-421e-8cb0-384993083d73",
      "Itemname": "EERR",
      "Status": "Active",
      "modelforfield": "EERR",
      "Number": "39"
    },
    {
      "quantity": 1,
      "item": "INSTALLATION",
      "Description": "Keller HS - Deli - Integrus Fabrication Installation Connections\r\nElectrical: Hardwire 1 load center\r\ninto schools existing power supply.\r\nPower supply within 5 feet of load\r\ncenter\r\nWater Inlet connection: Connect 1\r\nauto-fill water connection to water\r\nsupply. Water supply within 7 feet\r\nof water inlet\r\nDrain connection: Connect 1 drain\r\n(7ft max) for hot well and 1 drain\r\n(7ft max) for cold well",
      "Price": 2080,
      "Externalid": null,
      "Itemname": "INSTALLATION",
      "Status": "Active",
      "modelforfield": "INSTALLATION",
      "Number": "40"
    },
    {
      "quantity": 1,
      "item": "WARRANTY",
      "Description": "2 YEAR PARTS AND LABOR WARRANTY STANDARD FOR ALL K-12 APPLICATIONS. ",
      "Price": 0,
      "Externalid": null,
      "Itemname": "WARRANTY",
      "Status": "Active",
      "modelforfield": "WARRANTY",
      "Number": "NOTE"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "Fiesta Line",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "NOTE"
    },
    {
      "quantity": 1,
      "item": "INFFT-1-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 18-1/4\" LONG",
      "Price": 4654,
      "Externalid": "6cce5845-09dd-41ed-a1b1-aabea593d41e",
      "Itemname": "INFFT-1-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-1-MOD",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "TS-1-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 18-1/4\" LONG",
      "Price": 729,
      "Externalid": "d674a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-1-MOD",
      "Status": "Active",
      "modelforfield": "TS-1-MOD",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "S-1-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 18-1/4\" LONG",
      "Price": 322,
      "Externalid": "1b73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-1-MOD",
      "Status": "Active",
      "modelforfield": "S-1-MOD",
      "Number": "41"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 436,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "USM-1-MOD",
      "Description": "Undershelves, stainless steel, middle (BL-units), MODIFIED: 18-1/4\" LONG",
      "Price": 566,
      "Externalid": "d01cf27b-bdc2-4bd4-9e8b-d725f812f83e",
      "Itemname": "USM-1-MOD",
      "Status": "Active",
      "modelforfield": "USM-1-MOD",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "CO-DUP",
      "Description": "Duplex receptacle (specify apron mount or base mount)",
      "Price": 268,
      "Externalid": "9ce2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CO-DUP",
      "Status": "Active",
      "modelforfield": "CO-DUP",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "BSR-1-MOD",
      "Description": "Rear Skirt , MODIFIED: 18-1/4\" LONG",
      "Price": 173,
      "Externalid": "27e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-1-MOD",
      "Status": "Active",
      "modelforfield": "BSR-1-MOD",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 41,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "FH",
      "Description": "Ferruled hole in END PANEL, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "SPECIAL",
      "Description": "5\" HIGH BACKSPLASH ON END OF COUNTER",
      "Price": 484,
      "Externalid": null,
      "Itemname": "SPECIAL",
      "Status": "Active",
      "modelforfield": "SPECIAL",
      "Number": "41"
    },
    {
      "quantity": 1,
      "item": "INFHB-4",
      "Description": "Mobile Hot Food Unit, electric, 64\"W, heated cabinet base, (4) 12\" x 20\" hot food wells (wet or dry), enclosed heated base with pan slides, individual controls, 16/304 stainless steel top, stainless steel frame with laminate panels, 5\" swivel casters (2 with brakes), UL EPH Classified",
      "Price": 9003,
      "Externalid": "e2b890b2-bdea-4ec9-98df-476f5fb55318",
      "Itemname": "INFHB-4",
      "Status": "Active",
      "modelforfield": "INFHB-4",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1 year parts & labor warranty standard",
      "Price": 0,
      "Externalid": "45aba175-5e6c-4c89-8a1c-2bbfed1556b7",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "208v/60/1-ph, 4.25 kW, 12.3 amps, 850 watt elements",
      "Price": 0,
      "Externalid": "a82f1f62-8e24-de11-9c95-001ec95274b6",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "MS",
      "Description": "Master On/Off Switch",
      "Price": 249,
      "Externalid": "a1eef191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "MS",
      "Status": "Active",
      "modelforfield": "MS",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "RC",
      "Description": "Round Cutout In Top",
      "Price": 110,
      "Externalid": "a1f3f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RC",
      "Status": "Active",
      "modelforfield": "RC",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "B-0208",
      "Description": "Pantry Faucet, single with 6\" cast nozzle, deck mounted, shank aerator outlet with 1/2\" NPS thread, 1/4\" IPS union type tailpiece, lever handle, \"C\" (or \"H\"), quarter-turn Eterna cartridge, low lead, ADA Compliant",
      "Price": 124,
      "Externalid": null,
      "Itemname": "B-0208",
      "Status": "Active",
      "modelforfield": "B-0208",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "TS-4",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 1032,
      "Externalid": "e274a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-4",
      "Status": "Active",
      "modelforfield": "TS-4",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "S-4",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 63-3/4\"L units",
      "Price": 320,
      "Externalid": "2473a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-4",
      "Status": "Active",
      "modelforfield": "S-4",
      "Number": "42"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 710,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "SH-4",
      "Description": "Work Shelf, 8\" wide, stainless steel, for 63-3/4\"L units",
      "Price": 634,
      "Externalid": "b073a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SH-4",
      "Status": "Active",
      "modelforfield": "SH-4",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "DME-4",
      "Description": "Individual Drain, for each well with manifold to single valve with rear extension",
      "Price": 755,
      "Externalid": "63e6f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "DME-4",
      "Status": "Active",
      "modelforfield": "DME-4",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "CSG-4A",
      "Description": "Custom Sneeze Guard, 63-5/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, stainless steel mounting brackets, UL EPH CLASSIFIED",
      "Price": 3353,
      "Externalid": "d5e3f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-4A",
      "Status": "Active",
      "modelforfield": "CSG-4A",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "CSG-4FL",
      "Description": "LED Light, for 63-1/4\"L sneeze guard",
      "Price": 1199,
      "Externalid": "27e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-4FL",
      "Status": "Active",
      "modelforfield": "CSG-4FL",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "CSG-4ASG",
      "Description": "Adjustable Front Sneeze Guard, 63-1/4\"L",
      "Price": 1129,
      "Externalid": "14dbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-4ASG",
      "Status": "Active",
      "modelforfield": "CSG-4ASG",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "BSR-4",
      "Description": "Rear Skirt ",
      "Price": 177,
      "Externalid": "30e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-4",
      "Status": "Active",
      "modelforfield": "BSR-4",
      "Number": "42"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in END PANEL, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "42"
    },
    {
      "quantity": 1,
      "item": "INFRM-2",
      "Description": "Refrigerated Cold Food Unit, 36-1/2\"W, open cabinet base with 3\" recessed top, self-contained refrigeration, (2) 12\" x 20\"pan capacity, 16/304 stainless steel top, stainless steel frame with laminate panels, NO undershelf, 5\" casters (2 with brakes), UL EPH Classified",
      "Price": 7624,
      "Externalid": "f4e7a198-77aa-403e-9bc5-7287ff2eb366",
      "Itemname": "INFRM-2",
      "Status": "Active",
      "modelforfield": "INFRM-2",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "1 year parts & labor warranty standard",
      "Price": 0,
      "Externalid": "45aba175-5e6c-4c89-8a1c-2bbfed1556b7",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "5-year compressor warranty (net)",
      "Price": 152,
      "Externalid": "402dcd0c-1054-485e-89c8-7111f77ec641",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "120v/60/1-ph, 1/4 HP, 4.2 amps, NEMA 5-15P, standard",
      "Price": 0,
      "Externalid": "ec65730a-6cde-4bad-976a-fbe95548a73a",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "RS",
      "Description": "Remote On/Off Switch, for counter mounting",
      "Price": 171,
      "Externalid": "df72a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RS",
      "Status": "Active",
      "modelforfield": "RS",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "TS-2",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge",
      "Price": 915,
      "Externalid": "d974a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-2",
      "Status": "Active",
      "modelforfield": "TS-2",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "S-2",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, for 36-1/4\"L units",
      "Price": 298,
      "Externalid": "1e73a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-2",
      "Status": "Active",
      "modelforfield": "S-2",
      "Number": "43"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 405,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "CSG-2A",
      "Description": "Custom Sneeze Guard, 36-1/8\"W, single-sided, full-service, 3/8\" thick tempered glass front & top, 1/4\" thick end panels, 1\" OD welded & polished stainless steel tubular frame, stainless steel mounting brackets, UL EPH CLASSIFIED",
      "Price": 2585,
      "Externalid": "02e3f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2A",
      "Status": "Active",
      "modelforfield": "CSG-2A",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "CSG-2FL",
      "Description": "LED Light, for 35-3/4\"L sneeze guard",
      "Price": 804,
      "Externalid": "21e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2FL",
      "Status": "Active",
      "modelforfield": "CSG-2FL",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "CSG-2ASG",
      "Description": "Adjustable Front Sneeze Guard, 35-3/4\"L",
      "Price": 568,
      "Externalid": "0edbf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CSG-2ASG",
      "Status": "Active",
      "modelforfield": "CSG-2ASG",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "BSR-2",
      "Description": "Rear Skirt ",
      "Price": 144,
      "Externalid": "2ae0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-2",
      "Status": "Active",
      "modelforfield": "BSR-2",
      "Number": "43"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in END PANEL, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "43"
    },
    {
      "quantity": 1,
      "item": "INFFT-3-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 45\" LONG x 36-7/8\" WIDE",
      "Price": 4969,
      "Externalid": "cd9c1dbe-a573-473f-9f89-16facfed4be1",
      "Itemname": "INFFT-3-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-3-MOD",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "TS-3-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 45\" LONG",
      "Price": 1211,
      "Externalid": "dc74a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-3-MOD",
      "Status": "Active",
      "modelforfield": "TS-3-MOD",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 657,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "SC",
      "Description": "Square Cutout In Top",
      "Price": 156,
      "Externalid": "5173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "SC",
      "Status": "Active",
      "modelforfield": "SC",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "LABOR",
      "Description": "Labor to install special units: TURBO AIR DROP IN MODEL #TOM-36L-UF-S-3SI-N",
      "Price": 406,
      "Externalid": "2feaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "LABOR",
      "Status": "Active",
      "modelforfield": "LABOR",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "TOM-36L-UF-S-3SI-N",
      "Description": "Drop-In Horizontal Open Display Case, low profile, 11.1 cu. ft. capacity, 35-7/8\"W x 33\"D x 52-1/2\"H, self-contained refrigeration with self-cleaning condenser, (2) glass shelves + deck, tempered glass front shield & side walls, solar digital thermometer, digital electronic thermostat with defrost control, LED interior lighting, stainless steel interior, back wall & deck pan, specify exterior color, front air intake & rear air discharge, includes night cover, R290 Hydrocarbon refrigerant, (2) 3/4 HP, 115v/60/1-ph, 11.3 amp, cord with NEMA 5-20P, CSA Sanitation, cCSAus",
      "Price": 10912,
      "Externalid": "3bbb5233-c55e-419a-922e-94ae6eb6c269",
      "Itemname": "TOM-36L-UF-S-3SI-N",
      "Status": "Active",
      "modelforfield": "TOM-36L-UF-S-3SI-N",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "2 year parts & labor warranty, standard",
      "Price": 0,
      "Externalid": "e20ed3d4-a9d2-4c0e-84ef-7e4022b19ac0",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Additional 3 year compressor warranty (5 year total), standard",
      "Price": 0,
      "Externalid": "5e11589f-7756-4656-9356-9e42d3c89e52",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Self-cleaning condenser device equipped, standard",
      "Price": 0,
      "Externalid": "b9c79357-435d-4be8-959c-b45b3ef36cea",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Note: Contact factory representative for parts & accessories discounts",
      "Price": 0,
      "Externalid": "0373af47-5d0f-4adc-8a84-24ff867cda22",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Must specify exterior finish- STAINLESS STEEL",
      "Price": 0,
      "Externalid": "c9207f24-57cf-46f9-89e9-c7ef1e6b699f",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "JBC",
      "Description": "Junction box for cold unit, 4\" x 4\", 120 volt",
      "Price": 390,
      "Externalid": "29eaf191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "JBC",
      "Status": "Active",
      "modelforfield": "JBC",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "PCS",
      "Description": "Power cord, special, 7 to 10 ft. long",
      "Price": 41,
      "Externalid": "e4eff191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "PCS",
      "Status": "Active",
      "modelforfield": "PCS",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "S-3-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 45\" LONG",
      "Price": 378,
      "Externalid": "2173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-3-MOD",
      "Status": "Active",
      "modelforfield": "S-3-MOD",
      "Number": "44"
    },
    {
      "quantity": 2,
      "item": "EPS-MOD",
      "Description": "End Panel, stainless steel, MODIFIED: 36-7/8\" WIDE",
      "Price": 356,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS-MOD",
      "Status": "Active",
      "modelforfield": "EPS-MOD",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "BSR-3-MOD",
      "Description": "Rear Skirt, MODIFIED: 45\" LONG",
      "Price": 201,
      "Externalid": "2de0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-3-MOD",
      "Status": "Active",
      "modelforfield": "BSR-3-MOD",
      "Number": "44"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole in top, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "44"
    },
    {
      "quantity": 1,
      "item": "INFFT-3-MOD",
      "Description": "Utility Solid Top, open cabinet base with apron, solid top, 16/304 stainless steel top, stainless steel frame with laminate panels, stainless steel undershelf, 5\" swivel casters (2 with brakes), UL EPH Classified, MODIFIED: 47-1/4\" LONG",
      "Price": 4969,
      "Externalid": "cd9c1dbe-a573-473f-9f89-16facfed4be1",
      "Itemname": "INFFT-3-MOD",
      "Status": "Active",
      "modelforfield": "INFFT-3-MOD",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "TS-3-MOD",
      "Description": "Tray Slide, drop down design, solid, 12\"D, stainless steel, ribbed, rolled edge, MODIFIED: 47-1/4\" LONG",
      "Price": 1211,
      "Externalid": "dc74a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "TS-3-MOD",
      "Status": "Active",
      "modelforfield": "TS-3-MOD",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "S-3-MOD",
      "Description": "Stainless Steel Front Panel, in lieu of standard finish, MODIFIED: 47-1/4\" LONG",
      "Price": 378,
      "Externalid": "2173a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "S-3-MOD",
      "Status": "Active",
      "modelforfield": "S-3-MOD",
      "Number": "45"
    },
    {
      "quantity": 2,
      "item": "EPS",
      "Description": "End Panel, stainless steel",
      "Price": 284,
      "Externalid": "ece8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "EPS",
      "Status": "Active",
      "modelforfield": "EPS",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "LIGHTING",
      "Description": "LED COLOR CHANGING LIGHTS UNDER TRAY SLIDE",
      "Price": 657,
      "Externalid": null,
      "Itemname": "LIGHTING",
      "Status": "Active",
      "modelforfield": "LIGHTING",
      "Number": "45"
    },
    {
      "quantity": 2,
      "item": "FH",
      "Description": "Ferruled hole (1) in top & (1) IN END PANEL, 3\" dia.",
      "Price": 110,
      "Externalid": "00e9f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "FH",
      "Status": "Active",
      "modelforfield": "FH",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "CD",
      "Description": "Cash Drawer, stainless steel, locking",
      "Price": 715,
      "Externalid": "93e2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CD",
      "Status": "Active",
      "modelforfield": "CD",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "CO-DUP",
      "Description": "Duplex receptacle (specify apron mount or base mount)",
      "Price": 268,
      "Externalid": "9ce2f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "CO-DUP",
      "Status": "Active",
      "modelforfield": "CO-DUP",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "ELECTRICAL",
      "Description": "3 PHASE ELECTRICAL - UL APPROVED",
      "Price": 222,
      "Externalid": null,
      "Itemname": "ELECTRICAL",
      "Status": "Active",
      "modelforfield": "ELECTRICAL",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "ERS",
      "Description": "Electrical Raceway System",
      "Price": 2122,
      "Externalid": "efe8f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "ERS",
      "Status": "Active",
      "modelforfield": "ERS",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "SL-INF",
      "Description": "Legs with adjustable feet, in lieu of casters",
      "Price": 482,
      "Externalid": "e4300fb0-0942-4a6d-960a-ee4c29ea78f7",
      "Itemname": "SL-INF",
      "Status": "Active",
      "modelforfield": "SL-INF",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "",
      "Description": "Rear skirt must be added.",
      "Price": 0,
      "Externalid": "1b83e2ec-6f59-454a-ba2b-06ad42de19db",
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "BSR-3-MOD",
      "Description": "Rear Skirt, MODIFIED: 47-1/4\" LONG",
      "Price": 201,
      "Externalid": "2de0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSR-3-MOD",
      "Status": "Active",
      "modelforfield": "BSR-3-MOD",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "BSE",
      "Description": "End Skirt (CW & CA units only)",
      "Price": 142,
      "Externalid": "12e0f191-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "BSE",
      "Status": "Active",
      "modelforfield": "BSE",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "PP",
      "Description": "POWER POLE, 2\" X 2\", 10 FEET MAXIMUM HEIGHT",
      "Price": 482,
      "Externalid": null,
      "Itemname": "PP",
      "Status": "Active",
      "modelforfield": "PP",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "LC",
      "Description": "LOAD CENTER",
      "Price": 1783,
      "Externalid": null,
      "Itemname": "LC",
      "Status": "Active",
      "modelforfield": "LC",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "RP-1",
      "Description": "Fixed Rear Panel, for 24\"L units",
      "Price": 277,
      "Externalid": "8872a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "RP-1",
      "Status": "Active",
      "modelforfield": "RP-1",
      "Number": "45"
    },
    {
      "quantity": 1,
      "item": "USB-1",
      "Description": "Bottom Shelf, stainless steel",
      "Price": 452,
      "Externalid": "1e75a094-c10d-dd11-a23a-00304834a8c9",
      "Itemname": "USB-1",
      "Status": "Active",
      "modelforfield": "USB-1",
      "Number": "45"
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IT IS HIGHLY RECOMMENDED THAT YOU USE A FORK LIFT TO REMOVE THE INFINITI FIT UNITS FROM CRATE BASES TO ENSURE NO DAMAGE IS DONE TO THE LAMINATE\r\n",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 0,
      "item": "",
      "Description": "IF YOU DO NOT HAVE ACCESS TO A FORK LIFT, WE RECOMMEND YOU ORDER A SET OF RAMPS AT COST TO REMOVE CARTS FROM PALLETS.",
      "Price": 0,
      "Externalid": null,
      "Itemname": "",
      "Status": "Active",
      "modelforfield": "",
      "Number": ""
    },
    {
      "quantity": 1,
      "item": "RAMPS",
      "Description": "RAMPS TO REMOVE UNITS FROM CRATE BASES",
      "Price": 104,
      "Externalid": null,
      "Itemname": "RAMPS",
      "Status": "Active",
      "modelforfield": "RAMPS",
      "Number": "46"
    },
    {
      "quantity": 1,
      "item": "EDUS",
      "Description": "Equipment Delivery, Uncrate and Set in Place\r\n\r\nMRS will deliver, uncrate, and set the quoted equipment. \r\nCold equipment will be assembled, set, and started if correct power is available. \r\nHot equipment will be assembled and set in place only. \r\n\r\nAll gas and electrical final connections BY OTHERS. \r\n\r\nAny existing equipment will need to be removed PRIOR to our delivery.\r\n",
      "Price": 1365,
      "Externalid": "f620e54c-0964-4a4f-87a0-45687c0a0c80",
      "Itemname": "EDUS",
      "Status": "Active",
      "modelforfield": "EDUS",
      "Number": "47"
    },
    {
      "quantity": 1,
      "item": "EERR",
      "Description": "Existing Equipment Removal\r\n\r\nMRS will disconnect, remove, haul away, and properly dispose of existing equipment.",
      "Price": 1050,
      "Externalid": "8d712132-d8b6-421e-8cb0-384993083d73",
      "Itemname": "EERR",
      "Status": "Active",
      "modelforfield": "EERR",
      "Number": "48"
    },
    {
      "quantity": 1,
      "item": "INSTALLATION",
      "Description": "Keller HS - Fiesta Line - Integrus Fabrication Installation Connections\r\nElectrical: Hardwire 1 load center\r\ninto schools existing power supply.\r\nPower supply within 5 feet of load\r\ncenter\r\nWater Inlet connection: Connect 1\r\nhot well faucet o water supply.\r\nWater supply within 7 feet of water\r\ninlet\r\nDrain connection: Connect 1 drain\r\n(7ft max) for hot well and 1 drain\r\n(7ft max) for cold well",
      "Price": 2080,
      "Externalid": null,
      "Itemname": "INSTALLATION",
      "Status": "Active",
      "modelforfield": "INSTALLATION",
      "Number": "49"
    },
    {
      "quantity": 1,
      "item": "SHIPPING",
      "Description": "Shipping",
      "Price": 24942,
      "Externalid": null,
      "Itemname": "SHIPPING",
      "Status": "Active",
      "modelforfield": "SHIPPING",
      "Number": "F1"
    }
  ],
  "Con": [
    {
      "ConID": "edf9c639-1a3f-4e32-a926-60570ecb57aa",
      "lName": "",
      "fname": "",
      "Prospect": "M22801 Keller ISD - Keller High School - Various Serving Lines"
    },
    {
      "ConID": "edf9c639-1a3f-4e32-a926-60570ecb57aa",
      "lName": "",
      "fname": "",
      "Prospect": "M22801 Keller ISD - Keller High School - Various Serving Lines"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "92112bb7-4ca9-4968-aec9-ee1331ffa333",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "lName": "McLean",
      "fname": "Jon",
      "Prospect": "Mission Restaurant Supply - Ft. Worth"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "63a86ef9-c44f-4af0-b17d-c21a8f07a440",
      "lName": "",
      "fname": "",
      "Prospect": "Channel Partners Group"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
      "lName": " pEDEN",
      "fname": "ANITA",
      "Prospect": "Keller ISD"
    },
    {
      "ConID": "a6296038-b264-448e-ae4e-9659cfd4a634",
      "lName": "",
      "fname": "",
      "Prospect": "Atlas Metal"
    },
    {
      "ConID": "e592c4f0-9c8e-4dc1-94e3-c8416bbc70e8",
      "lName": null,
      "fname": null,
      "Prospect": "Atlas"
    },
    {
      "ConID": "542a6339-1687-439f-b096-76ea81e20339",
      "lName": "",
      "fname": "",
      "Prospect": "Turbo Air"
    },
    {
      "ConID": "6e7dc7e1-18be-4e3d-be30-26b406ca46f6",
      "lName": null,
      "fname": null,
      "Prospect": "TurboAir"
    },
    {
      "ConID": "c61eb2ee-787a-48f9-985f-f8d384304252",
      "lName": "",
      "fname": "",
      "Prospect": "Hatco"
    },
    {
      "ConID": "73692979-8207-40af-a2f9-8c970b96182f",
      "lName": "",
      "fname": "",
      "Prospect": "Equipment Preference Inc. (E.P.I.)"
    },
    {
      "ConID": "63a4ee0c-e9f8-4f1c-970a-b67dafd3b41b",
      "lName": null,
      "fname": null,
      "Prospect": "Hatco"
    },
    {
      "ConID": "63a4ee0c-e9f8-4f1c-970a-b67dafd3b41b",
      "lName": null,
      "fname": null,
      "Prospect": "Hatco"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    },
    {
      "ConID": "fbd04c24-59d3-456d-a0c7-aa2118cdc7df",
      "lName": "",
      "fname": "",
      "Prospect": "Mission Restaurant Supply"
    }
  ],
  "ContactID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
  "Prospect": "0b9f92e3-03e1-44db-bd36-7f8c5adc625d",
  "CustinternalID": "",
  "aa": [
    {
      "ContactAddressID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "ContactType": "Sales"
    },
    {
      "ContactAddressID": "af297bd2-40ca-4b80-a965-8e10af7c4ad9",
      "ContactType": "Sales"
    }
  ],
  "Project": "M22801 Keller ISD - Keller High School - Various Serving Lines",
  "ExternalID": "4fd54ee5-ba2f-4717-85bc-6a4ecd14d67d"
}
  ],
  "files": [
    {
      "fileMeta": {
        "fileName": "sampleFileName",
        "fileSize": 1234
      }
    }
  ],
  "errors": [],
  "_exportId": "5f77a01ff3a7e117678ed485",
  "_connectionId": "604277e237d9830eaa25ead1",
  "_flowId": "5f2ac7549e8a0f0e29a61f76",
  "_integrationId": "5f2ac7529e8a0f0e29a61f5b",
  "pageIndex": 0,
  "settings": {
    "integration": {},
    "flowGrouping": {},
    "flow": {},
    "export": {},
    "connection": {}
  }
};

const result = PreMap(options);
console.log(result);