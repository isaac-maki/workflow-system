const disperseData = {

    parentLot: 'lot',
    parentAmount: 0,
    cid: 'cid',
    bprId: 'id',
    disperseTransactionArray: [],
    disperseInventoryArray: [], 
    childLots: [],
    childLotInfo: [],
    quarantined: false,
    pending: false,
    fwDrum: 0,
    fwPail: 0,
    fwGallon: 0
};

function saveDisperseBasicInfo() {

    // save parent lot number
    disperseData.parentLot = di.getRange('C6').getValue();

    // save parent amount
    let row = CoffeeMaki.determineRowExternalSheet(ab, 'D6:D', 6, disperseData.parentLot);
    let batchSize = ab.getRange('H' + row).getValue();
    disperseData.parentAmount = batchSize;

    // save cid
    let cid = di.getRange('C16').getValue();
    disperseData.cid = cid;

    // save bprId   
    let bprId = di.getRange('C13').getValue();
    disperseData.bprId = bprId;

    // save parent info  
    let quarantined = di.getRange('D20').getValue();
    let pending = di.getRange('D21').getValue();
    disperseData.quarantined = quarantined;
    disperseData.pending = pending;


}

function saveDisperseFillWeights() {

    let r = CoffeeMaki.determineRowExternalSheet(fw, 'C6:C', 6, disperseData.cid);

    let drum = fw.getRange('F' + r).getValue();
    let pail = fw.getRange('I' + r).getValue();
    let gallon = fw.getRange('L' + r).getValue();

    disperseData.fwDrum = drum;
    disperseData.fwPail = pail;
    disperseData.fwGallon = gallon;

}

function buildChildLots(startingNumber, type, quantity, info) {

    let childLotSuffixes = [];
    let childLots = [];
    let containerEstimation;
    let infoAndCount = info
    let i = 0;
    let x = 0;
    let typeLetter;
    switch (type) {
        case 'Tote':
            typeLetter = 'T';
            break;
        case 'Drum':
            typeLetter = 'D';
            break;
        case 'Pail':
            typeLetter = 'P';
            break;
        case 'Gallon':
            typeLetter = 'G';
            break;  
        case 'Sample':
            typeLetter = 'S';
            break;
        default:
            typeLetter = 'ERROR';
            break;
    }

    while (i < quantity) {

        let j = i + startingNumber;
        let suffix = typeLetter + j;
        childLotSuffixes.push(suffix);
        i++;
    }

    while (x < childLotSuffixes.length) {

        let lot = disperseData.parentLot + childLotSuffixes[x];
        childLots.push(lot);
        disperseData.childLotInfo.push([lot, info]);
        x++;
    }

    return childLots;
}



function utilityDisperseTransactionArray(type, quantity, weight, info) {

    let timestamp = new Date();
    let cid = disperseData.cid;
    let startingNumber = 1
    let childLots = buildChildLots(startingNumber, type, quantity, info);
    let category = 'Batch Dispersion';
    let transactionType = 'Add ( + )';
    let amount = weight;
    let notes = 'Dispersed by: ' + disperseData.bprId + ' Executed by :' + Session.getActiveUser();
    let i = 0;
    let array = [];


    disperseData.childLots.push(childLots);

    

    while (i < childLots.length) {

        let lot = childLots[i];
        array.push([timestamp, cid, lot, category, transactionType, amount, null, notes])
        i++;
    }

    disperseData.disperseTransactionArray.push(array);

}

function utilityDispenseTankTransactionArray() {
    
    let timestamp = new Date();
    let cid = disperseData.cid;
    let category = 'Batch Dispersion';
    let transactionType = 'Remove ( - )';
    let notes = 'Dispersed by: ' + disperseData.bprId + ' Executed by :' + Session.getActiveUser();
    let lot = disperseData.parentLot;
    let amount = disperseData.parentAmount;
    let array = [];

    array.push([timestamp, cid, lot, category, transactionType, amount, null, notes])

    disperseData.disperseTransactionArray.push(array);

}

function utilityDisperseInventoryArray() {

    let cid = disperseData.cid;
    let lots = disperseData.childLotInfo;
    let infoQuarantine = '';
    let infoPending = '';

    if (disperseData.quarantined) {
        infoQuarantine = '[Quarantined]';
    }

    if (disperseData.pending) {
        infoPending = '[Pending]';
    }

    let i = 0;

    while (i < lots.length) {

        let lot = lots[i][0];
        let info = lots[i][1] + ' ' + infoQuarantine + ' ' + infoPending;

        disperseData.disperseInventoryArray.push([cid, null, lot, info, null, null, null, null, null, null]);

        i++;
    }

}

function initiateDispersion() {

    executeDispersionTank();
    executeDispersionBasicSplit();
    executeDropDisperseArrays();

}

function initiateDisperseActionButton() {

    saveDisperseBasicInfo();
    saveDisperseFillWeights();
    initiateDispersion();
    clearDispersion();

}

function executeDispersionTank() {

    let boolTank = di.getRange('I7').getValue()
    if (boolTank) {

        utilityDispenseTankTransactionArray();

    } else {
        Logger.log('Include tank set to false.')
    }
}

function executeDispersionBasicSplit() {

    let data = CoffeeMaki.getDataArray(di, 'H21', 'H14:K', 13);

    let i = 0;
    let j = 0;

    while (i < data.length) {

        let type = data[i][0];
        let quantity = data[i][1];
        let weight = data[i][2];
        let info = data[i][3];

        utilityDisperseTransactionArray(type, quantity, weight, info);
        i++;
    }

    utilityDisperseInventoryArray();


}


function executeDropDisperseArrays() {

    let transactions = disperseData.disperseTransactionArray.flat(1);
    let inventory = disperseData.disperseInventoryArray;

    // drop transactions
    let transactionsDropZone = CoffeeMaki.dropZoneRangeAlt(tr, 'C', 'J', 5, 'C3', transactions.length);
    transactionsDropZone.setValues(transactions);
    CoffeeMaki.setBorderStandard(transactionsDropZone);
    CoffeeMaki.rangeSort(tr, 'C', 'J', 5, 'C3');
    
    // drop inventory items
    let inventoryDropZone = CoffeeMaki.dropZoneRangeAlt(iv, 'C', 'L', 6, 'C4', inventory.length);
    inventoryDropZone.setValues(inventory);
    CoffeeMaki.setBorderStandard(inventoryDropZone);
    CoffeeMaki.rangeSort(iv, 'C', 'L', 6, 'C4');
    
}

function clearDispersion() {

    di.getRange('C6').clearContent();
    di.getRange('I7').setValue(true);
    di.getRange('H14:K20').clearContent();
}