const terminationData = {
	log: []
};


function pullBomRequirements() {

    let count = td.getRange('Q4').getValue();
    let bomArray = td.getRange('Q6:S' + (5 + count)).getValues();
    let i = 0; 
    let payload = [];

    while (i < bomArray.length) {
      let row =  (6 + i);
      let cid = bomArray[i][0];
      let name = bomArray[i][1];
      let needed = bomArray[i][2];
      let pulled = '=VLOOKUP(H' + row + ',\'.terminateData\'!W6:X,2,FALSE)';
      let sufficient = '=IF(ROUND(SUM(J' + row + ',-K' + row + '),3)=0,TRUE,FALSE)';

      payload.push([cid, name, needed, pulled ,sufficient]);
      i++;
    }
	
    return payload;

}

function pullNotes() {

	let count = td.getRange('AC4').getValue();
	let data = td.getRange('AC6:AH' + (5 + count)).getValues();

	let imageIcon = 'https://i.imgur.com/yatQgam.png';
	let payload = [];
	let i = 0;
	
	while (i < data.length) {
		let timestamp = data[i][0];
		let type = data[i][2];
		let submitter = data[i][3];
		let imagePath = data[i][4]
		let imageUrl = pullNoteImage(imagePath);
		let image = `=HYPERLINK(\"${imageUrl}\",IMAGE(\"${imageIcon}\"))`;
		let note = data[i][5];

		payload.push([timestamp, type, submitter, image, note]);
		i++;
	}
	return payload;
}



function pullNoteImage(fullpath) {

	let imageFolder = DriveApp.getFolderById('1buNyx8SX0yoy7oiBd25-sgj3mCP0NhGQ');
	let files = imageFolder.getFiles();
	let imagePath = '/Data/Workflow-Compounding/Images//';
	let url;
	let imageName = fullpath.replace(imagePath, '');

	while (files.hasNext()) {
		file = files.next();
		if (file.getName() === imageName) {
			url = file.getUrl();
			break;
		}
	}

	return url;
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

function validationBomCids() {

	// this ensures that all the cids/materials needed by the bom were met and that there were not cids that are not on the bom added.
	let bomCount = td.getRange('Q4').getValue();
	let stagedCount = td.getRange('H4').getValue();
	let rawBomCids = td.getRange('Q6:Q' + (5 + bomCount)).getValues().flat();
	let rawStagedCids = td.getRange('I6:I' + (5 + stagedCount)).getValues().flat();
	let bomCids = [...new Set(rawBomCids)]; // removes duplicates
	let stagedCids = [...new Set(rawStagedCids)];
	let notOnBom = [];
	let passValidation;

	let i = 0;

	while (i < stagedCids.length) {
		let cid = stagedCids[i];
		if (!bomCids.includes(cid)) {
			notOnBom.push(cid);
		}
		i++;
	}

	if (notOnBom.length === 0) {
		passValidation = true; 
		addLogMessage('Termination/validationBomCids', 'Pass: All Staged Material on BOM');
	} else {
		passValidation = false; 
		addLogMessage('Termination/validationBomCids', 'Failed: The Following Staged Materials are not on the BOM: ' + notOnBom);
	}

	return passValidation;
}

function validationBomAmounts() {
	
	let count = td.getRange('W4').getValue();
	let data = td.getRange('W6:Y' + (5 + count)).getValues();
	let i = 0;
	let insufficient = [];
	let excess = [];
	let passValidation;
	

	while (i < data.length) {

		let cid = data[i][0];
		let remaining = data[i][2];

		if (remaining > 0) {
			excess.push([cid, remaining]);
		} else if (remaining < 0 ) {
			insufficient.push([cid, remaining]);
		}
		i++;
	}


	if (insufficient.length === 0 && excess.length === 0) {
		passValidation = true;
		addLogMessage('Termination/validationBomAmounts', 'Pass: BOM Amount Requirements Fulfilled; No Excess or Insufficiencies present.');
	} else {
		passValidation = false;
		addLogMessage('Termination/validationBomAmounts', 
			'Failed: Excess amounts used: ' + excess + ' / Insufficient amounts pulled: ' + insufficient);
	}

	
	return passValidation;
}

function addLogMessage(functionName, logMessage) {

	// this builds a log output for later drop
	let timestamp = new Date();
	terminationData.log.push([timestamp, functionName, logMessage]);

}

function dropTermationData() {

    // this executes all the other functions to accomplish the front end

	// first the sheet is cleared
	clearTerminate();

	//then all the executions
	dropBomRequirements();
	dropStagedMaterials();
	dropNotes();
	dropTerminationSummary();
	dropLogs();

	
}

function dropStagedMaterials() {

	let count = td.getRange('H4').getValue();
	let data = td.getRange('H6:L' + (5 + count)).getValues();

	let dropRange = ts.getRange('P6:T' + (5 + count));
	dropRange.setValues(data);

}

function dropBomRequirements() {

	let payload = pullBomRequirements();
	let dropRange = ts.getRange('H6:L' + (5 + payload.length));

	dropRange.setValues(payload);
}

function dropTerminationSummary() {

	let tankTime = td.getRange('AM6').getValue();
	let materialPullTime = td.getRange('D7').getValue();
	let notesCount = td.getRange('AC4').getValue();
	let bomPassValidation = validationBom();


	let tankTimeCell = ts.getRange('C23');
	let materialPullTimeCell = ts.getRange('C26');
	let notesLoggedCell = ts.getRange('C20');
	let bomValidationCell = td.getRange('D9');

	tankTimeCell.setValue(tankTime);
	materialPullTimeCell.setValue(materialPullTime);
	notesLoggedCell.setValue(notesCount);
	bomValidationCell.setValue(bomPassValidation);

	
}

function dropNotes() {

	let payload = pullNotes();
	let dropRange = ts.getRange('X6:AB' + (5 + payload.length));
	dropRange.setValues(payload);

}

function dropLogs() {

	let logCount = td.getRange('AQ4').getValue();
	let logEntries = terminationData.log;
	let logRange = td.getRange('AQ' + (6 + logCount) + ':AS' + (5 + logEntries.length));


	logRange.setValues(logEntries);

	
}


function clearTerminate() {

	// execution board for all clearing functions
	clearTerminationSummary();
	clearGroupedRanges();
}

function clearTerminationSummary() {

	let tankTimeCell = ts.getRange('C23').clearContent();
	let materialPullTimeCell = ts.getRange('C26').clearContent();
	let notesLoggedCell = ts.getRange('C20').clearContent();
	let bomValidationCell = td.getRange('D9').clearContent();
	
}

function clearGroupedRanges() {
	// basically clears the whole range for the drop zones

	let bomRequirements = ts.getRange('H6:L30');
	let stagedMaterials = ts.getRange('P6:T105');
	let notes = ts.getRange('X6:AB105');
	let logs = td.getRange('AQ6:AS');

	bomRequirements.clearContent();
	stagedMaterials.clearContent();
	notes.clearContent();
	logs.clearContent();

}

function toggleTerminationBomRequirements() {

    let hidden = td.getRange('D20');

    if (hidden.getValue()) {

        ts.showColumns(7,7);
        hidden.setValue(false);


    } else {

        ts.hideColumns(7,7);
        hidden.setValue(true);

    }
}



function toggleTerminationNotes() {

    let hidden = td.getRange('D22');

    if (hidden.getValue()) {

        ts.showColumns(23,7);
        hidden.setValue(false);


    } else {

        ts.hideColumns(23,7);
        hidden.setValue(true);

    }
}

function toggleTerminationLogs() {

    let hidden = td.getRange('D24');

    if (hidden.getValue()) {

        ts.showColumns(31,5);
        hidden.setValue(false);


    } else {

        ts.hideColumns(31,5);
        hidden.setValue(true);

    }
}
