//change origFileDef variable with your export's file defs, then run this and it will produce a new file defs with the same defs but for import
// (script at bottom)

const fs = require('fs');

let origFileDef = {
    "resourcePath": "",
    "fileDefinition": {
        "_id": "61fdffaca147eb54b2baf86f",
        "lastModified": "2022-02-05T04:40:12.059Z",
        "name": "Walmart EDI 850",
        "description": "Purchase Order",
        "version": "1",
        "format": "delimited/x12",
        "delimited": {
            "rowSuffix": "~",
            "rowDelimiter": "\n",
            "colDelimiter": "*"
        },
        "rules": [
            {
                "maxOccurrence": 1,
                "required": true,
                "skipRowSuffix": true,
                "elements": [
                    {
                        "name": "ISA",
                        "value": "ISA"
                    },
                    {
                        "name": "Authorization Information Qualifier",
                        "value": "ISA01"
                    },
                    {
                        "name": "Authorization Information",
                        "value": "ISA02"
                    },
                    {
                        "name": "Security Information Qualifier",
                        "value": "ISA03"
                    },
                    {
                        "name": "Security Information",
                        "value": "ISA04"
                    },
                    {
                        "name": "Interchange ID Qualifier",
                        "value": "ISA05"
                    },
                    {
                        "name": "Interchange Sender ID",
                        "value": "ISA06"
                    },
                    {
                        "name": "Interchange ID Qualifier(ISA07)",
                        "value": "ISA07"
                    },
                    {
                        "name": "Interchange Receiver ID",
                        "value": "ISA08"
                    },
                    {
                        "name": "Interchange Date",
                        "value": "ISA09"
                    },
                    {
                        "name": "Interchange Time",
                        "value": "ISA10"
                    },
                    {
                        "name": "Repetition Separator",
                        "value": "ISA11"
                    },
                    {
                        "name": "Interchange Control Version Number",
                        "value": "ISA12"
                    },
                    {
                        "name": "Interchange Control Number",
                        "value": "ISA13"
                    },
                    {
                        "name": "Acknowledgment Requested",
                        "value": "ISA14"
                    },
                    {
                        "name": "Interchange Usage Indicator",
                        "value": "ISA15"
                    },
                    {
                        "name": "Component Element Separator",
                        "value": "ISA16"
                    }
                ],
                "children": [
                    {
                        "maxOccurrence": 1,
                        "required": true,
                        "skipRowSuffix": true,
                        "elements": [
                            {
                                "name": "GS",
                                "value": "GS"
                            },
                            {
                                "name": "Functional Identifier Code",
                                "value": "GS01"
                            },
                            {
                                "name": "Application Sender's Code",
                                "value": "GS02"
                            },
                            {
                                "name": "Application Receiver's Code",
                                "value": "GS03"
                            },
                            {
                                "name": "Date",
                                "value": "GS04"
                            },
                            {
                                "name": "Time",
                                "value": "GS05"
                            },
                            {
                                "name": "Group Control Number",
                                "value": "GS06"
                            },
                            {
                                "name": "Responsible Agency Code",
                                "value": "GS07"
                            },
                            {
                                "name": "Version / Release / Industry Identifier Code",
                                "value": "GS08"
                            }
                        ],
                        "children": [
                            {
                                "maxOccurrence": 1,
                                "required": true,
                                "skipRowSuffix": true,
                                "elements": [
                                    {
                                        "name": "ST",
                                        "value": "ST"
                                    },
                                    {
                                        "name": "Transaction Set Identifier Code",
                                        "value": "ST01"
                                    },
                                    {
                                        "name": "Transaction Set Control Number",
                                        "value": "ST02"
                                    }
                                ],
                                "children": [
                                    {
                                        "maxOccurrence": 1,
                                        "required": true,
                                        "skipRowSuffix": true,
                                        "elements": [
                                            {
                                                "name": "BMG",
                                                "value": "BMG"
                                            },
                                            {
                                                "name": "Transaction Set Purpose Code (BMG01)",
                                                "value": "BMG01"
                                            },
                                            {
                                                "name": "Description (BMG02)",
                                                "value": "BMG02"
                                            },
                                            {
                                                "name": "Transaction Type Code (BMG03)",
                                                "value": "BMG03"
                                            }
                                        ],
                                        "children": [
                                            {
                                                "name": "N1",
                                                "maxOccurrence": 1000,
                                                "container": true,
                                                "children": [
                                                    {
                                                        "required": false,
                                                        "skipRowSuffix": true,
                                                        "elements": [
                                                            {
                                                                "name": "N1",
                                                                "value": "N1"
                                                            },
                                                            {
                                                                "name": "Entity Identifier Code",
                                                                "value": "N101"
                                                            },
                                                            {
                                                                "name": "Name",
                                                                "value": "N102"
                                                            },
                                                            {
                                                                "name": "Identifier Code Qualifier",
                                                                "value": "N103"
                                                            },
                                                            {
                                                                "name": "Identifier Code",
                                                                "value": "N104"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "name": "REF",
                                                "maxOccurrence": 1000,
                                                "container": true,
                                                "children": [
                                                    {
                                                        "required": false,
                                                        "skipRowSuffix": true,
                                                        "elements": [
                                                            {
                                                                "name": "REF",
                                                                "value": "REF"
                                                            },
                                                            {
                                                                "name": "Reference Identification Qualifier",
                                                                "value": "REF01"
                                                            },
                                                            {
                                                                "name": "Reference Identification",
                                                                "value": "REF02"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "name": "MIT",
                                                "maxOccurrence": 5,
                                                "container": true,
                                                "children": [
                                                    {
                                                        "required": false,
                                                        "skipRowSuffix": true,
                                                        "elements": [
                                                            {
                                                                "name": "MIT",
                                                                "value": "MIT"
                                                            },
                                                            {
                                                                "name": "Reference Identification",
                                                                "value": "MIT01"
                                                            },
                                                            {
                                                                "name": "Description",
                                                                "value": "MIT02"
                                                            },
                                                            {
                                                                "name": "Page Width",
                                                                "value": "MIT03"
                                                            },
                                                            {
                                                                "name": "Page Length Lines",
                                                                "value": "MIT04"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "name": "MSG",
                                                "maxOccurrence": 10,
                                                "container": true,
                                                "children": [
                                                    {
                                                        "required": false,
                                                        "skipRowSuffix": true,
                                                        "elements": [
                                                            {
                                                                "name": "MSG",
                                                                "value": "MSG"
                                                            },
                                                            {
                                                                "name": "Free-Form Message Text",
                                                                "value": "MSG01"
                                                            },
                                                            {
                                                                "name": "Printer Carriage Control Code",
                                                                "value": "MSG02"
                                                            },
                                                            {
                                                                "name": "Number",
                                                                "value": "MSG03"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "closeRule": {
                                    "maxOccurrence": 1,
                                    "required": true,
                                    "skipRowSuffix": true,
                                    "elements": [
                                        {
                                            "name": "SE",
                                            "value": "SE"
                                        },
                                        {
                                            "name": "Number of Included Segments",
                                            "value": "SE01"
                                        },
                                        {
                                            "name": "Transaction Set Control Number(SE02)",
                                            "value": "SE02"
                                        }
                                    ]
                                }
                            }
                        ],
                        "closeRule": {
                            "maxOccurrence": 1,
                            "required": false,
                            "skipRowSuffix": true,
                            "elements": [
                                {
                                    "name": "GE",
                                    "value": "GE"
                                },
                                {
                                    "name": "Number of Transaction Sets Included",
                                    "value": "GE01"
                                },
                                {
                                    "name": "Group Control Number(GE02)",
                                    "value": "GE02"
                                }
                            ]
                        }
                    }
                ],
                "closeRule": {
                    "maxOccurrence": 1,
                    "required": false,
                    "skipRowSuffix": true,
                    "elements": [
                        {
                            "name": "IEA",
                            "value": "IEA"
                        },
                        {
                            "name": "Number of Included Functional Groups",
                            "value": "IEA01"
                        },
                        {
                            "name": "Interchange Control Number(IEA02)",
                            "value": "IEA02"
                        }
                    ]
                }
            }
        ]
    }
}

function convertDefs(origFileDef) {
    for (let i in origFileDef.fileDefinition.rules) {
        if (origFileDef.fileDefinition.rules[i].elements) {
            for (let j = 1; j < origFileDef.fileDefinition.rules[i].elements.length; j++) {
                origFileDef.fileDefinition.rules[i].elements[j].value = '{{[' + origFileDef.fileDefinition.rules[i].elements[j].value + ']}}'
            }
        }
        if (origFileDef.fileDefinition.rules[i].children) {
            for (let j in origFileDef.fileDefinition.rules[i].children) {
                cleanChildren(origFileDef.fileDefinition.rules[i].children[j])
            }
        }
        if (origFileDef.fileDefinition.rules[i].closeRule) {
            cleanChildren(origFileDef.fileDefinition.rules[i].closeRule)
        }
    }
    return origFileDef
}


function cleanChildren(arr) {
    //if container is marked, we want a relativeDataPath with first element
    if (arr.container) {
        arr.relativeDataPath = arr.children[0].elements[0].name
    }
    for (let k in arr.elements) {
        //first element should never have handlebars
        if (k == 0) {
            continue;
        }
        arr.elements[k].value = '{{[' + arr.elements[k].value + ']}}'
    }
    let nextChild = true
    while (nextChild) {
        if (arr.children) {
            let childArr = arr.children
            for (let l in childArr) {
                cleanChildren(childArr[l])
            }
        }
        nextChild = false
    }
    if (arr.closeRule) {
        cleanChildren(arr.closeRule)
    }
}

const newData = JSON.stringify(convertDefs(origFileDef))

fs.writeFileSync('updatedEDI' + origFileDef.fileDefinition.name + '.json', newData);