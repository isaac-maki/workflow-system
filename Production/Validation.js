function validateComponentsPull() {

    let count = ss.getSheetByName('.bprNeeded').getRange('C4').getValue();

    if (count > 1) {
        dropCreateBprData();
    } else {
        ui.alert('Please wait a few seconds then try again. Kay thanks.');
    }
}

function sufficientQuantityAllottedBool() {

    let count = bu.getRange('O4').getValue();

    let sufficientValues = bu.getRange('Q6:Q' + (5 + count)).getValues().flat();

    const sufficientChecker = (currentValue) => currentValue === true;

    let sufficientBool = sufficientValues.every(sufficientChecker);
    Logger.log(sufficientBool);
    
    if (!sufficientBool) {
        ui.alert('It appears that one or more materials does not have enough available inventory. If this is in error, please have warehouse or production staff conduct an inventory audit.');
        return false;
    } else {
        return true;
    }
}

function printBprInitialize() {

    if (checkByPassMode()) {
        generateBpr();
        printBpr();
    } else if (sufficientQuantityAllottedBool()) {
        generateBpr();
        printBpr();
    }
}

function enableByPassMode() {

    bu.getRange('D35').setValue(true);

}

function checkByPassMode() {

    let mode = bu.getRange('D35').getValue();

    if (mode) {
        return true;
    } else {
        return false;
    }

}

function commitInitialize() {

    let printed = bu.getRange('D29').getValue();

    if (printed) {
        commitAll();
        clearSheets();
    } else {
        ui.alert('It appears that you have yet to print the BPR. Please do so before committing.')
    }

}