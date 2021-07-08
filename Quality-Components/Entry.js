// this is for when we receive materials. This is what generates the COA, ensures the incoming COA meets our retain COA, commits our QA to a log, and maps the generated COA to supplier COA.

const entry = {
    lot: 'lot',
    date: 'date',
    expiry: 'expiry',
    name: 'name',
    data: [],
    retainPassInspection: true,
    oos: false, // out of specification, true if any one result doesn't meet spec
    oosProperties: [],
    coaResults: [],
    aliases: [],
    incomingInspection: false,
    publicCoaUrl: 'url',
    quickAddLot: 'lot'
};

function toggleMainExtraParameters() {

    let hidden = pl.getRange('Q6');

    if (hidden.getValue()) {

        ma.showColumns(11,3);
        hidden.setValue(false);


    } else {

        ma.hideColumns(11,3);
        hidden.setValue(true);

    }

}

function saveEntryBasics() {

    // saves lot
    let lot = ma.getRange('C6').getValue();
    entry.lot = lot;

    // saves name
    let name = ma.getRange('C14').getValue();
    entry.name = name;

    // saves main data
    let data = CoffeeMaki.getDataArray(ma, 'H4', 'H6:N', 5);
    entry.data = data;

    // get retina pases inspection
    let retain = ma.getRange('R12').getValue();
    entry.retainPassInspection = retain;

    // save aliases
    let aliases = CoffeeMaki.getDataArray(ma, 'R22', 'R18:R', 17);
    entry.aliases = aliases;

    // save incoming inspection
    let incomingInspection = ma.getRange('C24').getValue();
    entry.incomingInspection = incomingInspection;
}


function utilityResultMeetsSpecification(analyticalProperty, type, q1, q2, result) {

    switch (type) {
        case 'Between': {
            
            if (result > q2 || result < q1) {
                entry.oos = true;
                entry.oosProperties.push(analyticalProperty);
            }
            break;
        }
        case 'Great Than Equal To': {
            
            if (result < q1) {
                entry.oos = true;
                entry.oosProperties.push(analyticalProperty);
            }
            break;
        }
        case 'Great Than': {
            
            if (result <= q1) {
                entry.oos = true;
                entry.oosProperties.push(analyticalProperty);
            }
            break;
        }
        case 'Less Than Equal To': {
            
            if (result > q1) {
                entry.oos = true;
                entry.oosProperties.push(analyticalProperty);
            }
            break;
        }
        case 'Less Than': {
            
            if (result >= q1) {
                entry.oos = true;
                entry.oosProperties.push(analyticalProperty);
            }
            break;
        }
        case 'Minimum': {
            
            if (result < q1) {
                entry.oos = true;
                entry.oosProperties.push(analyticalProperty);
            }
            break;
        }
        case 'Maximum': {
            
            if (result > q1) {
                entry.oos = true;
                entry.oosProperties.push(analyticalProperty);
            }
            break;
        }
        case 'Standard': {
            
            if (result !== 'Conforms') {
                entry.oos = true;
                entry.oosProperties.push(analyticalProperty);
            } 
            break;
        }
        default:
            break;
    }

}

function utilityDeconstructLot() {

    let ao = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1CR5aXW6MtrUWh92Uj-KKCFkt-nZ9rfeIlPTQEprW5yA/edit').getSheetByName("Month Codes");


    let lot = entry.lot;
    let index = lot.indexOf('.');
    let dateCode = lot.slice(index + 4, lot.length);
    let day = dateCode.slice(1,3);
    let year = dateCode.slice(3,5);
    let monthCode = dateCode.slice(0,1);

    // get year column
    let yearRange = ao.getRange('D4:Z4');
    let yearCol = yearRange.createTextFinder('20' + year).findNext();
    let colNumber = yearCol.getColumn();
    let col = CoffeeMaki.columnToLetter(colNumber);
    let testYear = ao.getRange(col + '4').getValue();

    // get month code row inside of year column
    let monthCodeRange = ao.getRange(col + '5:' + col + '16');
    let monthRow = monthCodeRange.createTextFinder(monthCode).findNext();
    let rowNumber = monthRow.getRow();
    let month = ao.getRange('C' + rowNumber).getValue();

    let date = new Date(testYear, month, day,0,0,0,0);

    entry.date = date;
}

function utilityBuildAndDropCoaResults() {

    let data = entry.data;
    let i = 0;

    while (i < data.length) {

        let ap = data[i][0];
        let specification = data[i][1];
        let result = data[i][6];
        let uom = data[i][2];
        let status = 'Pass';

        let row = [ap, null, null, null, specification, result, uom, status];

        entry.coaResults.push(row);
        i++;
    }

    let range = co.getRange('B21:I' + (20 + entry.coaResults.length));
    range.setValues(entry.coaResults);
}

function utilityGenerateCoaPdf() {

    const url = 'https://docs.google.com/spreadsheets/d/1aMtyRB00joK9Aw-nvfPobfFBw8JZp2I_n467mzCGmzM/export?';

    let productName;

    if (entry.aliases.length > 0) {
        productName = entry.aliases[0];
    } else {
        productName = entry.name;
    }

    let filename = `${productName} [${entry.lot}] COA.pdf`;

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
        '&gid=448691412';
    
    // PDF parameters 

    var params = {method:"GET",headers:{"authorization":"Bearer "+ ScriptApp.getOAuthToken()}};

    // PDF generation
    
    var response = UrlFetchApp.fetch(url+pdfOptions, params).getBlob();

    // File parameters
    var folder = DriveApp.getFolderById('1cwwk-OAg3YivfvX05-EfzrCv7HfGEFOV'); 

    // Save file to google drive
    let document = folder.createFile(response.setName(filename));

    let documentUrl = document.getUrl();

    entry.publicCoaUrl = documentUrl;
     

}

function utilityCommitToArchive() {

    // defining parameters not previously saved
    let cid = ma.getRange('C11').getValue();
    let po = ma.getRange('C20').getValue();
    let supplierLot = ma.getRange('C17').getValue();
    let qualityNotes = ma.getRange('C27').getValue();
    
    // retrieve and make pdf icons
    let publicPdf = utilityBuildPdfIcon(entry.publicCoaUrl);
    let supplierPdfName = `${entry.name} [${supplierLot}] COA.pdf`;
    let supplierPdfUrl = runGetFileUrl('10QxO3YQ_74P9Lukr1zfZKUg4bdlg4bEF',supplierPdfName);
    let supplierPdf = utilityBuildPdfIcon(supplierPdfUrl);

    // build payload
    let payload = [[entry.lot, cid, entry.name, entry.aliases[0], po, supplierLot, qualityNotes, entry.date, entry.expiry, supplierPdf, publicPdf, supplierPdfUrl, entry.publicCoaUrl]];

    // delivery
    let range = CoffeeMaki.dropZoneRangeAlt(ar, 'C', 'O', 6, 'C4', payload.length);
    range.setValues(payload);
    CoffeeMaki.setBorderStandard(range);
    CoffeeMaki.rangeSort(ar, 'C', 'O', 6, 'C4');

}

function utilityBuildPdfIcon(url) {
    
    let icon = 'https://i.imgur.com/8GbOraM.png';
    let formula = `=HYPERLINK(\"${url}\",IMAGE(\"${icon}\"))`;
    return formula;

}

function utilityQuickAddLot() {
    
    // define  data zones
    let cid = ma.getRange('V15');
    let date = ma.getRange('V9');
    let supplierLot = ma.getRange('V12');
    let runBool = false;
    let payload = [];

    // ensure not blank

    if (cid.isBlank() || date.isBlank() || supplierLot.isBlank()) {

        ui.alert('Quick add requires a Product with a CID, DOM, and Supplier Lot. Try again mate.');

    } else {

        runBool = true;
        let lot = CoffeeMaki.lotGenerator(cid.getValue(),date.getValue());
        entry.quickAddLot = lot;
        payload.push([cid.getValue(), null, lot, supplierLot.getValue(),null, null,null, null,null, null ]);

    }

    if (runBool) {

        //drop payload
        let sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o/edit').getSheetByName("Inventory");
        let dropZone = CoffeeMaki.dropZoneRangeAlt(sheet, 'C', 'L', 6, 'C4', payload.length);
        dropZone.setValues(payload);
        CoffeeMaki.setBorderStandard(dropZone);
        CoffeeMaki.rangeSort(sheet, 'C', 'L', 6, 'C4');

    }

    ma.getRange('V6').clearContent();
    date.clearContent();
    supplierLot.clearContent();

}

function runGetFileUrl(folderId, name) {

    let files = DriveApp.getFolderById(folderId).getFilesByName(name);
    while (files.hasNext()) {
        let file = files.next();
        return file.getUrl();
    }

}



function runSpecificationExams() {

    let data = entry.data;
    let i = 0;
    while (i < data.length) {

        let analyticalProperty = data[i][0];
        let type = data[i][3];
        let q1 = data[i][4];
        let q2 = data[i][5];
        let result = data[i][6];

        utilityResultMeetsSpecification(analyticalProperty, type, q1, q2, result)

        i++;
    }

}

function runBuildAndDropCoaDetails() {

    // parameters
    let name = ma.getRange('C14').getValue();
    let cid = ma.getRange('C11').getValue();1
    let aliases = entry.aliases.flat();
    let dom = entry.date;
    let lot = entry.lot;
    let lotAlias = ma.getRange('R9').getValue();

    // build expiry bases on years out from !R6
    let domYear = dom.getFullYear();
    let domMonth = dom.getMonth();
    let domDay = dom.getDay();
    let expiryYearsOut = ma.getRange('R6').getValue();
    let expiry = new Date(domYear + expiryYearsOut, domMonth, domDay);

    //save expiry for later use
    entry.expiry = expiry;

    // push elements to coa sheet
    co.getRange('D11').setValue(name);
    co.getRange('D66').setValue(name);
    co.getRange('D131').setValue(name);
    co.getRange('D12').setValue(cid);
    co.getRange('D13').setValue(aliases);
    co.getRange('D14').setValue(dom);
    co.getRange('D15').setValue(expiry);
    co.getRange('H11').setValue(lot);
    co.getRange('H12').setValue(lotAlias);

}


function runOutOfSpecificationCheck() {

    if (entry.oos) {

        // alert the user
        ui.alert('The following specifications were out of specification: ' + entry.oosProperties + '. A Quality Note message was logged and a COA will not be generated.');

        // create note log
        let timestamp = new Date();
        let lot = entry.lot;
        let type = 'OOS';
        let note = 'The following specifications were out of specification during QA-Components/Main!: ' + entry.oosProperties + '.';
        let by = Session.getActiveUser().getEmail();

        let log = [[timestamp, lot, type, note, null, by]];
        
        /* changing where it is dumping
        let range = CoffeeMaki.dropZoneRangeAlt(qn, 'C', 'H', 6, 'C4', log.length);
        range.setValues(log);
        CoffeeMaki.setBorderStandard(range);
        */

        const ls = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1wDYokdYMP4TM0BP6w-ukVztepYJ_EGQto-UJb-Vzk7A/edit').getSheetByName('QualityAlerts');
        let range = CoffeeMaki.dropZoneRange(ls,'A', 'F', 1);
        range.setValues(log);

    }
}

function runAditionalInspections() {

    if (!entry.retainPassInspection) {
        
        entry.oos = true;
        entry.oosProperties.push('Retain Sample Inspection');

    }

    if (entry.incomingInspection === false) {

        entry.oos = true;
        entry.oosProperties.push('Incoming Inspection Has Issues');

    }

}

function runtWait(){
    var lock = LockService.getScriptLock(); lock.waitLock(300000); 
    SpreadsheetApp.flush(); lock.releaseLock();
  }

function executeResultQA() {

    runAditionalInspections();
    runSpecificationExams();
    runOutOfSpecificationCheck();



}

function executeCoaGeneration() {

    clearEntryCoa();
    runtWait();
    runBuildAndDropCoaDetails();
    utilityBuildAndDropCoaResults();
    Logger.log('Data entered...generated COA now...')
    runtWait();
    utilityGenerateCoaPdf();
  

}

function executeEntry() {

    saveEntryBasics();
    utilityDeconstructLot()
    executeResultQA();

    if (!entry.oos) {
        executeCoaGeneration();
        utilityCommitToArchive();
      
    } else {
        ui.alert('Something appears to have failed or is OOS. Pleae investigate.');
    }
    clearEntryAll();

}

function clearEntryAll() {

    ma.getRange('C6').clearContent();
    ma.getRange('N6:N51').clearContent();
    ma.getRange('R6').setValue(2);
    ma.getRange('R9').clearContent();
    ma.getRange('R12').setValue(true);

    
}

function clearEntryCoa() {

    // this lived in the clearEntryAll, but it seems that it was clearing the data faster than the generator was generating. For this reason it will be left and cleared at the start of the next coa generation

    co.getRange('D11:D15').clearContent();
    co.getRange('H11:H12').clearContent();
    co.getRange('B21:I64').clearContent();
}