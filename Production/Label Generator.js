const batchData = {
    holdDrum: [],
    holdPail: [],
    holdGallon: [],
    createdLotNumbers: [],
    parentBatchNumber: null,
};

function pullHoldLabelData() {

    let bulkBatchNumber = bu.getRange('D23').getValue();
    let drumCount = bu.getRange('V17').getValue();
    let pailCount = bu.getRange('V18').getValue();
    let gallonCount = bu.getRange('V19').getValue();

    let drumWeight = bu.getRange('U17').getValue();
    let pailWeight = bu.getRange('U18').getValue();
    let gallonWeight = bu.getRange('U19').getValue();

    let weightInPailsTotal = pailCount * pailWeight;
    let weightInGallonsTotal = gallonCount * gallonWeight;

    let startingNumber = CoffeeMaki.randomBetween(15,999);

    let name = bu.getRange('D19').getValue();

    batchData.parentBatchNumber = bulkBatchNumber;

    if (drumCount > 0 ) {

        for (let i = 0; i < drumCount; i++) {
            let j = i + startingNumber;
            let adjustedBatchNumber = bulkBatchNumber + 'D' + j;

            batchData.holdDrum.push([name.toUpperCase(), 'BATCH: '+ adjustedBatchNumber, 'FILL WEIGHT: ' + drumWeight + ' lbs']);
            batchData.createdLotNumbers.push(["Drum", adjustedBatchNumber, drumWeight]);
            
        }
    }

    if (pailCount > 0 ) {

        for (let i = 0; i < pailCount; i++) {
            let j = i + startingNumber;
            let adjustedBatchNumber = bulkBatchNumber + 'P' + j;

            batchData.holdPail.push([name.toUpperCase(), 'BATCH: '+ adjustedBatchNumber, 'FILL WEIGHT: ' + pailWeight + ' lbs']);
            batchData.createdLotNumbers.push(["Pail", adjustedBatchNumber, weightInPailsTotal]);
            
        }
    }

    if (gallonCount > 0 ) {

        for (let i = 0; i < gallonCount; i++) {
            let j = i + startingNumber;
            let adjustedBatchNumber = bulkBatchNumber + 'G' + j;

            batchData.holdGallon.push([name.toUpperCase(), 'BATCH: '+ adjustedBatchNumber, 'FILL WEIGHT: ' + gallonWeight + ' lbs']);
            batchData.createdLotNumbers.push(["Gallon", adjustedBatchNumber, weightInGallonsTotal]);
            
        }
    }

}

function generateHoldLabels() {

    // pull and save data
    pullHoldLabelData();
    let labels = [...batchData.holdDrum, ...batchData.holdPail, ...batchData.holdGallon];
    
    //document name
    let name = 'Hold Labels - ' + batchData.parentBatchNumber;


    // document generation
    let folderId = '1BJr0M1bhO6Zqa3S0ThWqNVdbY-bo19oa';
    let id = CoffeeMaki.documentGenerator(folderId, name);
    let document = DocumentApp.openById(id);
    let body = document.getBody();

    // Define a custom paragraph style.
    let style = {};
    style[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER;
    style[DocumentApp.Attribute.VERTICAL_ALIGNMENT] = DocumentApp.VerticalAlignment.CENTER;
    style[DocumentApp.Attribute.FONT_FAMILY] = 'Calibri';
    style[DocumentApp.Attribute.FONT_SIZE] = 10;
    style[DocumentApp.Attribute.BOLD] = true;

    let i = 0;

    while (i < labels.length) {

        if (i === 0) {
            body.appendPageBreak();
        }

        let j = 0;
        while (j < 3) {
            let section = body.appendParagraph(labels[i][j]);
            section.setAttributes(style);
            j++;
        }

        body.appendPageBreak();
        i++;
        
    }

    // document crreation functions
    CoffeeMaki.documentPageSize(document,'labLabel',false);
    CoffeeMaki.documentMargins(document,4);
    document.saveAndClose();

    // pdf generation and open url
    let pdf = CoffeeMaki.documentPdfConverter(document, folderId);
    CoffeeMaki.openTabs([pdf]);
}


