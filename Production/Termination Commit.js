function validationTerminationCommit() {

    // execute any validations required. 

    // i know this function isn't necessary, but this is put here just in case there are other things we wish to validate in the future.

    let bomRequirementsMet = validationBomCommit()

    let passValidation;

    // check all validation steps for true

    if (bomRequirementsMet) {
        passValidation = true;
    } else {
        passValidation = false;

    }

    // execute based on overall pass validation

    return passValidation;


}



function validationBomCommit() {

    let result = td.getRange('D9').getValue();

    if (result) {
        return true;
    } else {
        return false;
    }
}



function validationBom() {

	// this is materials that are not on the bom
	let allMaterialsApproved = validationBomCids();
	let properMaterialAmounts = validationBomAmounts();
	let passValidation;

	if (allMaterialsApproved && properMaterialAmounts) {
		passValidation = true;
	} else {
		passValidation = false;
	}
	return passValidation;

}

function buildConsumedMaterialTransactionArray() {

    let consumedCount = td.getRange('H4').getValue();
    let bprId = td.getRange('D5').getValue();
    let data = td.getRange('H6:L' + (5 + consumedCount)).getValues();
    let category = 'BPR Consumption';
    let type = 'Remove ( - )';
    let notes = 'Consumed by: ' + bprId + ' Terminated by :' + Session.getActiveUser();
    let array = [];
    let i = 0;

    while (i < data.length) {

        let timestamp = data[i][0];
        let cid = data[i][1];
        let lot = data[i][3];
        let amount = data[i][4];
        array.push([timestamp, cid, lot, category, type, amount, null,notes])
        i++;
    }

    return array;

}


function executeTerminationCommits() {

    let ready = validationTerminationCommit();

    if (ready) {

        commitBprArchive();
        commitBprComponentsArchive();
        commitBprLogsArchive();
        commitConsumedMaterialTransactions();
        clearTerminate();
        clearTerminateCid();

    } else {

        ui.alert('It appears validation failed. Please determine why.');

    }

}

function commitConsumedMaterialTransactions() {

    let payload = buildConsumedMaterialTransactionArray();
    let dropZone = CoffeeMaki.dropZoneRangeAlt(tr, 'C', 'J', 5, 'C3', payload.length);
    dropZone.setValues(payload);
    CoffeeMaki.setBorderStandard(dropZone);
    CoffeeMaki.rangeSort(tr, 'C', 'J', 5, 'C3');

}

function commitBprArchive() {

    let key = td.getRange('D5').getValue().toString();
    let tankTime = td.getRange('D28').getValue();
    let materialPullTime = td.getRange('D30').getValue();

    let row = CoffeeMaki.determineRowExternalSheet(ab, 'C6:C', 6, key);

    ab.getRange('K' + row).setValue('Completed');
    ab.getRange('J' + row).setValue(new Date());
    ab.getRange('L' + row).setValue(tankTime);
    ab.getRange('M' + row).setValue(materialPullTime);

}

function commitBprComponentsArchive() {

    let materials = td.getRange('Q6:Q' + (5 + td.getRange('Q4').getValue())).getValues();
    let bprId = td.getRange('D5').getValue();
    let bprCid = [];
    
    materials.forEach(cid => bprCid.push(bprId+'-'+cid));

    bprCid.forEach(item => {

        let row = CoffeeMaki.determineRowExternalSheet(ac,'C6:C', 6, item);
        
        ac.getRange('K' + row).setValue('Resolved');
        ac.getRange('J' + row).setValue(new Date());

    });
}

function commitBprLogsArchive() {

    let sheet = ss.getSheetByName('Log-Archive');
    let count = td.getRange('AQ4').getValue();
    let bprId = td.getRange('D5').getValue();
    let logs = td.getRange('AQ6:AS' + (5 + count)).getValues();
    let i = 0;
    while (i < logs.length) {
        logs[i].unshift(bprId);
        i++;
    }

    let dropZone = CoffeeMaki.dropZoneRangeAlt(sheet, 'C', 'F', 6, 'C4', logs.length);

    dropZone.setValues(logs);
    CoffeeMaki.setBorderStandard(dropZone);
    CoffeeMaki.rangeSort(sheet, 'C', 'F', 6, 'C4')

}


function clearTerminateCid() {
    // this is definitely necessary because everytime that a person hits pull data, it clears it first so there isn't duplicate data. So, if the cid was cleared with everything else, the cid would be cleared before the other functions talk and try to get data on the cid (which would be blank)

    let bprId = ts.getRange('C6').clearContent();

}