const coffeeData = {
    reportUrls: []
};

function dataSelection() {

    // gets the data based on what is checked markeed

    let quantity = sd.getRange('C4').getValue();

    let array = sd.getRange('C6:F' + (5 + quantity)).getValues();

    let chunked = chunkSelection(array);
    return chunked;

}


function chunkSelection(array) {

    // chunks the array into groups of 5. so if array has [1,2,3,4,5,6], this turns it into [1,2,3,4,5] and [6]. this is because the form only takes 5 samples at a time.

    let chunkedArray = [];

    for (let i = 0; i < array.length; i++) {

        if ( i % 5 === 0) {

            // begin a new array
            chunkedArray.push([array[i]]);

        } else {

            // pushes to current subarray in multidimensional array
            chunkedArray[chunkedArray.length - 1].push(array[i]);

        }
    }

    return chunkedArray;

}

function microSubmissionFormData() {

    // makes the data formatted for the mql form. basically a payload for the micro form.

    let array = dataSelection();
    let i = 0;
    let quantityProvided = '50 mL';
    let sampleType = 'Bulk';
    let testRequested = 'TPC & Enrichment'
    let microFormData = [];
    let mergedCellSpace = null;

    while (i < array.length) {
        
        for (let j = 0; j < array[i].length; j++) {

            let name = array[i][j][1];
            let nameAndQuantity = name + ' / ' + quantityProvided;
            let info = array[i][j][3];
            let lot = array[i][j][2];
            
            microFormData.push([nameAndQuantity, mergedCellSpace, mergedCellSpace, info, lot, mergedCellSpace, sampleType, null, testRequested]);

        }
        i++;
    }

    let chunkedMicroFormData = chunkSelection(microFormData);

    return chunkedMicroFormData;

}

function injectMicroData(formElements) {

    // this will actually inject the payload for a single micro quality labs form

    //variable declaration
    let timestamp = Utilities.formatDate(new Date(), 'America/Los_Angeles', 'MMMM dd, yyyy HH:mm');
    let reportNumber = du.getRange('D6').getValue();
    let sampleDataRange = mf.getRange('E13:M' + (12 + formElements.length));

    // injections
    mf.getRange('L3').setValue(reportNumber);
    mf.getRange('L5').setValue(timestamp);
    mf.getRange('K43').setValue(timestamp);

    sampleDataRange.setValues(formElements);

}

function clearMicroQualityForm() {

    mf.getRange('L3').clearContent();
    mf.getRange('L5').clearContent();
    mf.getRange('K43').clearContent();
    mf.getRange('E13:M17').clearContent();


}


function generateMqlFormFromChunks() {

    // chunbkedFormData is an array set up for injection into the MQL Submission form whereas chunkedData is just raw info from the components selection.
    let chunkedFormData = microSubmissionFormData();
    let chunkedData = dataSelection();
    let i = 0;

    while (i < chunkedFormData.length) {

        Logger.log('Parsing chunk' + (i + 1) + ' / ' + chunkedFormData.length)

        let chunkForForm = chunkedFormData[i];
        let chunkData = chunkedData[i];

        injectMicroData(chunkForForm);
        generateMqlFormPdf();
        archiveMqlForm(chunkData,i);
        clearMicroQualityForm();
        i++;
    }

    sl.getRange('G6:G').setValue('FALSE');

}

function generateMqlFormPdf() {

    // this will compile the MQL Form to a PDF and save the url to an object

    //variables

    const url = 'https://docs.google.com/spreadsheets/d/1vVMCcb-l86MDw08m9c13ikGxv1TlwCPqh0DrqkxqQ_k/export?';
    const folder = DriveApp.getFolderById('1pks9nvildMCRM2wHH-cPfyfKU43LLGoH');
    let reportNumber = du.getRange('D6').getValue();
    let filename = 'MQL Report # ' + reportNumber;

    // pdf options and generation

    let pdfOptions =
    'exportFormat=pdf&format=pdf' +
    '&size=letter' +
    '&portrait=true' +
    '&scale=3' +
    '&top_margin=0.10' +            
    '&bottom_margin=0.10' +         
    '&left_margin=0.00' +        
    '&right_margin=0.00' + 
    '&sheetnames=false&printtitle=false' +
    '&pagenumbers=false&gridlines=false' +
    '&fzr=false' +
    '&gid=1032909447';

    var params = {method:"GET",headers:{"authorization":"Bearer "+ ScriptApp.getOAuthToken()}};

    var response = UrlFetchApp.fetch(url+pdfOptions, params).getBlob();

    let document = folder.createFile(response.setName(filename));

    // save url to list.

    let reportUrl  = document.getUrl();
    coffeeData.reportUrls.push(reportUrl);

}

function archiveMqlForm(chunk,chunkNumber) {

    let sheet = ss.getSheetByName('Micro');
    let data = chunk;
    let reportNumber = du.getRange('D6').getValue();
    let timestamp = new Date();
    let expectingResults = addDaysCurrentTimestamp(5);
    let status = 'Pending';

    let i = 0;

    while (i < data.length) {

        let pdfFormula = `=HYPERLINK(\"${coffeeData.reportUrls[chunkNumber]}\",IMAGE(\"https://i.imgur.com/8GbOraM.png\"))`;

        data[i].unshift(reportNumber);
        data[i].push(timestamp, expectingResults, pdfFormula, 'Waiting', status);
        i++;

    }

    let dropZone = CoffeeMaki.dropZoneRangeAlt(sheet, 'C', 'L', 6, 'C4', data.length);
    dropZone.setValues(data);
    CoffeeMaki.setBorderStandard(dropZone);

}

function addDaysCurrentTimestamp(days) {

    // gets current time and adds 'days' integer to it.
    
    let date = new Date();
    date.setDate(date.getDate() + days);
    return date;
 }