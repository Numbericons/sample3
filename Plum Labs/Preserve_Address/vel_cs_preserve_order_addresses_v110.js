/*  Author: Zachary Oliver
**  Version: v100
**  Date: 9/21/2022
*/

define(
  ["N/record", "N/log", "N/search"],
  function (record, log, search, dialog) {
    /**
    *@NApiVersion 2.1
    *@NScriptType clientScript
    */
    
    function entityChange(currentRecord) {
      var entity = currentRecord.getValue({
        fieldId: 'entity'
      });

      var address = currentRecord.getValue({
        fieldId: 'custbody_vel_preserve_ship_addr'
      });

      addAddressToCustomer(currentRecord, entity);

      log.audit('Setting default ship addr w/ id: ', address);
      
      // currentRecord.setValue({
      //   fieldId: 'defaultilshipaddrkey',
      //   value: address
      // });

      currentRecord.setValue({
        fieldId: 'shipaddresslist',
        value: address
      });
    }

    const addAddressToCustomer = (transaction, target) => {
        const stLogTitle = 'addAddressToCustomer';

        // let recShipAddress = transaction.getSubrecord({
        //     fieldId: 'shippingaddress'
        // });
        
        let ogEntity = transaction.getValue({
          fieldId: 'custbody_vel_preserve_entity'
        })
        
        let ogEntityRec = record.load({
          type: record.Type.CUSTOMER,
          id: ogEntity
        });

        log.debug('ogEntityRec : ', ogEntityRec);

        var addressId = transaction.getValue({
          fieldId: 'custbody_vel_preserve_ship_addr'
        });

        let line = ogEntityRec.findSublistLineWithValue({
            sublistId: 'addressbook',
            fieldId: 'id',
            value: addressId
        });

        log.debug('line : ', line);

        let originalAddr  = ogEntityRec.getSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress',
            line: line
        });

        log.debug('originalAddr : ', originalAddr);

        let objAddressDetails = getAddressSubrecord(originalAddr);
        log.debug({ title: stLogTitle, details: objAddressDetails });

        // if (objAddressDetails.custrecord_pli_add_address_to_cust == true) {
            let bhasDuplicate = checkDuplicates({
                address: objAddressDetails,
                customer: target
            });

            if (!bhasDuplicate) {
                const sublistId = 'addressbook';
                let recCustomer = record.load({
                    type: record.Type.CUSTOMER,
                    id: target,
                    isDynamic: true
                });
                recCustomer.selectNewLine({ sublistId });
                recCustomer.setCurrentSublistValue({
                    sublistId, fieldId: 'label', value: objAddressDetails.label
                });
                let subrecAddress = recCustomer.getCurrentSublistSubrecord({
                    sublistId, fieldId: 'addressbookaddress'
                });
                for (const [key, value] of Object.entries(objAddressDetails)) {
                    // if (key != 'addAddress' && value != "") subrecAddress.setValue(key, value);
                    if (value != "") subrecAddress.setValue(key, value);
                }
                recCustomer.commitLine({ sublistId });
                recCustomer.save({ ignoreMandatoryFields: true });
                log.audit({ title: stLogTitle, details: 'Customer address has been added' });
            }
        // }
    }

    const getAddressSubrecord = (recShipAddress) => {
      log.debug('getAddressSubrecord recShipAddress', recShipAddress);
        let objReturnValue = {};
        // objReturnValue.override = recShipAddress.getValue({
        //     fieldId: 'override'
        // });
        objReturnValue.override = false;
        objReturnValue.label = recShipAddress.getValue({
            fieldId: 'label'
        });
        objReturnValue.country = recShipAddress.getValue({
            fieldId: 'country'
        });
        objReturnValue.attention = recShipAddress.getValue({
            fieldId: 'attention'
        });
        objReturnValue.addressee = recShipAddress.getValue({
            fieldId: 'addressee'
        });
        objReturnValue.addr1 = recShipAddress.getValue({
            fieldId: 'addr1'
        });
        objReturnValue.addr2 = recShipAddress.getValue({
            fieldId: 'addr2'
        });
        objReturnValue.city = recShipAddress.getValue({
            fieldId: 'city'
        });
        objReturnValue.state = recShipAddress.getValue({
            fieldId: 'state'
        });
        objReturnValue.zip = recShipAddress.getValue({
            fieldId: 'zip'
        });
        objReturnValue.addrphone = recShipAddress.getValue({
            fieldId: 'addrphone'
        });
        objReturnValue.addrtext = recShipAddress.getValue({
            fieldId: 'addrtext'
        });
        objReturnValue.custrecord_pli_add_address_to_cust = recShipAddress.getValue({
            fieldId: 'custrecord_pli_add_address_to_cust'
        });
        log.debug('getAddressSubrecord', objReturnValue);

        return objReturnValue;
    }

    const checkDuplicates = ({ address, customer }) => {
        let bReturnValue = false;
        search.create({
            type: 'customer',
            filters: [
                [ 'internalid', search.Operator.ANYOF, customer ],
                'AND',
                [ 'address.attention', search.Operator.IS, address.attention ],
                'AND',
                [ 'address.addressee', search.Operator.IS, address.addressee ],
                'AND',
                [ 'address.addressphone', search.Operator.IS, address.addrphone ],
                'AND',
                [ 'address.address1', search.Operator.IS, address.addr1 ],
                'AND',
                [ 'address.address2', search.Operator.IS, address.addr2 ],
                'AND',
                [ 'address.zipcode', search.Operator.IS, address.zip ],
                'AND',
                [ 'address.city', search.Operator.IS, address.city ],
                'AND',
                [ 'address.state', search.Operator.ANYOF, address.state ],
                'AND',
                [ 'address.country', search.Operator.ANYOF, address.country ],
                // 'AND',
                // [ 'address.address', search.Operator.IS, address ]
            ],
            columns:
                [
                    search.createColumn({
                        name: 'addressinternalid',
                        join: 'Address'
                    })
                ]
        }).run().each(function(result){
            let stAddressId = result.getValue({
                name: 'addressinternalid',
                join: 'Address'
            });

            bReturnValue = true;
        });

        log.debug({ title: 'checkDuplicates', details: bReturnValue });
        return bReturnValue;
    }

    function fieldChanged(context) {
      var currentRecord = context.currentRecord;

      if (context.fieldId === 'entity') {
        console.log('fieldId (entity) match!')
        entityChange(currentRecord);
      };
    }

    return {
      fieldChanged: fieldChanged
    };
  }
);