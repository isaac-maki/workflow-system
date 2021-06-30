function termination() {
    let partial = ss.getSheetByName('.receiveData').getRange('P3').getValue();

    if (partial) {
        Logger.log('Partial Mode Activated: Skipping setPoStatus');
    } else {
        setPoStatus();
    }
    setPoComponentsStatus();
    inventoryDropZone();
    logPurchaseOrderDrop();
    logComponentsDrop();
    transactionDrop();

    clearReceive();
    resetPrintedBoolean();
        
}


function setPoStatus() {
    
    let recieveData = ss.getSheetByName('.receiveData');
    let poNumber = recieveData.getRange('G2').getValue().toString();

    let searchSheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1WeTE2wNwBykh4kWQYloRqqE4fqWdXXDsLUcDHdmoyho/edit').getSheetByName('PO Archive');

    let row = CoffeeMaki.determineRowExternalSheet(searchSheet, 'C6:C', 6, poNumber);
    let statusCell = searchSheet.getRange('J' + row);

    statusCell.setValue('Completed');

}

function setPoComponentsStatus() {

    // sheets 
    let recieveData = ss.getSheetByName('.receiveData');

    let searchSheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1WeTE2wNwBykh4kWQYloRqqE4fqWdXXDsLUcDHdmoyho/edit').getSheetByName('PO Components Archive');

    // declare po 
    let poNumber = recieveData.getRange('G2').getValue().toString();
    
    // how many line items were to be received (based on PO)
    let receiveCount = recieveData.getRange('V5').getValue();

    // build search key array
    let searchKeyArray = [];
    let cidArray =  recieveData.getRange('V7:V' + (receiveCount + 6)).getValues();
    let i = 0;
   
    while (i < cidArray.length) {
        let cid = cidArray[i][0].toString();
        let key = poNumber + '-' + cid;
        searchKeyArray.push(key);
        i++;
    }    

    let j = 0;
    while (j < searchKeyArray.length) {

        let key = searchKeyArray[j];
        let row = CoffeeMaki.determineRowExternalSheet(searchSheet,'C6:C', 6, key);
        let statusCell = searchSheet.getRange('R' + row);

        statusCell.setValue('Completed');
        j++;
    }
}

function inventoryDropZone() {

    let data = ss.getSheetByName('.receiveData');
    let dz = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o/edit').getSheetByName('Inventory');

    let dataCount = data.getRange('L5').getValue();
    let payload = data.getRange('L7:O' + (dataCount + 6)).getValues();
    let i = 0;
    while (i < payload.length)
    {
        payload[i][1] = null;
        i++;
    }

    let dropZone = CoffeeMaki.dropZoneRange(dz,'c', 'f', dataCount);
    let formatZone = dz.getRange('C6:L');

    dropZone.setValues(payload);
    CoffeeMaki.setBorderStandard(formatZone);

}


function logPurchaseOrderDrop() {

    let data = ss.getSheetByName('.receiveData');
    let dz = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1DLaHP1xv74e1rHaQ88xObDjOeg8wxZeetTc2LvJSXg8/edit').getSheetByName('Log-POs');

    let po = data.getRange('g2').getValue().toString();
    let supplier = data.getRange('g3').getValue().toString();
    let timestamp = new Date();

    let payload = [[timestamp, po, supplier]];

    let dropZone = CoffeeMaki.dropZoneRange(dz,'c', 'e', 1);

    dropZone.setValues(payload);
    dropZone.setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
}

function logComponentsDrop() {

    let data = ss.getSheetByName('.receiveData');
    let dz = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1DLaHP1xv74e1rHaQ88xObDjOeg8wxZeetTc2LvJSXg8/edit').getSheetByName('Log-Components');
    
    let count = data.getRange('L5').getValue();

    let po = data.getRange('G2').getValue().toString();
    let timestamp = new Date();

    let payload = data.getRange('L7:R' + (count + 6)).getValues();

    let i = 0;
    while (i < payload.length){

        payload[i].unshift(timestamp, po);
        i++;
    }

    let dropZone = CoffeeMaki.dropZoneRange(dz,'C', 'K', count);
    dropZone.setValues(payload);
    dropZone.setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
}

function transactionDrop() {

    let data = ss.getSheetByName('.receiveData');
    let dz = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o/edit').getSheetByName('Transactions');

    let count = data.getRange('L5').getValue();
    let dataArray = data.getRange('L7:Q' + (count + 6)).getValues();

    // Variables that all line items share
    let timestamp = new Date();
    let category = 'Initial';
    let type = 'Add ( + )';
    let note = 'PO# ' + data.getRange('G2').getValue().toString();

    // build payload array

    let payload = [];

    let i = 0;
    while (i < dataArray.length) {

        let cid = dataArray[i][0];
        let lot = dataArray[i][2];
        let uom = dataArray[i][5];
        let amount;
        if (uom !== 'lbs') {
            let toConvert = dataArray[i][4];
            let amount = unitConverter(uom, value);

        } else {
            amount = dataArray[i][4];
        }

        payload.push([timestamp, cid, lot, category, type, amount, null, note])

        i++;
    }

    let dropZone = CoffeeMaki.dropZoneRange(dz,'C', 'J', count);
    dropZone.setValues(payload);
    dropZone.setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);

}

function unitConverter(uom, value) {
    
    let converted;
    switch (uom) {
        case 'kg':
            converted = value * 2.20462262185;
            break;
        default:
            break;
    }
    let result = parseFloat(converted).toFixed(4);

    return result;

}


function executeManualClearOfReceive() {

    clearReceive();
    resetPrintedBoolean();

}


function resetPrintedBoolean() {

    ss.getSheetByName('.receiveData').getRange('R3').setValue(false);

}

function clearReceive() {

    let sheet = ss.getSheetByName('Receive');

    // clear po
    sheet.getRange('d4').clearContent();

    // clear info and split
    sheet.getRange('H8:H').clearContent();
    sheet.getRange('J8:J').clearContent();

    // clear finish section
    sheet.getRange('N8:T').clearContent();

    //set partial to false
    sheet.getRange('D5').setValue('FALSE');


}
