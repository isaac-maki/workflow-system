function pullPendingData() {

    let thresholdTriggeredArray = pullLowQuantity();
    let requestedArray = pullRequested();
    let combinedArray = [...thresholdTriggeredArray, ...requestedArray];
    return combinedArray;

}

function dropPendingData() {
    shPending.getRange('C6:N').clearContent();
    let sheet = ss.getSheetByName('Pending');
    let payload = pullPendingData();
    let dropZone = CoffeeMaki.dropZoneRangeAlt(sheet, 'C', 'J',6, 'C4', payload.length);
    dropZone.setValues(payload);

    dropPendingPurchasesHistory();
}


function pullLowQuantity() {

    // declare low quantity bool sheet from Workflow-Inventory
    let ws = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o/edit');
    let lowQuantity = ws.getSheetByName('.lowQuantityBool');
    let components = ws.getSheetByName('Components');

    // Raw data pull
    let count = lowQuantity.getRange('C4').getValue();
    let data = lowQuantity.getRange('C6:I' + (5 + count)).getValues();

    // filter out to show ones triggered (available less than threshold), not produced, and not archived.
    let dataFiltered = data.filter(function(row) {
        return row[4] === true && row[5] === false && row[6] !== true;
    });

    // variables for payload shared by every row
    let timestamp = new Date();
    let timestampString = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "ddMMYYYYmmss");
    let requester = 'Threshold Trigger';

    // row specific variables and payload creation
    let payload = [];
    let i = 0;
    while (i < dataFiltered.length) {

        let cid = dataFiltered[i][0];
        let requestId = cid + '-' + timestampString;
        let name = components.getRange('D' + CoffeeMaki.determineRowExternalSheet(components, 'C5:C', 5, cid)).getValue();
        let available = dataFiltered[i][1];
        let threshold = dataFiltered[i][2];

        payload.push([requestId, timestamp, cid, name, available, threshold, requester, null]);

        i++;

    }

    return payload;

}


function pullRequested() {

    //sheet declarations
    let ws = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o/edit#');
    let lowQuantity = ws.getSheetByName('.lowQuantityBool');
    let requested = ss.getSheetByName('.requested');
    let components = ws.getSheetByName('Components');


    // raw data pull

    // formulas to put back in
    let r1Formula = '=ARRAYFORMULA(IF(LEN(B2:B),F2:F&\"-\"&TEXT(B2:B,\"DDMMYYMMSS\"),\"\"))';
    let r2Formula = '=ARRAYFORMULA(IF(LEN(B2:B),IF(ISERROR(FIND(\".\",C2:C)),C2:C,SUBSTITUTE(C2:C,MID(C2:C,FIND(\".\",C2:C),100000),\"\")),\"\"))';

    // formula cell.0s
    let r1 = requested.getRange('a2');
    let r2 = requested.getRange('f2');
    r1.clearContent();
    r2.clearContent();
    let lastRow = requested.getLastRow();
    r1.setValue(r1Formula);
    r2.setValue(r2Formula);
    let data = requested.getRange('A2:G' + lastRow).getValues();

    // make payload similar to above function
    let dataFiltered = data.filter(function(row) {
        return row[6] === 'Pending';
    });

     // variables for payload shared by every row

     //payload creation
    let payload = [];
    let i = 0;
    while (i < dataFiltered.length) {

        let requestId = dataFiltered[i][0];
        let timestamp = dataFiltered[i][1];
        let cid = dataFiltered[i][5];

        // IF THE ERROR POINTS HERE: THE CID WAS NOT FOUND IN WF/INVENTORY/.lowQuantityBool
        let available = lowQuantity.getRange('D' + CoffeeMaki.determineRowExternalSheet(lowQuantity, 'C6:C',6, cid)).getValue();
        let threshold = lowQuantity.getRange('E' + CoffeeMaki.determineRowExternalSheet(lowQuantity, 'C6:C',6, cid)).getValue();

        // IF ERROR POINTS HERE: THE CID WAS NOT FOUND IN WF/INVENTORY/COMPONENTS.
        let name = components.getRange('D' + CoffeeMaki.determineRowExternalSheet(components, 'C5:C', 5, cid)).getValue();

        let requester = dataFiltered[i][4];

        payload.push([requestId, timestamp, cid, name, available, threshold, requester, null]);
        i++;
    }
    return payload;

}

const purchaseData = {

    purchaseHistory: []

};

function savePurchasesArchive() {

    // this functions saves the pricing archive so it only needs to be called once and saved to an object.

    let count = ca.getRange('C4').getValue();
    let data = ca.getRange('D6:K' + (5 + count)).getValues();
   purchaseData.purchaseHistory.push(data);

}

function dropPendingPurchasesHistory() {
    savePurchasesArchive();
    let sheet = ss.getSheetByName('Pending');
    let cids = CoffeeMaki.getDataArray(sheet, 'C4', 'E6:E', 5);
    Logger.log(cids)
    let historyArray = [];
    let i = 0;

    while (i < cids.length) {

        let item = cids[i][0];
        let history = pullPendingHistory(item);

        historyArray.push(history);

        i++;
    }
    
    let range = sheet.getRange('K6:M' + (5 + historyArray.length));
    range.setValues(historyArray);

}

function pullPendingHistory(cid) {

    let data = purchaseData.purchaseHistory[0];
    
    let purchases = data.filter(function(component) {

        return component[0] === cid;
    });

    let purchaseOrders = purchases.map(x => x[2]);
 
    let maxIndex = purchaseOrders.indexOf(Math.max.apply(null,purchaseOrders));

    let history;

    if (maxIndex < 0) {

        history = ['No History', 'No History', 'No History'];

    } else {

        let supplier = purchases[maxIndex][4];
        let price = purchases[maxIndex][7];
        let quantity = purchases[maxIndex][5];

        history = [supplier, price, quantity];
    }

    return history;
  
}