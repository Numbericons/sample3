function process(email) {

    const IS_PRODUCTION = true;

    const valid_types = [
        'APPCACHE',
        'AUTOCAD',
        'BMPIMAGE',
        'CERTIFICATE',
        'CONFIG',
        'CSV',
        'EXCEL',
        'FLASH',
        'FREEMARKER',
        'GIFIMAGE',
        'GZIP',
        'HTMLDOC',
        'ICON',
        'JAVASCRIPT',
        'JPGIMAGE',
        'JSON',
        'MESSAGERFC',
        'MP3',
        'MPEGMOVIE',
        'MSPROJECT',
        'PDF',
        'PJPGIMAGE',
        'PLAINTEXT',
        'PNGIMAGE',
        'POSTSCRIPT',
        'POWERPOINT',
        'QUICKTIME',
        'RTF',
        'SCSS',
        'SMS',
        'STYLESHEET',
        'SVG',
        'TAR',
        'TIFFIMAGE',
        'VISIO',
        'WEBAPPPAGE',
        'WEBAPPSCRIPT',
        'WORD',
        'XMLDOC',
        'XSD',
        'ZIP',
    ]

    //Print out FROM email address
    nlapiLogExecution('debug', 'From Email Address', email.getFrom());

    //Print out TO email address
    nlapiLogExecution('debug', 'To Email Address', email.getTo());

    //Print out CC email Addresses
    nlapiLogExecution('debug', 'CC Email Addresses', email.getCc());

    //Print out Reply To Email Address
    nlapiLogExecution('debug', 'Reply To Address', email.getReplyTo());

    //Print out Email Sent Date
    nlapiLogExecution('debug', 'Send Date', email.getSentDate());

    //Print out Email Subject
    nlapiLogExecution('debug', 'Email Subject', email.getSubject());

    //Print out Email TEXT Body
    nlapiLogExecution('debug', 'Email Text Body', email.getTextBody());

    //Print out Email HTML Body
    nlapiLogExecution('debug', 'Email HTML Body', email.getHtmlBody());

    var newRec = nlapiCreateRecord('lead');
    newRec.setFieldValue('customform', 99); //99 is the internal ID for the form - change if needed
    newRec.setFieldValue('firstname', "Needs");
    newRec.setFieldValue('lastname', "Updating");
    //newRec.setFieldValue('companyname', (email.getSubject().substring(0,83)));
    //newRec.setFieldValue('custentity3', email.getTextBody());
    //newRec.setFieldValue('territory', -5); //temporary
    //newRec.setFieldValue('companyname', (email.getSubject().substring(0,83)));
    newRec.setFieldText('leadsource', 'Vendor');
    newRec.setFieldValue('subsidiary', 1);
    newRec.setFieldValue('custentity_lead_email_subject', email.getSubject());
    newRec.setFieldValue('custentity_vel_ven_lead_email', email.getHtmlBody());

    //Search existing Vendors
    var vendorSearch = nlapiSearchRecord("vendor", null,
        [
            ["custentity_ns_ccefi_lead_email", "is", email.getFrom()]
        ],
        [
            new nlobjSearchColumn("internalid")
        ]
    );
    var vendor = '';

    for (var i = 0; vendorSearch != null && i < vendorSearch.length; i++) {
        var searchresult = vendorSearch[i];
        vendor += searchresult.getValue('internalid');

        //If Vendor match is found, submit to Vendor field
        if (vendor) {
            newRec.setFieldValue('custentity_ccefi_ref_vendor', vendor)
        }
    }

    var newRec_id = nlapiSubmitRecord(newRec, true);
    //Attach files
    var attachments = email.getAttachments();

    var processing_notes = '';

    for (var indexAtt in attachments) {
        var attachment = attachments[indexAtt];
        nlapiLogExecution('DEBUG', 'Attachment: ' + attachment.getName() + ', ' + attachment.getType());

        // If the file name does not have an extension, skip it
        var fileName = attachment.getName();
        if (fileName.indexOf('.') <= 0) continue;

        // add a unique suffix to the file name, but leave the extension as-is
        var fileArray = fileName.split('.');
        var newName = '';
        for (var i = 0; i < fileArray.length; i++) {
            if (i == fileArray.length - 1) {
                newName += ('_' + (new Date().valueOf()).toString());
            }
            newName += ('.' + fileArray[i]);
        }

        // Lookup the file type to see if it is supported, else save as PLAINTEXT
        // This really won't affect being able to open and download the file.
        // It only affects filtering files by type.
        var file_type = attachment.getType().toUpperCase();
        if (valid_types.filter(function (p) { return p == file_type }).length == 0) {
            file_type = 'PLAINTEXT';  // Import nonrecognized file types as Other Binary File
        }

        var file = nlapiCreateFile(newName, file_type, attachment.getValue());

        // Save the file under a selected folder in the file cabinet
        file.setFolder(23835); //Internal ID of folder to hold imported attachments
        var file_id = nlapiSubmitFile(file);

        // Attach the file to a custom record type
        nlapiAttachRecord('file', file_id, 'lead', newRec_id);
    }

}