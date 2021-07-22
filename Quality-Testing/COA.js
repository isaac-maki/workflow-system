const coa = {
    date: 'date',
    expiry: 'date',
    lot: 'lot',
    cid: 'cid',
    name: 'name',
    specifications: [],
    alias: 'lot'
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

function initateCoa() {

    pullBasicData();
    if (passedSpecicifcation()) {
        initiateCoaGeneration();
    } else {
        ui.alert('This did not pass specification. Please investigate.');
        // perhaps in the future log this and send an alert
    }

}

function initiateCoaGeneration() {
    pullBasicData();
    dropCoaProductDetails();
    dropCoaSpecificationTable();
    dropCoaAdditionalNotes();
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

function dropCoaAdditionalNotes() {

    let parameters = [];
    let array = coa.specifications;

    for (let i = 0; i < array.length; i++) {
        let mid = parameters.push(array[i][0]);
        switch (cid) {
            case value:
                
                break;
        
            default:
                break;
        }
    }

}
