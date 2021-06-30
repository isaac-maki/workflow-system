function additionsComponents()
{   
    // Declaration of sheets
    let ad = ss.getSheetByName("Additions");
    let li = ss.getSheetByName(".lists");

    // This is linking cell data to variables
    let cid = ad.getRange("D4");
    let cidExists = ad.getRange("D6").getValue();
    let name = ad.getRange("D8");
    let uom = ad.getRange("D10");

    // CID Prefix Checking
    
    let countPrefix = li.getRange("H3").getValue();
    
    let prefixes = li.getRange("H5:H" + (5 + countPrefix - 1)).getValues().flat(); // gets the values and flattens the array. i.e., [[1],[2]] becomes [1,2]. This is needed to work with the includes.
    let cidPrefix = cid.getValue().toString().replace(/[0-9]/g,''); // removes numbers to get only prefix.
    prefixBool = prefixes.includes(cidPrefix);
 


    // 

    if (cid.isBlank() || name.isBlank() || uom.isBlank()) {
        ui.alert('It looks like some of the form isn\'t filled out. Please try again.');
    } else if (cidExists == "CID Already Exists") {
        ui.alert('Please choose a CID that does not already exist.');
    } else if (prefixBool == false) {
        ui.alert('It appears your SKU prefix isn\'t standard \(e.g., EO, FO, BASE\). Please try again.');
    } else {

        executeAddition();
       
    }
}

function toggleBulkAdditions() {

    let data = ss.getSheetByName('Additions');
    let hidden = data.getRange('I1');

    if (hidden.getValue()) {

        data.showColumns(8,7);
        hidden.setValue(false);


    } else {

        data.hideColumns(8,7);
        hidden.setValue(true);

    }

}


function toggleImportPrice() {

    let data = ss.getSheetByName('Additions');
    let hidden = data.getRange('Y1');

    if (hidden.getValue()) {

        data.showColumns(24,7);
        hidden.setValue(false);


    } else {

        data.hideColumns(24,7);
        hidden.setValue(true);

    }

}

function toggleBulkInventoryTransactions() {

    let data = ss.getSheetByName('Additions');
    let hidden = data.getRange('Q1');

    if (hidden.getValue()) {

        data.showColumns(16,6);
        hidden.setValue(false);


    } else {

        data.hideColumns(16,6);
        hidden.setValue(true);

    }

}

function bulkAdditions() {

    // Declaration of sheets
    let ad = ss.getSheetByName("Additions");

    let importArray = ad.getRange('I5:M' + (4 + ad.getRange('I3').getValue())).getValues();

    let notes = Session.getActiveUser() + ' Initialized'


    let i = 0;
    while (i < importArray.length) {

        let cid = importArray[i][0];
        let name = importArray[i][1];
        let lowerLimit = importArray[i][2];
        let uom = importArray[i][3];
        let cidExists = importArray[i][4];

        if (validateCidPrefix(cid) && cidExists === 'CID Available') {

            bulkAdditionComponents(cid, name, lowerLimit, uom);
            initializeComponentEntry(cid, 0, 'Initialization', 1, notes);

        } else {

            ui.alert('It looks like ' + cid + ' had a few errors and was skipped. Make sure that the CID prefix (i.e., EO, FO, RAW, etc) is on the approved list or that the CID is not taken.');

        }

        i++;
    }
   
    CoffeeMaki.rangeSort(ss.getSheetByName('Inventory'), 'C', 'L', 6, 'C4');
    CoffeeMaki.rangeSort(ss.getSheetByName('Components'), 'C', 'J', 5, 'C3');
    ad.getRange('I5:L').clearContent();
}

function validateCidPrefix(cid) {

    let li = ss.getSheetByName(".lists");

    let countPrefix = li.getRange("H3").getValue();

    let prefixes = li.getRange("H5:H" + (5 + countPrefix - 1)).getValues().flat(); 
    let cidPrefix = cid.toString().replace(/[0-9]/g,''); // removes numbers to get only prefix.
    prefixBool = prefixes.includes(cidPrefix);
    return prefixBool;

}


function executeAddition() {

    additionComponents();
    additionInitializeExecution();
    sortInitRanges();
    clearForms();

}

function additionInitializeExecution() {
    
    let ad = ss.getSheetByName("Additions");
    let cid = ad.getRange('D4').getValue();
    let notes = Session.getActiveUser() + ' Initialized';

    initializeComponentEntry(cid, 0, 'Initialization', 1, notes);

}

function sortInitRanges() {
    let inv = ss.getSheetByName('Inventory');
    let trans = ss.getSheetByName('Transactions');

    CoffeeMaki.rangeSort(inv, 'C', 'L', 6, 'C4');
    CoffeeMaki.rangeSort(trans, 'C', 'J', 5, 'C3');

}

function bulkAdditionComponents(cid, name, lowerLimit, uom) {
    
    // Declaration of sheets
    let comps = ss.getSheetByName('Components')


    // Delivery of payload
    
    let payload = [[cid, name, null, uom, lowerLimit, null, null]];
    
    let dropZone = CoffeeMaki.dropZoneRange(comps,"C","I",1);
    dropZone.setValues(payload);
    dropZone.setBorder(true,true,true,true,true,null,'#ffffff',null);
    CoffeeMaki.rangeSort(comps, 'C', 'K', 5, 'C3');


}

function additionComponents() {
    
    // Declaration of sheets
    let ad = ss.getSheetByName("Additions");
    let comps = ss.getSheetByName('Components')

    // This is linking cell data to variables
    let cid = ad.getRange("D4").getValue();
    let name = ad.getRange("D8").getValue();
    let uom = ad.getRange("D10").getValue();
    let lowerLimit = ad.getRange('D12').getValue();
    
    // Delivery of payload
    
    let payload = [];
    payload.push([cid, name, null, uom, lowerLimit, null, null]);
    
    let dropZone = CoffeeMaki.dropZoneRange(comps,"C","I",1);
    dropZone.setValues(payload);
    dropZone.setBorder(true,true,true,true,true,null,'#ffffff',null);


}

function clearForms() {
    // clear forms here
    let ad = ss.getSheetByName("Additions");

    ad.getRange('D4').clearContent();
    ad.getRange('D8').clearContent();
    ad.getRange('D12').clearContent();

}



function initializeComponentEntry(cid, amount = 0, info, type = 1, note) {
    // type = 1 is for adding 
    // type = -1 is for removing

    let inv = ss.getSheetByName('Inventory');
    let trans = ss.getSheetByName('Transactions');
    
    let timestamp = new Date();
    let lot = CoffeeMaki.lotGenerator(cid, timestamp);
    let typeModifier;
    if (type === 1) {
        typeModifier = 'Add ( + )';
    } else {
        typeModifier = 'Remove ( - )';
    }
  

    // inventory payload drop
    let inventoryPayload = [[cid, null, lot, info, null, null, null, null, null, null]];
    let dropZoneInventory = CoffeeMaki.dropZoneRange(inv,'C', 'L', 1);
    dropZoneInventory.setValues(inventoryPayload);
    CoffeeMaki.setBorderStandard(dropZoneInventory);

    // transaction payload drop
    let transactionsPayload = [[timestamp, cid, lot, info, typeModifier, amount, null, note]];
    let dropZoneTransactions = CoffeeMaki.dropZoneRange(trans,'C', 'J', 1);
    dropZoneTransactions.setValues(transactionsPayload);
    CoffeeMaki.setBorderStandard(dropZoneTransactions);
}

const bulkAdditionObj = {
    inventory: [],
    label: []
};

function buildBulkInventoryArray() {

    let ad = ss.getSheetByName("Additions"); 
    let co = ss.getSheetByName("Components");
    let timestamp = new Date();
    let count = ad.getRange('Q3').getValue();
    let data = ad.getRange('R5:U' + (4 + count)).getValues();
    let chunkGrouping = chunkBulkInventoryData(data);
    let notes = Session.getActiveUser() + ' Committed Bulk Transaction';
    let array = [];
    let i = 0;

    while (i < chunkGrouping.length) {

        let j = 0;
        let cid = chunkGrouping[i][j][0];
        let name = co.getRange('D' + CoffeeMaki.determineRowExternalSheet(co, 'C5:C', 5, cid)).getValue();
        let increments = chunkGrouping[i].length;
        let lots = CoffeeMaki.incrementedLotGenerator(cid,timestamp,increments);

        while (j < chunkGrouping[i].length) {
            
            let lot = lots[j];
            let amount = chunkGrouping[i][j][1];
            let info = chunkGrouping[i][j][2];
            let copies = chunkGrouping[i][j][3];
            array.push([timestamp, cid, lot, 'Bulk Transaction', 'Add ( + )', amount, null, notes ])
            bulkAdditionObj.inventory.push([cid,null,lot,info,null,null,null,null,null,null]);
            bulkAdditionObj.label.push([lot, name, copies]);
            j++
        }
        i++;
    }

    return array;

}

function generateLabelDocument() {

    // build array
    let labelData = bulkAdditionObj.label;
    let dataCount = labelData.length;
    let labelCreatedTimestamp = Utilities.formatDate(new Date,  Session.getScriptTimeZone(), "MM-dd-YYYY hh-mm");

    // document name
    let name = 'Bulk Addition Labels ' + labelCreatedTimestamp;

    // doucmnet generation
    let folderId = '1vKKrrG40MZNyXIYOrXVyD7uaxei0VgiS';
    let id = CoffeeMaki.documentGenerator(folderId, name);
    let document = DocumentApp.openById(id);
    let body = document.getBody();

    // generic variables
    let timestamp = new Date();


    // loop for each lab sample that is in the request
    let i = 0;
    while(i < dataCount) {

        let copies = labelData[i][2];
        let lot = labelData[i][0];
        let name = labelData[i][1];
        let qrCodeUrl = "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=" + lot;
        let qrBlob = UrlFetchApp.fetch(qrCodeUrl).getBlob();

        // this is here because the first page always has some fucking line that is added and it ruins the spacing. will figure out later
        if (i === 0) {
            body.appendPageBreak();
        }

        // loop to generate additional pages labels with duplicates
        if (copies > 0) {

            let j = 0;
            while(j < copies) {

                let lotSection = body.appendParagraph(lot);
                lotSection.setHeading(DocumentApp.ParagraphHeading.HEADING2).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
                let  nameSection = body.appendParagraph(name);
                nameSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

                let qrSection = body.appendParagraph("");
                qrSection.appendInlineImage(qrBlob);
                qrSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

                
                let timeSection = body.appendParagraph(timestamp.toString()).setFontSize(6);
                timeSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER)

                body.appendPageBreak();
                j++;
            }

        } else {

            let lotSection = body.appendParagraph(lot);
            lotSection.setHeading(DocumentApp.ParagraphHeading.HEADING2).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
            let  nameSection = body.appendParagraph(name);
            nameSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

            let qrSection = body.appendParagraph("");
            qrSection.appendInlineImage(qrBlob);
            qrSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

            let timeSection = body.appendParagraph(timestamp.toString()).setFontSize(6);
            timeSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER)

            body.appendPageBreak();
         
        }
        i++;
    }

    // document creation functions from library to change page size, margins, and convert to pdf.
    CoffeeMaki.documentPageSize(document,'standardLabel',false);
    CoffeeMaki.documentMargins(document,14.4);

    // Save and close the document before pdf generation
    document.saveAndClose();

    // pdf generation and open url
    let pdf = CoffeeMaki.documentPdfConverter(document, folderId);
    CoffeeMaki.openTabs([pdf]);

}


function chunkBulkInventoryData(arr) {

let obj = {};
arr.forEach(v => (obj[v[0]] || (obj[v[0]] = [])).push(v));
let res = Object.keys(obj).map(v => obj[v]);

return res;

}

function executeBulkInventoryTransactions() {
    commitBulkInventoryTransactionsArray();
    commitBulkInventoryItems();
    generateLabelDocument();
    clearBulkInventoryForm();
}

function commitBulkInventoryTransactionsArray() {

    let sheet = ss.getSheetByName('Transactions');
    let payload = buildBulkInventoryArray();
    let dropZone = CoffeeMaki.dropZoneRangeAlt(sheet, 'C', 'J', 5, 'C3', payload.length);
    dropZone.setValues(payload);
    CoffeeMaki.setBorderStandard(dropZone);
}

function commitBulkInventoryItems() {

    let sheet = ss.getSheetByName('Inventory');
    let payload = bulkAdditionObj.inventory;
    let dropZone = CoffeeMaki.dropZoneRangeAlt(sheet, 'C', 'L', 6, 'C4', payload.length);
    dropZone.setValues(payload);
    CoffeeMaki.setBorderStandard(dropZone);
    CoffeeMaki.rangeSort(sheet, 'C', 'L', 6, 'C4');
    
}

function clearBulkInventoryForm() {
    let sheet = ss.getSheetByName('Additions');
    sheet.getRange('Q5:Q55').clearContent();
    sheet.getRange('S5:T55').clearContent();
}


function executeImportPricing() {

    // execute all
    commitImportPricingComponentsArchive();
    clearImportPricing();

}

function buildImportPricingComponentsArchive() {

    let ad = ss.getSheetByName("Additions"); 
    let co = ss.getSheetByName('Components');
    let inputsCount = ad.getRange('Y3').getValue();
    let inputArray = ad.getRange('Z5:AC' + (4 + inputsCount)).getValues();
    let i = 0;
    let data = [];

    // these parameters are shared for all entries

    let po = '1000';
    let supplierId = 'SUP/IN2021';
    let supplierName = 'Maki - Initialization Import';
    let timestamp = new Date();
    let note = Session.getActiveUser() + ' Imported Price';
    let status = 'Completed';


    // build array loop

    while (i < inputArray.length) {

        let cid = inputArray[i][0];
        Logger.log(cid);
        let row = CoffeeMaki.determineRowExternalSheet(co, 'C5:C', 5, cid);
        Logger.log(row);
        let name = co.getRange('D' + row).getValue();
        let poCid = po + '-' + cid;
        let unitPrice = inputArray[i][1];
        let sourcePo = inputArray[i][2];
        let userNote = inputArray[i][3];
        let finalNote = 'Source PO: ' + sourcePo + ' ; ' + userNote + ' ; ' + note; 

        data.push([poCid, cid, name, po, supplierId, supplierName, '---', 'lbs', unitPrice, '---', timestamp, 'Import', timestamp, '---', finalNote, status])
        i++;
    }

    return data;

}

function commitImportPricingComponentsArchive() {

    let sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1WeTE2wNwBykh4kWQYloRqqE4fqWdXXDsLUcDHdmoyho/edit").getSheetByName('PO Components Archive');

    let data = buildImportPricingComponentsArchive();

    let range = CoffeeMaki.dropZoneRangeAlt(sheet, 'C', 'R', 6, 'C4', data.length);

    range.setValues(data);
    CoffeeMaki.setBorderStandard(range);
    CoffeeMaki.rangeSort(sheet, "C", 'R', 6, 'C4');
    

}

function clearImportPricing() {

    let ad = ss.getSheetByName("Additions"); 

    ad.getRange('Y5:Y55').clearContent();
    ad.getRange('AA5:AC55').clearContent();

}

function copyDataOver() {

    let ad = ss.getSheetByName("Additions");
    let data = getDataArray(ad, 'I3', "I5:J", 4);
    let payload =[];
    let i = 0;

    while (i < data.length) {

        let cid = data[i][0];
        let name = data[i][1];
        let identifier = '[' + cid + '] ' + name;
        payload.push([identifier]);
        i++;

    }

    let transactionRange = ad.getRange('Q5:Q' + (4 + payload.length));
    transactionRange.setValues(payload);

    let pricingRange = ad.getRange('Y5:Y' + (4 + payload.length));
    pricingRange.setValues(payload);

}

function executeItIp() {

    executeBulkInventoryTransactions();
    executeImportPricing();

}

function getDataArray(sheet, countCell, startCellToCol, headerRow) {

    let count = sheet.getRange(countCell).getValue();
    let endRow = headerRow + count;
    let array = sheet.getRange(startCellToCol + endRow).getValues();

    return array;
}