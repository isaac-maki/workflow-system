function booleanLockPrice() {

    let response = ui.alert('Lock Pricing?', 'Would you like to lock the price? If you are changing the public price (i.e., the pricing on the website) then select \'Yes\'. \n This is very important; if you do not know what this means please contact Isaac or visit the documentation.', ui.ButtonSet.YES_NO);

    if (response === ui.Button.YES) {

        productionData.priceLockBoolean = true;
        pd.getRange('D33').setValue(true);

    } else if (response === ui.Button.NO) {

        productionData.priceLockBoolean = false;
        pd.getRange('D33').setValue(false);

    } else {

        let sysLogRange = pd.getRange('T' + (6 + pd.getRange('T4').getValue()));
        sysLogRange.setValue('Function: booleanLockPrice() ; User closed dialog box without choice. Likely confused.');

    }

}

function pathwayProductionPriceLock() {
    
    let lockPrice = productionData.priceLockBoolean;

    if (lockPrice) {

        commitProductionLockPrice();

    } else {

        Logger.log('Price not locked. commitProductionLockPrice skipped.');

    }


}


function buildCommitProductionHistory() {

    let noteCount = pd.getRange('D31').getValue();
    let notesRaw = ps.getRange('V28:V' + (27 + noteCount)).getValues().flat();
    let notes = notesRaw.join(' ; ');

    let sysLogsCount = pd.getRange('T4').getValue();
    let sysLogsRaw = pd.getRange('T6:T' + (5 + sysLogsCount)).getValues().flat();
    let sysLogs = sysLogsRaw.join(' ; ');

    let cid = pd.getRange('D6').getValue();
    let timestamp = new Date();
    let productionCost = pd.getRange('I8').getValue();
    let finalCost = pd.getRange('I10').getValue();
    let summaryPdfFormula = `=HYPERLINK(\"${productionData.productionSummaryPdfUrl}\",IMAGE(\"https://i.imgur.com/8GbOraM.png\"))`;
    let pdfUrl = productionData.productionSummaryPdfUrl;

    let data = [[cid, timestamp, sysLogs, notes, productionCost, finalCost, summaryPdfFormula, pdfUrl]];

    return data;

}

function buildCommitProductionLockPrice() {

    let lastPriceLockId = da.getRange('C6').getValue();
    let newPriceLockId = lastPriceLockId + 1;
    let timestamp = new Date();
    let parentCid = pd.getRange('D6').getValue();
    let bomCount = pd.getRange('D35').getValue();
    let bomData = ps.getRange('H6:M' + (5 + bomCount)).getValues();
    let i = 0;
    let data = [];

    while ( i < bomCount ) {

        let componentCid = bomData[i][0];
        let parentCidComponentCid = parentCid + '-' + componentCid;
        let lockedPrice = bomData[i][3];
        let currentPriceFormula = '=VLOOKUP(MAX(FILTER(\'Purchases Archive\'!E6:E,\'Purchases Archive\'!D6:D = INDIRECT(\"G\" \& ROW())))\&\"-\"\& INDIRECT(\"G\" \& ROW()),\'Purchases Archive\'!C6:F,4,FALSE)';


        data.push([newPriceLockId, parentCidComponentCid, timestamp, parentCid, componentCid, lockedPrice, currentPriceFormula]);

        i++;

    }

    return data;

}

function compileProductionSummaryPdf() {

    const url = 'https://docs.google.com/spreadsheets/d/1g1FcOVr3ariKZl0Qeu1FrI6Dd8EEfbU2nv9CehpEeHw/export?';

    let cid = pd.getRange('D6').getValue();
    let name = pd.getRange('D8').getValue();
    let timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM-dd-YYYY hh.mm");

    let filename = 'Pricing Summary' + name + ' [' + cid + '] ' + timestamp;

    // PDF Options

    pdfOptions =
        'exportFormat=pdf&format=pdf' +
        '&size=letter' +
        '&portrait=true' +
        '&fitw=true' +
        '&top_margin=0.20' +            
        '&bottom_margin=0.20' +         
        '&left_margin=0.20' +        
        '&right_margin=0.20' + 
        '&sheetnames=false&printtitle=false' +
        '&pagenumbers=false&gridlines=false' +
        '&fzr=false' +
        '&gid=1450314782';
    
    // PDF parameters 

    var params = {method:"GET",headers:{"authorization":"Bearer "+ ScriptApp.getOAuthToken()}};

    // PDF generation
    
    var response = UrlFetchApp.fetch(url+pdfOptions, params).getBlob();

    // File parameters
    var folder = DriveApp.getFolderById('1HsXQFkN4aQZBVDTefL5cD7_Z0v8F5KMm'); 

    // Save file to google drive
    let document = folder.createFile(response.setName(filename));


    let documentUrl = document.getUrl();

    productionData.productionSummaryPdfUrl = documentUrl;
   
}



function commitProductionData() {

    //this executes all the commits
    booleanLockPrice();
    compileProductionSummaryPdf();
    commitProductionHistory();
    pathwayProductionPriceLock();
    clearProductionDataResetButton();

}




function commitProductionHistory() {

    let hs = ss.getSheetByName('History');

    let data = buildCommitProductionHistory();

    let range = CoffeeMaki.dropZoneRangeAlt(hs, 'C', 'j', 6, 'C4', data.length);

    range.setValues(data);
    CoffeeMaki.setBorderStandard(range);

}

function commitProductionLockPrice() {

    let pl = ss.getSheetByName('Price Locks');

    let data = buildCommitProductionLockPrice();

    let range = CoffeeMaki.dropZoneRangeAlt(pl, 'C', 'I', 6, 'C4', data.length);

    range.setValues(data);
    CoffeeMaki.setBorderStandard(range);


}