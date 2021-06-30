const confirmData = {
    componentsData: [],
    changesToPrice: false,
    updatedPdfUrl: 'url'

};


function togglePriceChangesPanel() {

    let hidden = cd.getRange('D16');

    if (hidden.getValue()) {

        co.showColumns(12,8);
        hidden.setValue(false);


    } else {

        co.hideColumns(12,8);
        hidden.setValue(true);

    }

}

function boolConfirmChangesToPrice() {

    let poChanges = cd.getRange('D30').getValue();

    return poChanges;

}

function pullConfirmPoComponents() {

    let count = ca.getRange('C4').getValue();
    let rawData = ca.getRange('C6:Q' + (5 + count)).getValues();
    let poNumber = cd.getRange('D4').getValue();

    let data = rawData.filter(function(line) {
        return line[3] === poNumber;
    });

    confirmData.componentsData.push(data);

}

function pullConfirmPriceChangesItemsArray() {

    let count = cd.getRange('S3').getValue();
    let array = cd.getRange('U5:Y' + (4 + count)).getValues();

    return array;

}

function pullConfirmUpdateComponentsArray() {

    let count = cd.getRange('S3').getValue();
    let array = cd.getRange('S5:AA' + (4 + count)).getValues();

    return array;

}

function buildConfirmPoComponents() {

    
    let i = 0;
    let data = [];

    while (i < confirmData.componentsData.flat(1).length) {

        let cid = confirmData.componentsData.flat(1)[i][1];
        let name = confirmData.componentsData.flat(1)[i][2];
        let quantity = confirmData.componentsData.flat(1)[i][6];
        let uom = confirmData.componentsData.flat(1)[i][7];
        let unitPrice = confirmData.componentsData.flat(1)[i][8];
        let total = confirmData.componentsData.flat(1)[i][9];

        data.push([cid, name, quantity, uom, unitPrice]);
        i++;
    }

    return data;

}



function buildConfirmPoComponentsPoCid() {

    let poCidArray = confirmData.componentsData.flat(1).map(x => [x[0]]);

    return poCidArray;

}

function buildConfirmPoUpdatedItemsArray() {

    let array = pullConfirmPriceChangesItemsArray();
    let i = 0;
    while (i < array.length) {

        array[i].splice(1,0,null,null);
        i++;
    }

    return array;
}

function injectConfirmPoComponets() {

    let data = buildConfirmPoComponents();
    let range = CoffeeMaki.dropZoneRangeAlt(co, 'M', 'Q', 6, 'M4', data.length);
    range.setValues(data);

}

function injectConfirmPoComponentsPoCid() {

    let data = buildConfirmPoComponentsPoCid();
    let range = CoffeeMaki.dropZoneRangeAlt(cd, 'S', 'S', 5, 'S3', data.length);
    range.setValues(data);

}

function injectConfirmPoGeneratorData() {
    
    //set up 
    clearPo();
    brandingSwitcher(); // this isn't atomic so if it gets made then i might need to switch it around

    // declare variables

    let items = buildConfirmPoUpdatedItemsArray();

    let modifiedTotal = cd.getRange('D18').getValue();
    
    let timestamp = new Date();
    let poNumber = cd.getRange('D4').getValue();

    let contactName = cd.getRange('D23').getValue();
    let supplierName = cd.getRange('D6').getValue();
    let addressOne = cd.getRange('D25').getValue();
    let addressTwo = cd.getRange('D27').getValue();

    let poNumberField = poNumber + '-Modified';

    // setting po sections

    po.getRange('F8').setValue(poNumberField);
    po.getRange('C9').setValue(timestamp);
    po.getRange('F12').setValue(contactName);
    po.getRange('F13').setValue(supplierName);
    po.getRange('F14').setValue(addressOne);
    po.getRange('F15').setValue(addressTwo);
    
    po.getRange('B19:H' + (18 + items.length)).setValues(items);
    po.getRange('H34').setValue(modifiedTotal);
    po.getRange('H36').setValue(modifiedTotal);


}

function generateConfirmPurchaseOrderPdf() {

    const url = 'https://docs.google.com/spreadsheets/d/1WeTE2wNwBykh4kWQYloRqqE4fqWdXXDsLUcDHdmoyho/export?';

    let poNumber = cd.getRange('D4').getValue();
    let company = cd.getRange('D6').getValue();

    let filename = 'PO# ' + poNumber + '-Modified' + ' - ' + company;

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

    let documentUrl = document.getUrl();

    confirmData.updatedPdfUrl = documentUrl;
   
}

function updateConfirmPoArchiveNoChanges() {

    let pa = ss.getSheetByName('PO Archive');
    let poNumber = cd.getRange('D4').getValue().toString();
    let row = CoffeeMaki.determineRowExternalSheet(pa, 'C6:C', 6, poNumber);
    let status = 'Confirmed';

    pa.getRange('J' + row).setValue(status);

}

function updateConfirmPoArchiveWithChanges() {

    let pa = ss.getSheetByName('PO Archive');
    let poNumber = cd.getRange('D4').getValue().toString();
    let row = CoffeeMaki.determineRowExternalSheet(pa, 'C6:C', 6, poNumber);
    
    let modifiedTotal = cd.getRange('D18').getValue();
    let status = 'Confirmed';
    let pdfFormula = `=HYPERLINK(\"${confirmData.updatedPdfUrl}\",IMAGE(\"https://i.imgur.com/8GbOraM.png\"))`;

    pa.getRange('G' + row).setValue(modifiedTotal);
    pa.getRange('J' + row).setValue(status);
    pa.getRange('K' + row).setValue(pdfFormula);

}

function updateConfirmPoComponentsArchiveNoChanges() {

    pullConfirmPoComponents();
    let data = confirmData.componentsData.flat(1);
    let i = 0;
    
    while (i < data.length ) {

        let poCid = data[i][0];
        let row = CoffeeMaki.determineRowExternalSheet(ca, 'C6:C', 6, poCid);
        let status = 'Confirmed';

        ca.getRange('R' + row).setValue(status);
        i++;
    }

}

function updateConfirmPoComponentsArchiveWithChanges() {

    let data = pullConfirmUpdateComponentsArray();
    let timestamp = new Date();
    let i = 0;
    
    while (i < data.length) {

        let poCid = data[i][0];
        let updateQuantity = data[i][3];
        let updatePrice = data[i][5];
        let updateTotal = data[i][6];
        let ogQuantity = data[i][7];
        let ogPrice = data[i][8];
        let ogTotal = ogQuantity * ogPrice;


        let row = CoffeeMaki.determineRowExternalSheet(ca, 'C6:C', 6, poCid);
        let ogArchiveNote = ca.getRange('Q' + row).getValue();

        let updateNote;

        if (updateQuantity !== ogQuantity || updatePrice !== ogPrice) {

            updateNote = 
                ogArchiveNote +
                ' ; Changes during confirmation: ' + 
                'Quantity [ ' + ogQuantity + ' to ' + updateQuantity + ' ] ' +
                'Unit Price [ ' + ogPrice + ' to ' + updatePrice + ' ] ' +
                'Total [' + ogTotal + ' to '+ updateTotal + ' ] ' + 
                'Updated on: ' + timestamp;

        } else {

            updateNote = ogArchiveNote + ' ; Did not change during PO Confirmation Changes';

        }

        // updates

        ca.getRange('I' + row).setValue(updateQuantity);
        ca.getRange('K' + row).setValue(updatePrice);
        ca.getRange('L' + row).setValue(updateTotal);
        ca.getRange('Q' + row).setValue(updateNote);
        ca.getRange('R' + row).setValue('Confirmed');


        i++;

    }

}

function executePriceChangeInitiation() {

    // shows the price changes panel
    togglePriceChangesPanel();

    // execution of relevant functions
    pullConfirmPoComponents(); // saves data to object
    injectConfirmPoComponets();
    injectConfirmPoComponentsPoCid();

    // set changes to price boolean

    confirmData.changesToPrice = true;
    cd.getRange('D30').setValue(true);


}

function executePoConfirmCommit() {

    if (boolConfirmChangesToPrice()) {

        executeConfirmCommitWithChanges();

    } else {

        executeConfirmCommitNoChanges();

    }


}

function executeConfirmCommitNoChanges() {

    updateConfirmPoArchiveNoChanges();
    updateConfirmPoComponentsArchiveNoChanges() 

    clearConfirmForm();

}

function executeConfirmCommitWithChanges() {

    injectConfirmPoGeneratorData();
    generateConfirmPurchaseOrderPdf();
    updateConfirmPoComponentsArchiveWithChanges();
    updateConfirmPoArchiveWithChanges();

    clearPo()
    clearConfirmForm();


}

function clearConfirmForm() {

    clearConfirmPoComponets();
    clearConfirmPoData();
    
    let priceChangePanelHidden = cd.getRange('D16').getValue();
    if (!priceChangePanelHidden) {
        togglePriceChangesPanel();
    }
    
}

function clearConfirmPoComponets() {

    co.getRange('C6').clearContent();
    co.getRange('M6:Q').clearContent();

}

function clearConfirmPoData() {

    cd.getRange('S5:S').clearContent();
    cd.getRange('D30').setValue(false);

}



