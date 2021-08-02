function generateBprPdf() {

    const url = 'https://docs.google.com/spreadsheets/d/18odzUYyHVFfC9-LL3SNBsj9oSnzSwOT5pYAFFbtVIXo/export?';

    let bprNumber = bu.getRange('D25').getValue();
    let batchNumber = bu.getRange('D23').getValue();
    let productName = bu.getRange('D19').getValue();

    let filename = `${bprNumber} - ${batchNumber} - ${productName}.pdf`

    // PDF Options

    pdfOptions =
        'exportFormat=pdf&format=pdf' +
        '&size=letter' +
        '&portrait=false' +
        '&fitw=true' +
        '&top_margin=0.20' +            
        '&bottom_margin=0.20' +         
        '&left_margin=0.20' +        
        '&right_margin=0.20' + 
        '&sheetnames=false&printtitle=false' +
        '&pagenumbers=false&gridlines=false' +
        '&fzr=false' +
        '&gid=1298396906';
    
    // PDF parameters 

    var params = {method:"GET",headers:{"authorization":"Bearer "+ ScriptApp.getOAuthToken()}};

    // PDF generation
    
    var response = UrlFetchApp.fetch(url+pdfOptions, params).getBlob();

    // File parameters
    var folder = DriveApp.getFolderById('1Mvj99mDw8KqpGrroGyQ-RlBrWvegqGTF'); 

    // Save file to google drive
    let document = folder.createFile(response.setName(filename));

    let documentUrl = document.getUrl();

    return documentUrl;

}

function pullParentBatchNumber() {

    let bulkBatchNumber = bu.getRange('D23').getValue();
    batchData.parentBatchNumber = bulkBatchNumber;
}

function printBpr() {
    
    let url = [generateBprPdf()];
    CoffeeMaki.openTabs(url);

    // set printed bool to true
    bu.getRange('D29').setValue(true);


}

function commitCreateBprArchive() {

    let bprArchive = ss.getSheetByName('BPR-Archive');
    
    let bprId = bu.getRange('D25').getValue();
    let batchNumber = bu.getRange('D23').getValue();
    let mbprId = bu.getRange('D15').getValue();
    let cid = bu.getRange('D5').getValue();
    let productName = bu.getRange('D19').getValue();
    let batchSize = bu.getRange('D17').getValue();
    let printDate = new Date();
    let completedDate = null;
    let status = 'Pending';

    let payload = [[bprId, batchNumber, mbprId, cid, productName, batchSize, printDate,completedDate, status, null, null]];

    let dropZone = CoffeeMaki.dropZoneRangeAlt(bprArchive, 'C', 'M', 6, 'C4', 1);

    dropZone.setValues(payload);

}

function commitCreateBprComponentsArchive() {

    let bprComponentsArchive = ss.getSheetByName('BPR-Components-Archive');

    let componentCount = bu.getRange('D7').getValue();
    let componentArray = bu.getRange('I6:L' + (5 + componentCount)).getValues();

    let bprNumber = bu.getRange('D25').getValue();
    let producedProduct = bu.getRange('D19').getValue();
    let timestamp = new Date();
    let status = 'Allotted';
    
    let payload = [];
    let i = 0;
    while (i < componentArray.length) {
        
        let cid = componentArray[i][0];
        let componentName = componentArray[i][3];
        let bprCid = bprNumber + '-' + cid;
        let amount = componentArray[i][2];
        let appKey = bprCid + '-' + CoffeeMaki.randomBetween(1,999);

        payload.push([bprCid, bprNumber, producedProduct, cid, componentName, amount, timestamp, null, status, null, appKey]);

        i++;
    }

    let dropZone = CoffeeMaki.dropZoneRangeAlt(bprComponentsArchive,'C', 'M', 6, 'C4', payload.length);

    dropZone.setValues(payload);
}

function commitInventory() {

    // execution of other commit to inventory functions
    pullParentBatchNumber()
    commitInventoryLineItems();
    commitInventoryTransaction();
    //commitInventoryLotType(); not used due to a system overhaul

}

function commitInventoryLotType() {

    // this was meant to log the type that the lot was. e.g, drum, pail etc. THIs is not currently being used due to a system overhaul.


    let payload = [];
    let i = 0;

    while (i < batchData.createdLotNumbers.length) {

        let lot = batchData.createdLotNumbers[i][1];
        let type = batchData.createdLotNumbers[i][0];

        payload.push([lot, type]);
        i++;
    }

    let dropZone = CoffeeMaki.dropZoneRangeAlt(ii, 'C', 'D', 6, 'C4', payload.length);
    dropZone.setValues(payload);
    CoffeeMaki.setBorderStandard(dropZone);
    CoffeeMaki.rangeSort(ii, 'C', 'D', 6, 'C4');

}

function commitInventoryLineItems() {

    let cid = bu.getRange('D5').getValue();
    let payload = [];
    let lot = batchData.parentBatchNumber;
    let info = '[Pending] ' + microExamRequiredBool();
    payload.push([cid, null, lot, info, null, null, null, null, null, null]);


    /*

    This is currently not being used due to a system overhaul in which the parent batch is split into smaller lots elsewhere.

    let i = 0;
    while (i < batchData.createdLotNumbers.length) {

        let lot = batchData.createdLotNumbers[i][1];
        let info = batchData.createdLotNumbers[i][0] + microExamRequiredBool();

        payload.push([cid, null, lot, info, null, null, null, null, null, null]);
        
        i++;
    }

    */
    // dropping payload
    let dropZone = CoffeeMaki.dropZoneRangeAlt(iv, 'C', 'L', 6, 'C4', payload.length);
    dropZone.setValues(payload);
    CoffeeMaki.setBorderStandard(dropZone);
    CoffeeMaki.rangeSort(iv, 'C', 'L', 6, 'C4');

}

function microExamRequiredBool() {
    
    let microRequired = bu.getRange('D11').getValue();

    if (microRequired) {
        let output = ' [Quarantine]';
        return output;
    } else {
        let output = '';
        return output;
    }

}

function commitInventoryTransaction() {

    let timestamp = new Date();
    let bprId = bu.getRange('D25').getValue();
    let cid = bu.getRange('D5').getValue();
    let category = 'Production Batch Output';
    let type = 'Add ( + )';
    let note = 'Created via BPR #' + bprId + ' Creation';

    let payload = [];

    let lot = batchData.parentBatchNumber;
    let amount = bu.getRange('D17').getValue();

    
    payload.push([timestamp, cid, lot, category, type, amount, null, note]);

    /*

    This is currently not being used due to a system overhaul in which the parent batch is split into smaller lots elsewhere.


    let i = 0;

    while (i < batchData.createdLotNumbers.length) {

        let lot = batchData.createdLotNumbers[i][1];
        let amount = batchData.createdLotNumbers[i][2];
        
        payload.push([timestamp, cid, lot, category, type, amount, null, note]);
        i++;
    }

    */

    // dropping payload
    let dropZone = CoffeeMaki.dropZoneRangeAlt(tr, 'C', 'J', 5, 'C3', payload.length);
    dropZone.setValues(payload);
    CoffeeMaki.setBorderStandard(dropZone);
    CoffeeMaki.rangeSort(tr, 'C', 'J', 5, 'C3');

}

function commitWorkInstructions() {

    let bprId = bu.getRange('D25').getValue();
    let wiCount = bu.getRange('AA4').getValue();
    let wiRaw = bu.getRange('AA6:AC' + (5 + wiCount)).getValues();
    let payload = [];
    let i = 0;

    while (i < wiRaw.length) {

        let wiSequence = i + 1;
        let bprIdWiSequence = bprId + '-' + wiSequence;
        let phase = wiRaw[i][1];
        let instruction = wiRaw[i][2];

        payload.push([bprIdWiSequence, bprId, wiSequence, phase, instruction]);

        i++;
    }

    let dropZone = CoffeeMaki.dropZoneRange(wi,'A', 'E', payload.length);
    dropZone.setValues(payload);

}


function commitAll(){
    commitCreateBprArchive();
    commitCreateBprComponentsArchive();
    //generateHoldLabels();
    commitInventory();
    commitWorkInstructions();
    

}


function clearSheets() {

    clearBpr();
    clearCreateBpr();

    bu.getRange('D29').setValue(false);
    bu.getRange('D35').setValue(false);




}

function clearBpr() {

    let sheet = ss.getSheetByName('BPR');

    sheet.getRange('F2:F4').clearContent();
    sheet.getRange('K2:K5').clearContent();
    sheet.getRange('D41:F43').clearContent();

    sheet.getRange('D10:D32').setBorder(true, true, true,true,true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange('F10:F32').setBorder(true, true, true,true,true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange('K10:K32').setBorder(true, true, true,true,true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);

    let endRow = 32;
    let i = 10;
    while (i < endRow) {
        
        let row = i;
        let clearRow = sheet.getRange('B' + row + ':L' + row);
        clearRow.clearContent();
        clearRow.setBorder(true, null, true,null,null,null, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
        i++;
    }
}

function clearCreateBpr() {

    cb.getRange('C6').clearContent();
    cb.getRange('H6:L30').clearContent();

    let availableMaterialsCount = bu.getRange('D9').getValue();

    cb.getRange('S6:V' + (5 + availableMaterialsCount)).clearContent();

    cb.getRange('Z6:AC8').clearContent();
}

