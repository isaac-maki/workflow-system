function mainCommit() {
    poGenerator();
    compilePurchaseOrderPdf();
    commitComponentsArchive();
    commitPurchaseOrderArchive();
    commitCleanUp();
}

function commitPurchaseOrderArchive() {

    let sheet = ss.getSheetByName('PO Archive');

    let poNumber = ds.getRange('D20').getValue();
    let supplierId = ds.getRange('D8').getValue();
    let supplier = ds.getRange('D10').getValue();
    let itemsCount = ds.getRange('D30').getValue();
    let total = ds.getRange('D22').getValue();
    let timestamp = new Date();
    let status = 'Pending';
    let pdfFormula = `=HYPERLINK(\"${global.poUrl}\",IMAGE(\"https://i.imgur.com/8GbOraM.png\"))`;
    
    let payload = [[poNumber, supplierId, supplier, itemsCount, total, timestamp, null, status, pdfFormula]];

    let dropZone = CoffeeMaki.dropZoneRangeAlt(sheet, 'C', 'K', 6, 'C4', 1);

    dropZone.setValues(payload);

}

function commitCleanUp() {

    clearStaging();
    clearPo();
    clearFullData();

}

function clearStaging() {

    staging.getRange('C7:M26').clearContent()
    staging.getRange('Q6').clearContent();

}

function clearFullData() {

    ds.getRange('H5:S24').clearContent();

}


function commitComponentsArchive() {

    let sheet = ss.getSheetByName('PO Components Archive');

    // variables all line items share
    let supplierId = ds.getRange('D8').getValue();
    let supplier = ds.getRange('D10').getValue();
    let timestamp = new Date();
    let po = ds.getRange('D20').getValue();
    let status = 'Pending';

    // build line specific variables
    let data = ds.getRange('H5:W' + (4 + ds.getRange('H3').getValue())).getValues();
    
    let payload = [];
    let i = 0;
    while (i < data.length) {

        let cid = data[i][2];
        let component = data[i][3];
        let poCid = po + '-' + cid;
        let quantity = data[i][13];
        let uom = data[i][14];
        let price = data[i][12]; 
        let amountTotal =  data[i][15];
        let poDate = timestamp;
        let requestId = data[i][0];
        let requestDate = data[i][1]
        let availableAtm = data[i][4]
        let note = data[i][6];

        payload.push([poCid, cid, component, po, supplierId, supplier, quantity, uom, price, amountTotal, poDate, requestId, requestDate, availableAtm, note, status, ]);

        i++;
    }

    let dropZone = CoffeeMaki.dropZoneRangeAlt(sheet, 'C', 'R', 6, 'C4', payload.length);

    dropZone.setValues(payload);

    CoffeeMaki.setBorderStandard(dropZone);

    CoffeeMaki.rangeSort(sheet, 'C', 'R', 6, 'C4');


}