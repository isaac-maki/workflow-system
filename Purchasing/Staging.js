const shPending = ss.getSheetByName('Pending');
const staging = ss.getSheetByName('Staging');

function toggleinfo() {

    let data = ss.getSheetByName('.data');
    let hidden = data.getRange('D4');

    if (hidden.getValue()) {

        shPending.showColumns(7,4);
        hidden.setValue(false);


    } else {

        shPending.hideColumns(7,4);
        hidden.setValue(true);

    }

}


function pullActionable() {

    let count = shPending.getRange('C4').getValue();
    let array = shPending.getRange('C6:N' + (5 + count)).getValues();
    return array;

}

function pendingValidation() {

    // pull pending items and filter out rows with no action
    let data = pullActionable();
    let dataActionSelected = data.filter(function(row) {

        return row[11] !== '';

    });

    // separate array that filters the deny action with automatically triggered items (this is not allowed)
    let thresholdDenyError = data.filter(function(row) {

        return row[11] === 'Deny' && row[6] === 'Threshold Trigger';

    });

     

    if (thresholdDenyError.length > 0) {
        
        ui.alert('Threshold Triggered components cannot be denied. If this is unsatisfactory, change the trigger threshold in WF/Inventory (contact Isaac)');
        
    } else if (!validateSupplier(dataActionSelected)) {

       let response =  ui.alert('Different Last Suppliers', 'The staging area is meant for only one supplier and it appears you have components with multiple historical suppliers. This means that you are likely changing the supplier of one of these components. Do you wish to continue?', ui.ButtonSet.YES_NO);

       if (response === ui.Button.NO) {

            Logger.log('User hit no');

       } else {

            stagingActions(dataActionSelected);
            ui.alert('Great. You may need to change the selected Supplier in the staging window.');

       }
   } else {

        stagingActions(dataActionSelected);

   }

}

function stagingActions(array) {

    let data = array;

    // make drop of full staged info
    dropFullData(data);

    // staging creation and drop

    let payload = [];
    let i = 0;
    while (i < data.length) {

        let requestId = data[i][0];
        let cid = data[i][2];
        let name = data[i][3];
        let separator = null;
        let lastPrice = data[i][9];
        let lastQuantity = data[i][10];
        let blank = null;
        let uom = 'lbs';
        let total;
        if (i === 0) {
            let formula = '=ARRAYFORMULA(IF(LEN(C7:C26),J7:J26*K7:K26,\"\"))';
            total = formula;
        } else {
            total = null;
        }

        payload.push([requestId, cid, name, separator, lastPrice, lastQuantity, separator, blank, blank, uom, total]);

        i++;
    }
    let dropZone = CoffeeMaki.dropZoneRangeAlt(staging, 'C', 'M', 7, 'C5', payload.length);
    dropZone.setValues(payload);

    // set supplier in staging to first in list (they should all be equal or the user was warned)
    let supplier = data[0][8];
    if (supplier = 'No History' || 'Maki - Initialization Import') {
        Logger.log('No History or Initialized as last po');
    } else {
        staging.getRange('Q6').setValue(supplier);
    }
    //turn focus to staging
    SpreadsheetApp.setActiveSheet(staging);

    // clear pending sheet
    shPending.getRange('C6:N').clearContent();

}




function dropFullData(data) {
    let sheet = ss.getSheetByName('.data');
    let dropZone = CoffeeMaki.dropZoneRangeAlt(sheet, 'H', 'S', 5, 'H3', data.length);
    dropZone.setValues(data);

}

function validateSupplier(array) {

    let i = 0;
    let suppliers = [];
    while (i < array.length) {

        suppliers.push(array[i][8]);
        i++;
    }

    const allSame = arr => arr.every(val => val === arr[0]);
    let result = allSame(suppliers);
    return result;


}