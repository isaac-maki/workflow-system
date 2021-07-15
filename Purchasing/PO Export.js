const ds = ss.getSheetByName('.data');
const global = {
    poUrl: 'url',
    coffee: 'Good'
};

function poGenerator() {
    
    // remember there is also a commit version of this because i fucked up and didn't make it atomic.


    clearPo();
    brandingSwitcher();
    
    //declaring po element variables
    let items = poItemsPull();
    Logger.log(items);
    let companyInfo = poSupplierPull();
    let poNumber = ds.getRange('D20').getValue();
    let timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/YYYY hh:mm");
    let notes = staging.getRange('Q20:Q' + (19 + ds.getRange('D28').getValue())).getValues();
    let totals = ds.getRange('D22').getValue();

    // setting po sections
    po.getRange('F8').setValue(poNumber);
    po.getRange('C9').setValue(timestamp);
    po.getRange('F12:F15').setValues(companyInfo);
    po.getRange('B19:H' + (18 + items.length)).setValues(items);
    po.getRange('H34').setValue(totals);
    po.getRange('H36').setValue(totals);
    po.getRange('B35:B' + (34 + notes.length)).setValues(notes);



}

function clearPo() {

    po.getRange('B19:H31').clearContent();
    po.getRange('B35:B42').clearContent();
    

}

function brandingSwitcher() {

    // remember there is also a confirm version of this because i fucked up and didn't make it atomic.

    let currentCompany = ds.getRange('D24').getValue();
    let selectedCompany = ds.getRange('D26').getValue();

    if (currentCompany !== selectedCompany) {
        // ice box until requested again
        switch (selectedCompany) {
            case 'Maki Creations':
                //do the things
                Logger.log('Maki Selected');
                break;
            case 'Essentials by Catalina':
                // do the things
                Logger.log('EBC Selected');
                break;
            default:
                Logger.log('Something went wrong');
                break;
        }

    } else {
        Logger.log('Company does not need to be switched.')
    }

}

function poItemsPull() {

    let count = staging.getRange('C5').getValue();
    let itemNames = staging.getRange('E7:E' + (6 + count)).getValues();
    let itemPricing = staging.getRange('J7:M' + (6 + count)).getValues();

    let itemsArray = [];
    let i = 0;
    while (i < itemPricing.length) {

        itemsArray.push([itemNames[i][0], null, null, itemPricing[i][1], itemPricing[i][2], itemPricing[i][0], itemPricing[i][3]]);
        i++;

    }
    return itemsArray;
}

function poSupplierPull() {
     
    let name = ds.getRange('D10').getValue();
    let contact = ds.getRange('D11').getValue();
    let addy1 = ds.getRange('D13').getValue();
    let addy2 = ds.getRange('D14').getValue();


    let supplierInfo = [[name], [contact], [addy1], [addy2]];
    return supplierInfo;

}

function compilePurchaseOrderPdf() {

    const url = 'https://docs.google.com/spreadsheets/d/1WeTE2wNwBykh4kWQYloRqqE4fqWdXXDsLUcDHdmoyho/export?';

    let poNumber = ds.getRange('D20').getValue();
    let company = ds.getRange('D10').getValue();

    let filename = 'PO# ' + poNumber + ' - ' + company;

    // PDF Options

    pdfOptions =
        'exportFormat=pdf&format=pdf' +
        '&size=letter' +
        '&portrait=true' +
        '&fitw=true' +
        '&top_margin=0.20' +            
        '&bottom_margin=0.20' +         
        '&left_margin=0.20' +        
        '&right_margin=0.20' + 
        '&sheetnames=false&printtitle=false' +
        '&pagenumbers=false&gridlines=false' +
        '&fzr=false' +
        '&gid=1570916177';
    
    // PDF parameters 

    var params = {method:"GET",headers:{"authorization":"Bearer "+ ScriptApp.getOAuthToken()}};

    // PDF generation
    
    var response = UrlFetchApp.fetch(url+pdfOptions, params).getBlob();

    // File parameters
    var folder = DriveApp.getFolderById('1bP_kgfXePGb63bD0NK2Jdoo88xiZXpFn'); 

    // Save file to google drive
    let document = folder.createFile(response.setName(filename));

    sendPurchaseOrderEmail(response);

    let documentUrl = document.getUrl();

    global.poUrl = documentUrl;
   
}

function sendPurchaseOrderEmail(blob) {

    // gets the actual emails in the format of 'xx@email.com;yy@email.com';
    let emailsRaw = ds.getRange('D12').getValue();

    // splits the email using ; as separator
    let emails = emailsRaw.split(';');
    let email = emails[0];
    let ccEmail = emails[1];

    // send emails 
   

    let poNumber = ds.getRange('D20').getValue();
    let subject = 'Purchase Order #' + poNumber;
    let contact = ds.getRange('D11').getValue();
    let body = 'Hello ' + contact + ', <br>' + '<p> Attached you will find the Purchase Order #' + poNumber + '. Please respond with confirmation. </p>';

    GmailApp.sendEmail(email, subject, body, {
        htmlBody: body,
        cc: ccEmail,
        attachments: [{
              fileName: "PO# "+ poNumber + ".pdf",
              content: blob.getBytes(),
              mimeType: "application/pdf"
          }]
      });

}
