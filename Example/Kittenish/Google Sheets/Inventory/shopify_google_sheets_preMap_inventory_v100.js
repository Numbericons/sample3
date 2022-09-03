// v100


function objCopy(obj) {
  let newObj = {};
  const objKeys = Object.keys(obj);

  for (let i = 0; i < objKeys.length; i++) {
    if (obj[objKeys[i]]) newObj[objKeys[i]] = obj[objKeys[i]];
  }
  return newObj;
}

function preMap(options) {
  return options.data.map((d) => {

    for (let i=0; i<d.products.length; i++){
      if (!d.products[i].inventoryLevels.length) {
        delete d.products[i].inventoryLevels;
        continue;
      }

      let inventoryArr = [];
      let includeSum = {}
      let sumSkus = {};

      for (let k = 0; k < d.products[i].inventoryLevels.length; k++){
        const level = d.products[i].inventoryLevels[k];
        if (level.available > 0) {
          inventoryArr.push(objCopy(level));

          if (sumSkus[level.variant_sku]) {
            sumSkus[level.variant_sku].available += level.available;
            includeSum[level.variant_sku] = true;
          } else {
            sumSkus[level.variant_sku] = level;
          }
        }
      }
      
      const keys = Object.keys(includeSum);

      for (let j = 0; j < keys.length; j++){
        let combined = sumSkus[keys[j]];
        combined.location_name = "Combined Locations";
        const last = inventoryArr.map(inv=> ( inv.variant_sku)).lastIndexOf(keys[j])
        inventoryArr = inventoryArr.slice(0, last+1).concat([sumSkus[keys[j]]]).concat(inventoryArr.slice(last+1));
        //  inventoryArr.slice(includeSum[keys[j]])
        // inventoryArr.push(sumSkus[keys[j]]);
      }

      d.products[i].inventoryLevels = inventoryArr;
    }

    return {
      data: d
    }
  })
}

const options = {
  "data": [
    {
      "products": [
        {
          "id": 4764660203586,
          "title": "YOU'RE MY GALENTINE SWEATSHIRT",
          "status": "active",
          "variants": [
            {
              "id": 32626952372290,
              "title": "XS",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-XS",
              "inventory_item_id": 34372749295682
            },
            {
              "id": 32626952405058,
              "title": "S",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-S",
              "inventory_item_id": 34372749328450
            },
            {
              "id": 32626952437826,
              "title": "M",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-M",
              "inventory_item_id": 34372749361218
            },
            {
              "id": 32626952470594,
              "title": "L",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-L",
              "inventory_item_id": 34372749393986
            },
            {
              "id": 32626952503362,
              "title": "XL",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-XL",
              "inventory_item_id": 34372749426754
            },
            {
              "id": 32626952536130,
              "title": "XXL",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-XXL",
              "inventory_item_id": 34372749459522
            }
          ],
          "variantsInvIds": "34372749295682, 34372749328450, 34372749361218, 34372749393986, 34372749426754, 34372749459522",
          "variantTable": {
            "34372749295682": {
              "id": 32626952372290,
              "title": "XS",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-XS",
              "inventory_item_id": 34372749295682
            },
            "34372749328450": {
              "id": 32626952405058,
              "title": "S",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-S",
              "inventory_item_id": 34372749328450
            },
            "34372749361218": {
              "id": 32626952437826,
              "title": "M",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-M",
              "inventory_item_id": 34372749361218
            },
            "34372749393986": {
              "id": 32626952470594,
              "title": "L",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-L",
              "inventory_item_id": 34372749393986
            },
            "34372749426754": {
              "id": 32626952503362,
              "title": "XL",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-XL",
              "inventory_item_id": 34372749426754
            },
            "34372749459522": {
              "id": 32626952536130,
              "title": "XXL",
              "product_id": 4764660203586,
              "sku": "KIT1161-VDAY1-KTN-XXL",
              "inventory_item_id": 34372749459522
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 34372749295682,
              "location_id": 87588878,
              "available": 0,
              "location_name": "Kittenish - CWC",
              "variant_sku": "KIT1161-VDAY1-KTN-XS"
            },
            {
              "inventory_item_id": 34372749328450,
              "location_id": 87588878,
              "available": 9,
              "location_name": "Kittenish - CWC",
              "variant_sku": "KIT1161-VDAY1-KTN-S"
            }
          ]
        },
        {
          "id": 4518240976962,
          "title": "ZAYA HIGH WAIST LEGGING IN BLACK",
          "status": "active",
          "variants": [
            {
              "id": 31861300428866,
              "title": "XS",
              "product_id": 4518240976962,
              "sku": "6033-XS",
              "inventory_item_id": 33529138118722
            },
            {
              "id": 31861299511362,
              "title": "S",
              "product_id": 4518240976962,
              "sku": "6033-S",
              "inventory_item_id": 33529136775234
            },
            {
              "id": 31861299544130,
              "title": "M",
              "product_id": 4518240976962,
              "sku": "6033-M",
              "inventory_item_id": 33529136808002
            },
            {
              "id": 31861299576898,
              "title": "L",
              "product_id": 4518240976962,
              "sku": "6033-L",
              "inventory_item_id": 33529136840770
            }
          ],
          "variantsInvIds": "33529138118722, 33529136775234, 33529136808002, 33529136840770",
          "variantTable": {
            "33529138118722": {
              "id": 31861300428866,
              "title": "XS",
              "product_id": 4518240976962,
              "sku": "6033-XS",
              "inventory_item_id": 33529138118722
            },
            "33529136775234": {
              "id": 31861299511362,
              "title": "S",
              "product_id": 4518240976962,
              "sku": "6033-S",
              "inventory_item_id": 33529136775234
            },
            "33529136808002": {
              "id": 31861299544130,
              "title": "M",
              "product_id": 4518240976962,
              "sku": "6033-M",
              "inventory_item_id": 33529136808002
            },
            "33529136840770": {
              "id": 31861299576898,
              "title": "L",
              "product_id": 4518240976962,
              "sku": "6033-L",
              "inventory_item_id": 33529136840770
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 33529136775234,
              "location_id": 87588878,
              "available": 4,
              "location_name": "Kittenish - CWC",
              "variant_sku": "6033-S"
            },
            {
              "inventory_item_id": 33529136808002,
              "location_id": 87588878,
              "available": 1,
              "location_name": "Kittenish - CWC",
              "variant_sku": "6033-M"
            },
            {
              "inventory_item_id": 33529136840770,
              "location_id": 87588878,
              "available": 1,
              "location_name": "Kittenish - CWC",
              "variant_sku": "6033-L"
            },
            {
              "inventory_item_id": 33529138118722,
              "location_id": 87588878,
              "available": 2,
              "location_name": "Kittenish - CWC",
              "variant_sku": "6033-XS"
            }
          ]
        },
        {
          "id": 4518242123842,
          "title": "ZAYA SPORTS BRA IN BLACK",
          "status": "active",
          "variants": [
            {
              "id": 31861302296642,
              "title": "XS",
              "product_id": 4518242123842,
              "sku": "SB022-XS",
              "inventory_item_id": 33529141428290
            },
            {
              "id": 31861302329410,
              "title": "S",
              "product_id": 4518242123842,
              "sku": "SB022-S",
              "inventory_item_id": 33529141461058
            },
            {
              "id": 31861302362178,
              "title": "M",
              "product_id": 4518242123842,
              "sku": "SB022-M",
              "inventory_item_id": 33529141493826
            },
            {
              "id": 31861302394946,
              "title": "L",
              "product_id": 4518242123842,
              "sku": "SB022-L",
              "inventory_item_id": 33529141526594
            }
          ],
          "variantsInvIds": "33529141428290, 33529141461058, 33529141493826, 33529141526594",
          "variantTable": {
            "33529141428290": {
              "id": 31861302296642,
              "title": "XS",
              "product_id": 4518242123842,
              "sku": "SB022-XS",
              "inventory_item_id": 33529141428290
            },
            "33529141461058": {
              "id": 31861302329410,
              "title": "S",
              "product_id": 4518242123842,
              "sku": "SB022-S",
              "inventory_item_id": 33529141461058
            },
            "33529141493826": {
              "id": 31861302362178,
              "title": "M",
              "product_id": 4518242123842,
              "sku": "SB022-M",
              "inventory_item_id": 33529141493826
            },
            "33529141526594": {
              "id": 31861302394946,
              "title": "L",
              "product_id": 4518242123842,
              "sku": "SB022-L",
              "inventory_item_id": 33529141526594
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 33529141428290,
              "location_id": 87588878,
              "available": 4,
              "location_name": "Kittenish - CWC",
              "variant_sku": "SB022-XS"
            }
          ]
        },
        {
          "id": 6547050627138,
          "title": "ZENA BLACK ZIPPER TANK",
          "status": "active",
          "variants": [
            {
              "id": 39267686481986,
              "title": "XS",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-XS",
              "inventory_item_id": 41361622368322
            },
            {
              "id": 39267686514754,
              "title": "S",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-S",
              "inventory_item_id": 41361622401090
            },
            {
              "id": 39267686547522,
              "title": "M",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-M",
              "inventory_item_id": 41361622433858
            },
            {
              "id": 39267686580290,
              "title": "L",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-L",
              "inventory_item_id": 41361622466626
            },
            {
              "id": 39267686613058,
              "title": "XL",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-XL",
              "inventory_item_id": 41361622499394
            },
            {
              "id": 39267686645826,
              "title": "XXL",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-XXL",
              "inventory_item_id": 41361622532162
            }
          ],
          "variantsInvIds": "41361622368322, 41361622401090, 41361622433858, 41361622466626, 41361622499394, 41361622532162",
          "variantTable": {
            "41361622368322": {
              "id": 39267686481986,
              "title": "XS",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-XS",
              "inventory_item_id": 41361622368322
            },
            "41361622401090": {
              "id": 39267686514754,
              "title": "S",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-S",
              "inventory_item_id": 41361622401090
            },
            "41361622433858": {
              "id": 39267686547522,
              "title": "M",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-M",
              "inventory_item_id": 41361622433858
            },
            "41361622466626": {
              "id": 39267686580290,
              "title": "L",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-L",
              "inventory_item_id": 41361622466626
            },
            "41361622499394": {
              "id": 39267686613058,
              "title": "XL",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-XL",
              "inventory_item_id": 41361622499394
            },
            "41361622532162": {
              "id": 39267686645826,
              "title": "XXL",
              "product_id": 6547050627138,
              "sku": "ACT10490-KTN-XXL",
              "inventory_item_id": 41361622532162
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 41361622368322,
              "location_id": 87588878,
              "available": 2,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACT10490-KTN-XS"
            },
            {
              "inventory_item_id": 41361622401090,
              "location_id": 87588878,
              "available": 2,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACT10490-KTN-S"
            },
            {
              "inventory_item_id": 41361622433858,
              "location_id": 87588878,
              "available": 2,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACT10490-KTN-M"
            },
            {
              "inventory_item_id": 41361622499394,
              "location_id": 87588878,
              "available": 5,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACT10490-KTN-XL"
            }
          ]
        },
        {
          "id": 4758695411778,
          "title": "ZOEY OVERSIZED LIGHTWEIGHT WHITE CARDIGAN",
          "status": "active",
          "variants": [
            {
              "id": 32611581001794,
              "title": "XS",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-XS",
              "inventory_item_id": 34357349384258
            },
            {
              "id": 32611581034562,
              "title": "S",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-S",
              "inventory_item_id": 34357349417026
            },
            {
              "id": 32611581067330,
              "title": "M",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-M",
              "inventory_item_id": 34357349449794
            },
            {
              "id": 32611581100098,
              "title": "L",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-L",
              "inventory_item_id": 34357349482562
            },
            {
              "id": 32611581132866,
              "title": "XL",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-XL",
              "inventory_item_id": 34357349515330
            },
            {
              "id": 32611581165634,
              "title": "XXL",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-XXL",
              "inventory_item_id": 34357349548098
            }
          ],
          "variantsInvIds": "34357349384258, 34357349417026, 34357349449794, 34357349482562, 34357349515330, 34357349548098",
          "variantTable": {
            "34357349384258": {
              "id": 32611581001794,
              "title": "XS",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-XS",
              "inventory_item_id": 34357349384258
            },
            "34357349417026": {
              "id": 32611581034562,
              "title": "S",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-S",
              "inventory_item_id": 34357349417026
            },
            "34357349449794": {
              "id": 32611581067330,
              "title": "M",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-M",
              "inventory_item_id": 34357349449794
            },
            "34357349482562": {
              "id": 32611581100098,
              "title": "L",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-L",
              "inventory_item_id": 34357349482562
            },
            "34357349515330": {
              "id": 32611581132866,
              "title": "XL",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-XL",
              "inventory_item_id": 34357349515330
            },
            "34357349548098": {
              "id": 32611581165634,
              "title": "XXL",
              "product_id": 4758695411778,
              "sku": "VMGKIT2-KTN-XXL",
              "inventory_item_id": 34357349548098
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": []
        },
        {
          "id": 4759143776322,
          "title": "ZUMA BLUE BIKINI BOTTOMS",
          "status": "active",
          "variants": [
            {
              "id": 32612829429826,
              "title": "XS",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-XS",
              "inventory_item_id": 34358605119554
            },
            {
              "id": 32612829462594,
              "title": "S",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-S",
              "inventory_item_id": 34358605152322
            },
            {
              "id": 32612829495362,
              "title": "M",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-M",
              "inventory_item_id": 34358605185090
            },
            {
              "id": 32612829528130,
              "title": "L",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-L",
              "inventory_item_id": 34358605217858
            },
            {
              "id": 32612829560898,
              "title": "XL",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-XL",
              "inventory_item_id": 34358605250626
            },
            {
              "id": 32612829593666,
              "title": "XXL",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-XXL",
              "inventory_item_id": 34358605283394
            }
          ],
          "variantsInvIds": "34358605119554, 34358605152322, 34358605185090, 34358605217858, 34358605250626, 34358605283394",
          "variantTable": {
            "34358605119554": {
              "id": 32612829429826,
              "title": "XS",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-XS",
              "inventory_item_id": 34358605119554
            },
            "34358605152322": {
              "id": 32612829462594,
              "title": "S",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-S",
              "inventory_item_id": 34358605152322
            },
            "34358605185090": {
              "id": 32612829495362,
              "title": "M",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-M",
              "inventory_item_id": 34358605185090
            },
            "34358605217858": {
              "id": 32612829528130,
              "title": "L",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-L",
              "inventory_item_id": 34358605217858
            },
            "34358605250626": {
              "id": 32612829560898,
              "title": "XL",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-XL",
              "inventory_item_id": 34358605250626
            },
            "34358605283394": {
              "id": 32612829593666,
              "title": "XXL",
              "product_id": 4759143776322,
              "sku": "ACSW80012BBLUE-XXL",
              "inventory_item_id": 34358605283394
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 34358605152322,
              "location_id": 87588878,
              "available": 1,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012BBLUE-S"
            },
            {
              "inventory_item_id": 34358605250626,
              "location_id": 87588878,
              "available": 3,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012BBLUE-XL"
            }
          ]
        },
        {
          "id": 4759140696130,
          "title": "ZUMA BLUE BIKINI TOP",
          "status": "active",
          "variants": [
            {
              "id": 32612825759810,
              "title": "XS",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-XS",
              "inventory_item_id": 34358601449538
            },
            {
              "id": 32612825792578,
              "title": "S",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-S",
              "inventory_item_id": 34358601482306
            },
            {
              "id": 32612825825346,
              "title": "M",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-M",
              "inventory_item_id": 34358601515074
            },
            {
              "id": 32612825858114,
              "title": "L",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-L",
              "inventory_item_id": 34358601547842
            },
            {
              "id": 32612825890882,
              "title": "XL",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-XL",
              "inventory_item_id": 34358601580610
            },
            {
              "id": 32612825923650,
              "title": "XXL",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-XXL",
              "inventory_item_id": 34358601613378
            }
          ],
          "variantsInvIds": "34358601449538, 34358601482306, 34358601515074, 34358601547842, 34358601580610, 34358601613378",
          "variantTable": {
            "34358601449538": {
              "id": 32612825759810,
              "title": "XS",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-XS",
              "inventory_item_id": 34358601449538
            },
            "34358601482306": {
              "id": 32612825792578,
              "title": "S",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-S",
              "inventory_item_id": 34358601482306
            },
            "34358601515074": {
              "id": 32612825825346,
              "title": "M",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-M",
              "inventory_item_id": 34358601515074
            },
            "34358601547842": {
              "id": 32612825858114,
              "title": "L",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-L",
              "inventory_item_id": 34358601547842
            },
            "34358601580610": {
              "id": 32612825890882,
              "title": "XL",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-XL",
              "inventory_item_id": 34358601580610
            },
            "34358601613378": {
              "id": 32612825923650,
              "title": "XXL",
              "product_id": 4759140696130,
              "sku": "ACSW80012TBLUE-XXL",
              "inventory_item_id": 34358601613378
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 34358601482306,
              "location_id": 87588878,
              "available": 1,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012TBLUE-S"
            }
          ]
        },
        {
          "id": 4759181066306,
          "title": "ZUMA COLOR BLOCK ONE PIECE SWIMSUIT",
          "status": "active",
          "variants": [
            {
              "id": 32612870225986,
              "title": "XS",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-XS",
              "inventory_item_id": 34358645915714
            },
            {
              "id": 32612870258754,
              "title": "S",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-S",
              "inventory_item_id": 34358645948482
            },
            {
              "id": 32612870291522,
              "title": "M",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-M",
              "inventory_item_id": 34358646014018
            },
            {
              "id": 32612870324290,
              "title": "L",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-L",
              "inventory_item_id": 34358646046786
            },
            {
              "id": 32612870357058,
              "title": "XL",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-XL",
              "inventory_item_id": 34358646079554
            },
            {
              "id": 32612870389826,
              "title": "XXL",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-XXL",
              "inventory_item_id": 34358646112322
            }
          ],
          "variantsInvIds": "34358645915714, 34358645948482, 34358646014018, 34358646046786, 34358646079554, 34358646112322",
          "variantTable": {
            "34358645915714": {
              "id": 32612870225986,
              "title": "XS",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-XS",
              "inventory_item_id": 34358645915714
            },
            "34358645948482": {
              "id": 32612870258754,
              "title": "S",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-S",
              "inventory_item_id": 34358645948482
            },
            "34358646014018": {
              "id": 32612870291522,
              "title": "M",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-M",
              "inventory_item_id": 34358646014018
            },
            "34358646046786": {
              "id": 32612870324290,
              "title": "L",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-L",
              "inventory_item_id": 34358646046786
            },
            "34358646079554": {
              "id": 32612870357058,
              "title": "XL",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-XL",
              "inventory_item_id": 34358646079554
            },
            "34358646112322": {
              "id": 32612870389826,
              "title": "XXL",
              "product_id": 4759181066306,
              "sku": "ACSW80016-KTN-XXL",
              "inventory_item_id": 34358646112322
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 34358645915714,
              "location_id": 87588878,
              "available": 2,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80016-KTN-XS"
            },
            {
              "inventory_item_id": 34358645948482,
              "location_id": 87588878,
              "available": 3,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80016-KTN-S"
            },
            {
              "inventory_item_id": 34358646014018,
              "location_id": 87588878,
              "available": 3,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80016-KTN-M"
            },
            {
              "inventory_item_id": 34358646046786,
              "location_id": 87588878,
              "available": 2,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80016-KTN-L"
            },
            {
              "inventory_item_id": 34358646079554,
              "location_id": 87588878,
              "available": 1,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80016-KTN-XL"
            }
          ]
        },
        {
          "id": 6694742097986,
          "title": "ZUMA COLOR BLOCK ONE PIECE SWIMSUIT",
          "status": "active",
          "variants": [
            {
              "id": 39656858091586,
              "title": "XS",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-XS",
              "inventory_item_id": 41752648351810
            },
            {
              "id": 39656858124354,
              "title": "S",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-S",
              "inventory_item_id": 41752648384578
            },
            {
              "id": 39656858157122,
              "title": "M",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-M",
              "inventory_item_id": 41752648417346
            },
            {
              "id": 39656858189890,
              "title": "L",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-L",
              "inventory_item_id": 41752648450114
            },
            {
              "id": 39656858222658,
              "title": "XL",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-XL",
              "inventory_item_id": 41752648482882
            },
            {
              "id": 39656858255426,
              "title": "XXL",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-XXL",
              "inventory_item_id": 41752648515650
            }
          ],
          "variantsInvIds": "41752648351810, 41752648384578, 41752648417346, 41752648450114, 41752648482882, 41752648515650",
          "variantTable": {
            "41752648351810": {
              "id": 39656858091586,
              "title": "XS",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-XS",
              "inventory_item_id": 41752648351810
            },
            "41752648384578": {
              "id": 39656858124354,
              "title": "S",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-S",
              "inventory_item_id": 41752648384578
            },
            "41752648417346": {
              "id": 39656858157122,
              "title": "M",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-M",
              "inventory_item_id": 41752648417346
            },
            "41752648450114": {
              "id": 39656858189890,
              "title": "L",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-L",
              "inventory_item_id": 41752648450114
            },
            "41752648482882": {
              "id": 39656858222658,
              "title": "XL",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-XL",
              "inventory_item_id": 41752648482882
            },
            "41752648515650": {
              "id": 39656858255426,
              "title": "XXL",
              "product_id": 6694742097986,
              "sku": "ACSW80016-GRN-KTN-XXL",
              "inventory_item_id": 41752648515650
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 41752648351810,
              "location_id": 87588878,
              "available": 22,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80016-GRN-KTN-XS"
            },
            {
              "inventory_item_id": 41752648351810,
              "location_id": 36982718530,
              "available": 2,
              "location_name": "Kittenish Dallas",
              "variant_sku": "ACSW80016-GRN-KTN-XS"
            },
            {
              "inventory_item_id": 41752648351810,
              "location_id": 36982784066,
              "available": 7,
              "location_name": "Kittenish Tampa",
              "variant_sku": "ACSW80016-GRN-KTN-XS"
            },
            {
              "inventory_item_id": 41752648384578,
              "location_id": 87588878,
              "available": 75,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80016-GRN-KTN-S"
            },
            {
              "inventory_item_id": 41752648384578,
              "location_id": 36982718530,
              "available": 1,
              "location_name": "Kittenish Dallas",
              "variant_sku": "ACSW80016-GRN-KTN-S"
            },
            {
              "inventory_item_id": 41752648384578,
              "location_id": 36982784066,
              "available": 8,
              "location_name": "Kittenish Tampa",
              "variant_sku": "ACSW80016-GRN-KTN-S"
            },
            {
              "inventory_item_id": 41752648417346,
              "location_id": 87588878,
              "available": 26,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80016-GRN-KTN-M"
            },
            {
              "inventory_item_id": 41752648417346,
              "location_id": 36982718530,
              "available": 2,
              "location_name": "Kittenish Dallas",
              "variant_sku": "ACSW80016-GRN-KTN-M"
            },
            {
              "inventory_item_id": 41752648417346,
              "location_id": 36982784066,
              "available": 8,
              "location_name": "Kittenish Tampa",
              "variant_sku": "ACSW80016-GRN-KTN-M"
            },
            {
              "inventory_item_id": 41752648450114,
              "location_id": 87588878,
              "available": 51,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80016-GRN-KTN-L"
            },
            {
              "inventory_item_id": 41752648450114,
              "location_id": 36982718530,
              "available": 1,
              "location_name": "Kittenish Dallas",
              "variant_sku": "ACSW80016-GRN-KTN-L"
            },
            {
              "inventory_item_id": 41752648450114,
              "location_id": 36982784066,
              "available": 5,
              "location_name": "Kittenish Tampa",
              "variant_sku": "ACSW80016-GRN-KTN-L"
            },
            {
              "inventory_item_id": 41752648482882,
              "location_id": 87588878,
              "available": 30,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80016-GRN-KTN-XL"
            },
            {
              "inventory_item_id": 41752648482882,
              "location_id": 36982718530,
              "available": 2,
              "location_name": "Kittenish Dallas",
              "variant_sku": "ACSW80016-GRN-KTN-XL"
            },
            {
              "inventory_item_id": 41752648482882,
              "location_id": 36982784066,
              "available": 3,
              "location_name": "Kittenish Tampa",
              "variant_sku": "ACSW80016-GRN-KTN-XL"
            }
          ]
        },
        {
          "id": 6694741573698,
          "title": "ZUMA GREEN BIKINI BOTTOM",
          "status": "active",
          "variants": [
            {
              "id": 39656856518722,
              "title": "XS",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-XS",
              "inventory_item_id": 41752646778946
            },
            {
              "id": 39656856551490,
              "title": "S",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-S",
              "inventory_item_id": 41752646811714
            },
            {
              "id": 39656856584258,
              "title": "M",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-M",
              "inventory_item_id": 41752646844482
            },
            {
              "id": 39656856617026,
              "title": "L",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-L",
              "inventory_item_id": 41752646877250
            },
            {
              "id": 39656856649794,
              "title": "XL",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-XL",
              "inventory_item_id": 41752646910018
            },
            {
              "id": 39656856682562,
              "title": "XXL",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-XXL",
              "inventory_item_id": 41752646942786
            }
          ],
          "variantsInvIds": "41752646778946, 41752646811714, 41752646844482, 41752646877250, 41752646910018, 41752646942786",
          "variantTable": {
            "41752646778946": {
              "id": 39656856518722,
              "title": "XS",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-XS",
              "inventory_item_id": 41752646778946
            },
            "41752646811714": {
              "id": 39656856551490,
              "title": "S",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-S",
              "inventory_item_id": 41752646811714
            },
            "41752646844482": {
              "id": 39656856584258,
              "title": "M",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-M",
              "inventory_item_id": 41752646844482
            },
            "41752646877250": {
              "id": 39656856617026,
              "title": "L",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-L",
              "inventory_item_id": 41752646877250
            },
            "41752646910018": {
              "id": 39656856649794,
              "title": "XL",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-XL",
              "inventory_item_id": 41752646910018
            },
            "41752646942786": {
              "id": 39656856682562,
              "title": "XXL",
              "product_id": 6694741573698,
              "sku": "CSW80012B-GRN-XXL",
              "inventory_item_id": 41752646942786
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 41752646778946,
              "location_id": 87588878,
              "available": 58,
              "location_name": "Kittenish - CWC",
              "variant_sku": "CSW80012B-GRN-XS"
            },
            {
              "inventory_item_id": 41752646778946,
              "location_id": 36982718530,
              "available": 2,
              "location_name": "Kittenish Dallas",
              "variant_sku": "CSW80012B-GRN-XS"
            },
            {
              "inventory_item_id": 41752646778946,
              "location_id": 36982784066,
              "available": 7,
              "location_name": "Kittenish Tampa",
              "variant_sku": "CSW80012B-GRN-XS"
            },
            {
              "inventory_item_id": 41752646811714,
              "location_id": 87588878,
              "available": 92,
              "location_name": "Kittenish - CWC",
              "variant_sku": "CSW80012B-GRN-S"
            },
            {
              "inventory_item_id": 41752646811714,
              "location_id": 36982718530,
              "available": 1,
              "location_name": "Kittenish Dallas",
              "variant_sku": "CSW80012B-GRN-S"
            },
            {
              "inventory_item_id": 41752646811714,
              "location_id": 35655385154,
              "available": 1,
              "location_name": "Kittenish Nashville",
              "variant_sku": "CSW80012B-GRN-S"
            },
            {
              "inventory_item_id": 41752646811714,
              "location_id": 36982784066,
              "available": 3,
              "location_name": "Kittenish Tampa",
              "variant_sku": "CSW80012B-GRN-S"
            },
            {
              "inventory_item_id": 41752646844482,
              "location_id": 87588878,
              "available": 50,
              "location_name": "Kittenish - CWC",
              "variant_sku": "CSW80012B-GRN-M"
            },
            {
              "inventory_item_id": 41752646844482,
              "location_id": 36982718530,
              "available": 2,
              "location_name": "Kittenish Dallas",
              "variant_sku": "CSW80012B-GRN-M"
            },
            {
              "inventory_item_id": 41752646844482,
              "location_id": 35655385154,
              "available": 1,
              "location_name": "Kittenish Nashville",
              "variant_sku": "CSW80012B-GRN-M"
            },
            {
              "inventory_item_id": 41752646844482,
              "location_id": 36982784066,
              "available": 6,
              "location_name": "Kittenish Tampa",
              "variant_sku": "CSW80012B-GRN-M"
            },
            {
              "inventory_item_id": 41752646877250,
              "location_id": 87588878,
              "available": 43,
              "location_name": "Kittenish - CWC",
              "variant_sku": "CSW80012B-GRN-L"
            },
            {
              "inventory_item_id": 41752646877250,
              "location_id": 36982718530,
              "available": 2,
              "location_name": "Kittenish Dallas",
              "variant_sku": "CSW80012B-GRN-L"
            },
            {
              "inventory_item_id": 41752646877250,
              "location_id": 35655385154,
              "available": 1,
              "location_name": "Kittenish Nashville",
              "variant_sku": "CSW80012B-GRN-L"
            },
            {
              "inventory_item_id": 41752646877250,
              "location_id": 36982784066,
              "available": 5,
              "location_name": "Kittenish Tampa",
              "variant_sku": "CSW80012B-GRN-L"
            },
            {
              "inventory_item_id": 41752646910018,
              "location_id": 87588878,
              "available": 25,
              "location_name": "Kittenish - CWC",
              "variant_sku": "CSW80012B-GRN-XL"
            },
            {
              "inventory_item_id": 41752646910018,
              "location_id": 36982718530,
              "available": 2,
              "location_name": "Kittenish Dallas",
              "variant_sku": "CSW80012B-GRN-XL"
            },
            {
              "inventory_item_id": 41752646910018,
              "location_id": 36982784066,
              "available": 3,
              "location_name": "Kittenish Tampa",
              "variant_sku": "CSW80012B-GRN-XL"
            },
            {
              "inventory_item_id": 41752646942786,
              "location_id": 87588878,
              "available": 8,
              "location_name": "Kittenish - CWC",
              "variant_sku": "CSW80012B-GRN-XXL"
            }
          ]
        },
        {
          "id": 6694740492354,
          "title": "ZUMA GREEN BIKINI TOP",
          "status": "active",
          "variants": [
            {
              "id": 39656850718786,
              "title": "XS",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-XS",
              "inventory_item_id": 41752640979010
            },
            {
              "id": 39656850751554,
              "title": "S",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-S",
              "inventory_item_id": 41752641011778
            },
            {
              "id": 39656850784322,
              "title": "M",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-M",
              "inventory_item_id": 41752641044546
            },
            {
              "id": 39656850817090,
              "title": "L",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-L",
              "inventory_item_id": 41752641077314
            },
            {
              "id": 39656850849858,
              "title": "XL",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-XL",
              "inventory_item_id": 41752641110082
            },
            {
              "id": 39656850882626,
              "title": "XXL",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-XXL",
              "inventory_item_id": 41752641142850
            }
          ],
          "variantsInvIds": "41752640979010, 41752641011778, 41752641044546, 41752641077314, 41752641110082, 41752641142850",
          "variantTable": {
            "41752640979010": {
              "id": 39656850718786,
              "title": "XS",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-XS",
              "inventory_item_id": 41752640979010
            },
            "41752641011778": {
              "id": 39656850751554,
              "title": "S",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-S",
              "inventory_item_id": 41752641011778
            },
            "41752641044546": {
              "id": 39656850784322,
              "title": "M",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-M",
              "inventory_item_id": 41752641044546
            },
            "41752641077314": {
              "id": 39656850817090,
              "title": "L",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-L",
              "inventory_item_id": 41752641077314
            },
            "41752641110082": {
              "id": 39656850849858,
              "title": "XL",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-XL",
              "inventory_item_id": 41752641110082
            },
            "41752641142850": {
              "id": 39656850882626,
              "title": "XXL",
              "product_id": 6694740492354,
              "sku": "ACSW80012T-GRN-KTN-XXL",
              "inventory_item_id": 41752641142850
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 41752640979010,
              "location_id": 87588878,
              "available": 43,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-GRN-KTN-XS"
            },
            {
              "inventory_item_id": 41752640979010,
              "location_id": 36982718530,
              "available": 5,
              "location_name": "Kittenish Dallas",
              "variant_sku": "ACSW80012T-GRN-KTN-XS"
            },
            {
              "inventory_item_id": 41752640979010,
              "location_id": 36982784066,
              "available": 4,
              "location_name": "Kittenish Tampa",
              "variant_sku": "ACSW80012T-GRN-KTN-XS"
            },
            {
              "inventory_item_id": 41752641011778,
              "location_id": 87588878,
              "available": 63,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-GRN-KTN-S"
            },
            {
              "inventory_item_id": 41752641011778,
              "location_id": 36982718530,
              "available": 2,
              "location_name": "Kittenish Dallas",
              "variant_sku": "ACSW80012T-GRN-KTN-S"
            },
            {
              "inventory_item_id": 41752641011778,
              "location_id": 35655385154,
              "available": 1,
              "location_name": "Kittenish Nashville",
              "variant_sku": "ACSW80012T-GRN-KTN-S"
            },
            {
              "inventory_item_id": 41752641011778,
              "location_id": 36982784066,
              "available": 7,
              "location_name": "Kittenish Tampa",
              "variant_sku": "ACSW80012T-GRN-KTN-S"
            },
            {
              "inventory_item_id": 41752641044546,
              "location_id": 87588878,
              "available": 64,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-GRN-KTN-M"
            },
            {
              "inventory_item_id": 41752641044546,
              "location_id": 36982718530,
              "available": 1,
              "location_name": "Kittenish Dallas",
              "variant_sku": "ACSW80012T-GRN-KTN-M"
            },
            {
              "inventory_item_id": 41752641044546,
              "location_id": 35655385154,
              "available": 2,
              "location_name": "Kittenish Nashville",
              "variant_sku": "ACSW80012T-GRN-KTN-M"
            },
            {
              "inventory_item_id": 41752641044546,
              "location_id": 36982784066,
              "available": 8,
              "location_name": "Kittenish Tampa",
              "variant_sku": "ACSW80012T-GRN-KTN-M"
            },
            {
              "inventory_item_id": 41752641077314,
              "location_id": 87588878,
              "available": 47,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-GRN-KTN-L"
            },
            {
              "inventory_item_id": 41752641077314,
              "location_id": 36982718530,
              "available": 2,
              "location_name": "Kittenish Dallas",
              "variant_sku": "ACSW80012T-GRN-KTN-L"
            },
            {
              "inventory_item_id": 41752641077314,
              "location_id": 36982784066,
              "available": 3,
              "location_name": "Kittenish Tampa",
              "variant_sku": "ACSW80012T-GRN-KTN-L"
            },
            {
              "inventory_item_id": 41752641110082,
              "location_id": 87588878,
              "available": 37,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-GRN-KTN-XL"
            },
            {
              "inventory_item_id": 41752641110082,
              "location_id": 36982718530,
              "available": 2,
              "location_name": "Kittenish Dallas",
              "variant_sku": "ACSW80012T-GRN-KTN-XL"
            },
            {
              "inventory_item_id": 41752641110082,
              "location_id": 36982784066,
              "available": 3,
              "location_name": "Kittenish Tampa",
              "variant_sku": "ACSW80012T-GRN-KTN-XL"
            },
            {
              "inventory_item_id": 41752641142850,
              "location_id": 87588878,
              "available": 4,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-GRN-KTN-XXL"
            }
          ]
        },
        {
          "id": 4759139057730,
          "title": "ZUMA TAN BIKINI BOTTOMS",
          "status": "active",
          "variants": [
            {
              "id": 32612823990338,
              "title": "XS",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-XS",
              "inventory_item_id": 34358599680066
            },
            {
              "id": 32612824023106,
              "title": "S",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-S",
              "inventory_item_id": 34358599712834
            },
            {
              "id": 32612824055874,
              "title": "M",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-M",
              "inventory_item_id": 34358599745602
            },
            {
              "id": 32612824088642,
              "title": "L",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-L",
              "inventory_item_id": 34358599778370
            },
            {
              "id": 32612824121410,
              "title": "XL",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-XL",
              "inventory_item_id": 34358599811138
            },
            {
              "id": 32612824154178,
              "title": "XXL",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-XXL",
              "inventory_item_id": 34358599843906
            }
          ],
          "variantsInvIds": "34358599680066, 34358599712834, 34358599745602, 34358599778370, 34358599811138, 34358599843906",
          "variantTable": {
            "34358599680066": {
              "id": 32612823990338,
              "title": "XS",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-XS",
              "inventory_item_id": 34358599680066
            },
            "34358599712834": {
              "id": 32612824023106,
              "title": "S",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-S",
              "inventory_item_id": 34358599712834
            },
            "34358599745602": {
              "id": 32612824055874,
              "title": "M",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-M",
              "inventory_item_id": 34358599745602
            },
            "34358599778370": {
              "id": 32612824088642,
              "title": "L",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-L",
              "inventory_item_id": 34358599778370
            },
            "34358599811138": {
              "id": 32612824121410,
              "title": "XL",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-XL",
              "inventory_item_id": 34358599811138
            },
            "34358599843906": {
              "id": 32612824154178,
              "title": "XXL",
              "product_id": 4759139057730,
              "sku": "ACSW80012B-XXL",
              "inventory_item_id": 34358599843906
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 34358599680066,
              "location_id": 87588878,
              "available": 2,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012B-XS"
            },
            {
              "inventory_item_id": 34358599712834,
              "location_id": 87588878,
              "available": 3,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012B-S"
            },
            {
              "inventory_item_id": 34358599745602,
              "location_id": 87588878,
              "available": 3,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012B-M"
            },
            {
              "inventory_item_id": 34358599778370,
              "location_id": 87588878,
              "available": 2,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012B-L"
            },
            {
              "inventory_item_id": 34358599811138,
              "location_id": 87588878,
              "available": 1,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012B-XL"
            },
            {
              "inventory_item_id": 34358599843906,
              "location_id": 87588878,
              "available": 4,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012B-XXL"
            }
          ]
        },
        {
          "id": 4759137976386,
          "title": "ZUMA TAN BIKINI TOP",
          "status": "active",
          "variants": [
            {
              "id": 32612822384706,
              "title": "XS",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-XS",
              "inventory_item_id": 34358598074434
            },
            {
              "id": 32612822417474,
              "title": "S",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-S",
              "inventory_item_id": 34358598107202
            },
            {
              "id": 32612822450242,
              "title": "M",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-M",
              "inventory_item_id": 34358598139970
            },
            {
              "id": 32612822483010,
              "title": "L",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-L",
              "inventory_item_id": 34358598172738
            },
            {
              "id": 32612822515778,
              "title": "XL",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-XL",
              "inventory_item_id": 34358598205506
            },
            {
              "id": 32612822548546,
              "title": "XXL",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-XXL",
              "inventory_item_id": 34358598238274
            }
          ],
          "variantsInvIds": "34358598074434, 34358598107202, 34358598139970, 34358598172738, 34358598205506, 34358598238274",
          "variantTable": {
            "34358598074434": {
              "id": 32612822384706,
              "title": "XS",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-XS",
              "inventory_item_id": 34358598074434
            },
            "34358598107202": {
              "id": 32612822417474,
              "title": "S",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-S",
              "inventory_item_id": 34358598107202
            },
            "34358598139970": {
              "id": 32612822450242,
              "title": "M",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-M",
              "inventory_item_id": 34358598139970
            },
            "34358598172738": {
              "id": 32612822483010,
              "title": "L",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-L",
              "inventory_item_id": 34358598172738
            },
            "34358598205506": {
              "id": 32612822515778,
              "title": "XL",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-XL",
              "inventory_item_id": 34358598205506
            },
            "34358598238274": {
              "id": 32612822548546,
              "title": "XXL",
              "product_id": 4759137976386,
              "sku": "ACSW80012T-XXL",
              "inventory_item_id": 34358598238274
            }
          },
          "locationTable": {
            "87588878": {
              "name": "Kittenish - CWC"
            },
            "35221864514": {
              "name": "Grapevine Warehouse"
            },
            "36982652994": {
              "name": "Kittenish Cafe"
            },
            "36982718530": {
              "name": "Kittenish Dallas"
            },
            "35655417922": {
              "name": "Kittenish Destin"
            },
            "35655385154": {
              "name": "Kittenish Nashville"
            },
            "60955983938": {
              "name": "Kittenish Scottsdale"
            },
            "36982784066": {
              "name": "Kittenish Tampa"
            },
            "36982685762": {
              "name": "New Jersey"
            },
            "36982751298": {
              "name": "Pop Up Location"
            },
            "36931240002": {
              "name": "Store Inventory at Warehouse"
            }
          },
          "inventoryLevels": [
            {
              "inventory_item_id": 34358598074434,
              "location_id": 87588878,
              "available": 2,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-XS"
            },
            {
              "inventory_item_id": 34358598107202,
              "location_id": 87588878,
              "available": 3,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-S"
            },
            {
              "inventory_item_id": 34358598139970,
              "location_id": 87588878,
              "available": 3,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-M"
            },
            {
              "inventory_item_id": 34358598172738,
              "location_id": 87588878,
              "available": 2,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-L"
            },
            {
              "inventory_item_id": 34358598205506,
              "location_id": 87588878,
              "available": 1,
              "location_name": "Kittenish - CWC",
              "variant_sku": "ACSW80012T-XL"
            }
          ]
        }
      ],
      "pageIdx": 115
    }
  ],
  "_importId": "623a615b60b74a226dbbdeea",
  "_connectionId": "622fbfc0d9a2a127ec618de5",
  "_flowId": "623a5f37c082530521e8b3b4",
  "_integrationId": "62326d004c899123a43217c9",
  "settings": {
    "integration": {},
    "flowGrouping": {},
    "flow": {},
    "import": {},
    "connection": {}
  }
}

const result = preMap(options);
console.log(result);