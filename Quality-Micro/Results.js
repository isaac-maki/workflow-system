const resultsData = {
    array: [],
    reportNumber: 'report',
    t1Count: 0,
    t2Count: 0
};

function pullDataArray() {
    let array = CoffeeMaki.getDataArray(re, 'H4', 'H6:N', 5);
    resultsData.array = array;
}

function pullResultsBasicInfo() {

    let reportNumber = re.getRange('C6').getValue();
    resultsData.reportNumber = reportNumber;

    let tpc = re.getRange('M4').getValue();
    let enrichment = re.getRange('N4').getValue();
    resultsData.t1Count = tpc;
    resultsData.t2Count = enrichment;

}



function initiateResultSubmission(mode) {

    // first step is to pull the data array
    pullDataArray();
    pullResultsBasicInfo();


    // switch depending on which button they clicked. either manually entered results because of a failure or all passed.
    let runSubmission = false;

    switch (mode) {
        case 'passed':
            modifyPassedDataArray();
            runSubmission = true;
            break;
        case 'manual':
            let ready = validateManualInput();
            runSubmission = ready;
            break;
        default:
            ui.alert('Something went wrong. Tell Isaac there was an error on WF/Quality-Micro/initiateResultsSubmission()');
            break;
    }

    if (runSubmission) {
        executeResultsSubmissionAll();
    } else {
        Logger.log('runSubmission set to false from initiateResultSubmission');
    }

}

function validateManualInput() {

    let ready = false;
    if (resultsData.t1Count === 0 || resultsData.t2Count === 0) {
        ui.alert('You selected the Has Failure Button, however, TPC and/or Enrichment data was not entered.');
        ready = false;
    } else {
        ready = true;
    }

    return ready;
}

function analyzeResults() {

    let data = resultsData.array;
    let i = 0;
    while (i < data.length) {
        let resultTpc = data[i][5];
        let resultEnrichment = data[i][6];
        let row = data[i][4];

        if (resultTpc > 10 || resultEnrichment !== 'No Growth') {
            setResultsColumn(row, 'Failed');
        } else {
            setResultsColumn(row, 'Passed');
        }
        i++;
    }
}

function modifyPassedDataArray() {

    let data = resultsData.array;
    
    const addTpc = (current) => current[5] = '<10';
    const addEnrichment = (current) => current[6] = 'No Growth';
    data.every(addTpc);
    data.every(addEnrichment);
    
}

function setStatusColumn() {

    let i = 0;
    while (i < resultsData.array.length) {
        let row = resultsData.array[i][4];
        mi.getRange('L' + row).setValue('Completed');
        i++;
    }
}

function submitQcTesting() {
    
    let timestamp = new Date();
    let reportNumber = resultsData.reportNumber;
    let data = resultsData.array;
    let method = 'AM5010';
    let payload = [];
    let i = 0;

    while (i < data.length) {

        let lot = data[i][2];
        let tpc = data[i][5];
        let enrichment = data[i][6];
        payload.push([timestamp, reportNumber, lot, tpc, enrichment, method])
        i++;
    }

    // drop reuslts payload
    let dropZone = CoffeeMaki.dropZoneRangeAlt(md, 'A', 'F', 2, 'G1', payload.length);
    dropZone.setValues(payload);
}

function setResultsColumn(row, result) {

    mi.getRange('K' + row).setValue(result);


}

function buttonAllPassed() {

    initiateResultSubmission('passed');

}

function buttonHasFailures() {

    initiateResultSubmission('manual');

}

function executeResultsSubmissionAll() {
    // these are functions that are executed by both reports that fully passed or have failures
    setStatusColumn();
    analyzeResults();
    submitQcTesting();
    clearResultsForm();

}

function clearResultsForm() {

    re.getRange('C6').clearContent();
    re.getRange('M6:N10').clearContent();

}