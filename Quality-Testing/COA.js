const coa = {
    date: 'date',
    expiry: 'date',
    lot: 'lot',
    cid: 'cid',
    name: 'name',
    specifications: [],
    alias: 'lot',
    publicCoaUrl: 'url'
};

function pullBasicData() {

    // pull lot
    let lot = ma.getRange('C6').getValue();
    coa.lot = lot;

    // pull cid
    let cid = ma.getRange('C10').getValue();
    coa.cid = cid;

    // deconstruct lot to get date
    let date = utilityDeconstructLot();

    // set expiry
    
    let expiry = new Date(date.getFullYear() + 2, date.getMonth(), date.getDate());
    coa.expiry = expiry;

    // pull name
    let name = ma.getRange('C13').getValue();
    coa.name = name;

    //pull specification table 
    let specifications = CoffeeMaki.getDataArray(ma, 'P4', 'P6:U', 5);
    coa.specifications = specifications;

    // pull lot alias
    let alias = co.getRange('Y6').getValue();
    coa.alias = alias;


}

function pullTechnicalNote(lotMid) {
    
    let row = CoffeeMaki.determineRowExternalSheet(re, 'C6:C', 6, lotMid);
    Logger.log(row);
    let note = re.getRange('K' + row).getValue();
    return note;

}

function passedSpecicifcation() {

    let specificationResults = CoffeeMaki.getDataArray(ma, 'P4', 'U6:U', 5);

    const checker = results => results.every(Boolean);
    let passed = checker(specificationResults.flat());

    return passed;

}

function utilityDeconstructLot() {

    let ao = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1CR5aXW6MtrUWh92Uj-KKCFkt-nZ9rfeIlPTQEprW5yA/edit').getSheetByName("Month Codes");


    let lot = coa.lot;
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

    coa.date = date;
    return date;
}

function utilityGenerateCoaPdf() {

    const url = 'https://docs.google.com/spreadsheets/d/1ewZrhTsb6nvmabnYIGDFEPozOn_EKoDrX6GoR17mxRM/export?';


    let filename = `${coa.name} [${coa.lot}] COA.pdf`;

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
        '&gid=254779435';
    
    // PDF parameters 

    var params = {method:"GET",headers:{"authorization":"Bearer "+ ScriptApp.getOAuthToken()}};

    // PDF generation
    
    var response = UrlFetchApp.fetch(url+pdfOptions, params).getBlob();

    // File parameters
    var folder = DriveApp.getFolderById('1cwwk-OAg3YivfvX05-EfzrCv7HfGEFOV'); 

    // Save file to google drive
    let document = folder.createFile(response.setName(filename));

    let documentUrl = document.getUrl();

    coa.publicCoaUrl = documentUrl;
     

}

function utilityBuildPdfIcon(url) {
    
    let icon = 'https://i.imgur.com/8GbOraM.png';
    let formula = `=HYPERLINK(\"${url}\",IMAGE(\"${icon}\"))`;
    return formula;

}

function utilityWait(){
    var lock = LockService.getScriptLock(); lock.waitLock(300000); 
    SpreadsheetApp.flush(); lock.releaseLock();
}


function dropCoaProductDetails() {


    // main product details panel
    co.getRange('D11').setValue(coa.name);
    co.getRange('D12').setValue(coa.cid);
    co.getRange('D13').setValue(coa.date);
    co.getRange('D14').setValue(coa.expiry);
    co.getRange('H11').setValue(coa.lot);
    co.getRange('H12').setValue(coa.alias);

    // footer name
    co.getRange('D66').setValue(coa.name);
    co.getRange('D131').setValue(coa.name);


}

function dropCoaSpecificationTable() {
    
    
    let array = coa.specifications;
    const  mergedCells = element => element.splice(2,0,null,null);
    const status = element => element[7] = 'Pass';
    array.every(mergedCells);
    array.every(status);

    let range = co.getRange('B21:I' + (20 + array.length));
    range.setValues(array);
    

}

function dropCoaTechnicallNotes() {
    let array = coa.specifications;
    let lot = coa.lot;
    let notes = [];

    // pull notes and build notes array
    for (let i = 0; i < array.length; i++) {

        let mid = array[i][0];
        let lotMid =  lot + '-' + mid;

        switch (mid) {
            case 'AV-0022':
                notes.push([mid,null,pullTechnicalNote(lotMid)]);
                break;
            case 'XG-7752':
                notes.push([mid,null,pullTechnicalNote(lotMid)]);
                break;
            default:
                break;
        }
    }
    
    // drop notes if any

    if (notes.length > 0) {

        co.getRange('B111:D' + (110 + notes.length)).setValues(notes);

    } else {
        Logger.log("No technical notes to log.");
    }
}

function dropCoaArchive() {

    // defining variabes
    let pdf = utilityBuildPdfIcon(coa.publicCoaUrl);
    let qcStatus = 'Pass'; // if a coa is generated it means it passed.
    let internalNotes = ma.getRange('Y10').getValue();
    let creationDate = new Date();

    // build payload
    let payload = [[coa.lot, coa.cid, coa.name, qcStatus, creationDate, coa.date, coa.expiry, pdf,coa.publicCoaUrl, internalNotes]];



    // delivery
    let range = CoffeeMaki.dropZoneRangeAlt(ar, 'C', 'L', 6, 'C4', payload.length);
    range.setValues(payload);
    CoffeeMaki.setBorderStandard(range);
    CoffeeMaki.rangeSort(ar, 'C', 'L', 6, 'C4');

}

function initiateCoaGeneration() {
    coaClearContents()
    pullBasicData();

    // drop coa sections
    dropCoaProductDetails();
    dropCoaSpecificationTable();
    dropCoaTechnicallNotes();

    // generate coa
    utilityWait();
    utilityGenerateCoaPdf() 

    // commit to archive
    dropCoaArchive();
    executeMainResets();
}

function initateCoa() {

    pullBasicData();
    if (passedSpecicifcation()) {
        initiateCoaGeneration();
    } else {
        ui.alert('This did not pass specification. Please investigate.');
        // perhaps in the future log this and send an alert
    }

}
