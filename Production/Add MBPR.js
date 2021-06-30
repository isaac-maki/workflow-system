// Sheets

let ambpr = ss.getSheetByName('Add MBPR');
let fdb = ss.getSheetByName('formularyDatabase');

function newSavedWorkInstructions() {

    // Bount the 'New Saved' button
    // Simply saves wi to the list so it can be used later.

    let swi = ss.getSheetByName('savedWorkInstructions');
    
    let wi = ambpr.getRange('O28').getValue().toString();

    let dropZone = CoffeeMaki.dropZoneRange(swi,'C', 'C', 1);
    CoffeeMaki.setBorderStandard(dropZone);
    dropZone.setValue(wi);


}

function dropZoneRangeAlt(dz, startCol, endCol, firstRow, dzCount, payloadCount) {

    /* dz = Sheet where the dropzone range is to be located. 
    //      e.g., SpreadsheetApp.getActiveSpreadsheet.getSheetByName('x');
    // firstRow = the actual first row under the header. This is used to offset
    // dzCount = a referene to a cell that has a count of current amount of data in the dropZone. used as a offset.
    // payloadCount = amount of rows in the payload data array.
    */

    let firstDropZoneRow = firstRow + dzCount;
    let lastDropZoneRow = firstDropZoneRow + payloadCount - 1;
    let range = dz.getRange(startCol + firstDropZoneRow + ':' + endCol + lastDropZoneRow);
    return range;

}

function addSavedWorkInstruction() {

    // Adds saved work instruction

    let wi = ambpr.getRange("O28").getValue().toString();
    let dz = CoffeeMaki.dropZoneRangeAlt(ambpr, 'P', 'P', 6, 'P24', 1);
    dz.setValue(wi);

    // clears cell
    ambpr.getRange("O28").clearContent();

}

function generateMbprId() {

    let cid = ambpr.getRange('S1').getValue();
    let timestamp = new Date();
    let dd = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "dd");
    let yy = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yy");
    let mm = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "MM");
    let randomCharacterOne = CoffeeMaki.characterFromCode(CoffeeMaki.randomBetween(65,90));
    let randomCharacterTwo = CoffeeMaki.characterFromCode(CoffeeMaki.randomBetween(65,90));
    let randomCharacterThree = CoffeeMaki.characterFromCode(CoffeeMaki.randomBetween(65,90));
    let rnd = CoffeeMaki.randomBetween(0,9);

    let mbprId = cid + '.' + dd + randomCharacterOne + randomCharacterTwo + mm + yy + randomCharacterThree + rnd;

    return mbprId;

}

function commitMbpr() {

    // this is the main termination function

    saveMbprId();
    formularyCommitMbpr();
    formularyCommitBom();
    formularyCommitWorkInstructions();
    activeBprBool();
    Logger.log('All finished... now resetting sheet.');
    resetAddMbpr()
   

}

function saveMbprId() {

    let mbprId = generateMbprId();
    ambpr.getRange('S2').setValue(mbprId);

}

function formularyCommitMbpr() {

    let cid = ambpr.getRange('S1');
    let mbprId = ambpr.getRange('S2');
    let batchSize = ambpr.getRange('C9');

    let payload = [[cid.getValue(), mbprId.getValue(), batchSize.getValue()]];
    let dropZone = CoffeeMaki.dropZoneRangeAlt(fdb,'C', 'E', 6, 'C4',1);
    dropZone.setValues(payload);
    CoffeeMaki.rangeSort(fdb, 'C','E',6, 'C4');

}

function formularyCommitBom() {

    let mbprId = ambpr.getRange('S2').getValue();
    let bomLineCount = ambpr.getRange('H31').getValue();


    let bomArray = ambpr.getRange('I6:K' + (bomLineCount + 5)).getValues();

    let i = 0;
    while (i < bomArray.length) {

        bomArray[i].unshift(mbprId);
        i++;
    }
    let dropZone = CoffeeMaki.dropZoneRangeAlt(fdb, 'I','L',6, 'I4', bomArray.length);
    dropZone.setValues(bomArray);
    CoffeeMaki.rangeSort(fdb, 'I','L',6, 'I4');

}

function formularyCommitWorkInstructions() {

    let phasePartCount = ambpr.getRange('O24').getValue();
    let mbprId = ambpr.getRange('S2').getValue();


    let workInstrArray = ambpr.getRange('O6:P' + (phasePartCount + 5)).getValues();
    let i = 0;
    while (i < workInstrArray.length) {
        workInstrArray[i].unshift(mbprId);
        i++;
    }

    let dropZone = CoffeeMaki.dropZoneRangeAlt(fdb, 'P','R',6, 'P4', workInstrArray.length);
    dropZone.setValues(workInstrArray);
    CoffeeMaki.rangeSort(fdb, 'P','R',6, 'P4');

}

function activeBprBool() {

    let bool = ambpr.getRange('C12').getValue();
    if (bool) {
        setAsActiveMbpr();
    } else {
        Logger.log("Not set as active BPR.")
    }

}

function setAsActiveMbpr() {

    let sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o/edit').getSheetByName('Components');

    let cid = ambpr.getRange('S1').getValue();
    let mbprId = ambpr.getRange('S2').getValue();


    let componentRow = CoffeeMaki.determineRowExternalSheet(sheet, 'C5:C', 5, cid);

    sheet.getRange('I' + componentRow).setValue(mbprId);
}

function resetAddMbpr() {

    ambpr.getRange('C6').clearContent();
    ambpr.getRange('C9').clearContent();
    ambpr.getRange('C12').setValue(true);

    ambpr.getRange('H6:H30').clearContent();
    ambpr.getRange('J6:K30').clearContent();

    ambpr.getRange('O6:P23').clearContent();

    ambpr.getRange('O28').clearContent();

}

function commitValidation() {

    let cid = ambpr.getRange('S1');
    let mbprId = ambpr.getRange('S2');
    let batchSize = ambpr.getRange('C9');
    let concentrationSum = ambpr.getRange('J31').getValue();
    let bomLineCount = ambpr.getRange('H31').getValue();
    let phasePartCount = ambpr.getRange('O24').getValue();
    let instCount = ambpr.getRange('P24').getValue();

    if (batchSize.isBlank()) {

        ui.alert('You are missing a valid batch size.');

    } else if (cid.getValue() === '#N/A') {

        ui.alert('Please specify which product this MBPR is for.');

    } else if (bomLineCount < 1) {

        ui.alert('Please add some Bill of Material (bom) components.')

    } else if (!batchConcentrationCheck(concentrationSum)) {

        ui.alert('The concentrations of the BOM components do not sum to 100.0000; Please verify the integrity of the formulation.')

    } else if (phasePartCount !== instCount) {

        ui.alert('The amount of Phase/Parts does not equal the amount of instructions. Please assign all instructions to a Phase or Part.');

    } else if (phasePartCount === 0) {

        ui.alert('Please add work instructions.');

    } else {

        let result = ui.alert(
            'Please confirm',
            'Are you sure you are finished and wish to commit?',
            ui.ButtonSet.YES_NO);  
        if (result === ui.Button.YES) {
            // All good baby, lets go!
            commitMbpr();
        } else {
            ui.alert('Cool dude! Finish and commit later.');
        }
    }
}

function batchConcentrationCheck(amount) {

    let bool;
    
    if (amount > 99.9990) {

        bool = true;

    } else {

        bool = false
    }

    return bool;

}