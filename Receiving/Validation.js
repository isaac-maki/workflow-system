const receiveFinishValidation = () => {

    let partial = ss.getSheetByName('.receiveData').getRange('P3').getValue();

    if (emptyQuantitesBool() && !partial) {

        ui.alert('Some quantities are blank. If this is a partial shipment then please click on the Partial Checkbox under the PO number. Otherwise, try again amigo.');

    } else if (!printedLabelsBool()) {

        ui.alert('It appears you have yet to print labels. Please do so before hitting the Complete Ghost. Once completed this form will be reset.');

    } else if (quantityDifferenceValidation().length > 0) {

        let response = ui.alert(
            'Please confirm', 
            'The products with the CID of '+ quantityDifferenceValidation() + ' have more or less checked in than what was anticipated. Are you sure you want to continue?',
            ui.ButtonSet.YES_NO);
        if (response == ui.Button.YES) {
            
            // Success; run termination
            termination();
            

        } else {
            Logger.log('Alright try again brah');
        }
        

    } else {

            // Success; run termination
            termination();

    }



}

const emptyQuantitesBool = () => {

    let re = ss.getSheetByName(".receiveData");

    let count = re.getRange('L5').getValue();

    let emptyCellsBool;

    let a = 0;
    while (a <= count - 1 ) {
        let b = a + 7;
        let checkCell = re.getRange("P"+b);
        if (checkCell.isBlank()) {
            emptyCellsBool = true;
            a = 1000;

        } else {
            emptyCellsBool = false;

        }
        a++;
    }
    
    return emptyCellsBool;
}

const quantityDifferenceValidation = () => {

    let re = ss.getSheetByName(".receiveData");
    
    let count = re.getRange('V5').getValue();

    let data = re.getRange('V7:Z' + (6+count)).getValues();

    let cidWithDifference = []

    let a = 0;
    while (a < count) {
        if (data[a][4]) {
            cidWithDifference.push(data[a][0]);
        } 
        a++;
    }
    return cidWithDifference;
}

function printedLabelsBool() {

    let printedTheLabels = ss.getSheetByName('.receiveData').getRange('R3').getValue();
    return printedTheLabels;
}