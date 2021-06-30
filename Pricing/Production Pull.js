const productionData = {

    purchasesArchive: [],
    productionSummaryPdfUrl: 'url',
    priceLockBoolean: null,
    scentFormula: null
};

function boolBatchIsScent(mbprId) {

    // this determines if the batch is a scent blend
    let suffix = mbprId.slice(0,2);

    if (suffix === 'EO' || suffix === 'FO') {

        productionData.scentFormula = true;

    } else {

        productionData.scentFormula = false;

    }

}

function pullBatchSize() {

    let mbprId = pd.getRange('D8').getValue();
    
    let lookupRow = CoffeeMaki.determineRowExternalSheet(fd, "D6:D", 6, mbprId);

    let batchSize = fd.getRange('E' + lookupRow).getValue();

    return batchSize;

}

function pullBatchTime() {

    let mbprId = pd.getRange('D8').getValue();
    boolBatchIsScent(mbprId);
    let time;
    
    if (productionData.scentFormula) {

        time = 0.083;

    } else {
    
        let lookupRow = CoffeeMaki.determineRowExternalSheet(fd, "V6:V", 6, mbprId);

        time = fd.getRange('W' + lookupRow).getValue();

    }

    return time;

 }



function pullBillOfMaterials() {

    let mbprId = pd.getRange('D8').getValue();
    let bomMasterArray = fd.getRange('I6:K' + (5 + fd.getRange('I4').getValue())).getValues();


    let billOfMaterials = bomMasterArray.filter(function(row) {

        return row[0] === mbprId;

    });

    return billOfMaterials;

}

function pullLastPrice(cid) {

    let data = productionData.purchasesArchive[0];
    
    let purchases = data.filter(function(component) {

        return component[0] === cid;
    });

    let purchaseOrders = purchases.map(x => x[1]);
 
    let maxIndex = purchaseOrders.indexOf(Math.max.apply(null,purchaseOrders));

    let price = purchases[maxIndex][2];

    return price;
  
}

function pullProductionHistory() {

    let hi = ss.getSheetByName('History');
    let cid = pd.getRange('D6').getValue();
    let count = hi.getRange('C4').getValue();
    let data = hi.getRange('C6:I' + (5 + count)).getValues();
    let i = 0;
    let history = [];

    let historyRaw = data.filter(function(entry) {

        return entry[0] === cid;

    });

    while (i < historyRaw.length) {

        let timestamp = historyRaw[i][1];
        let usernotes = historyRaw[i][3];
        let production = historyRaw[i][4];
        let final = historyRaw[i][5];
        let report = historyRaw[i][6].toString();

        history.push([timestamp, null, usernotes, null, production, final, report]);

        i++;

    }

    return history;

}



function pullFillWeights() {

    let count = pd.getRange('M4').getValue();

    if (count === 0) {
        let response = ui.prompt('No Fill Weights', 'It appears there are no fill weights added for this product. Would you like to go to the form to add some?', ui.ButtonSet.YES_NO);

        if (response.getSelectedButton() == ui.Button.YES) {
            let urls = ["https://docs.google.com/spreadsheets/d/15JdQoLLt2ExlglrIwJxVXxbbCa_qdXV-K1IdfJ31gY8/edit"];

            CoffeeMaki.openTabs(urls);

        }

    } else {
        
        let data = pd.getRange('N6:N14').getValues().flat();
        for (let i = 1; i <= data.length; i += 2) {
            data.splice(i,1);
        }
        let chunkedData = chunkSelection(data);

        return chunkedData;


    }

}


function chunkSelection(array) {

    // chunks the array into groups of 5. so if array has [1,2,3,4,5,6], this turns it into [1,2,3,4,5] and [6]. this is because the form only takes 5 samples at a time.

    let chunkedArray = [];

    for (let i = 0; i < array.length; i++) {

        if ( i % 2 === 0) {

            // begin a new array
            chunkedArray.push([array[i]]);

        } else {

            // pushes to current subarray in multidimensional array
            chunkedArray[chunkedArray.length - 1].push(array[i]);

        }
    }

    return chunkedArray;

}

function savePurchasesArchive() {

    // this functions saves the pricing archive so it only needs to be called once and saved to an object.

    let sheet = ss.getSheetByName('Purchases Archive');
    let count = sheet.getRange('C4').getValue();
    let data = sheet.getRange('D6:F' + (5 + count)).getValues();
    productionData.purchasesArchive.push(data);

}

function assembleBillOfMaterialsCosting() {

    let bomRaw = pullBillOfMaterials();
    let rawMaterialMarkupPercentage = st.getRange('C6').getValue();
    let i = 0;
    let assembly = [];

    savePurchasesArchive(); //saved archive to object so only called once.

    while (i < bomRaw.length) {

        let row = i + 1;
        let cid = bomRaw[i][1];
        let concentration = bomRaw[i][2];
        let nameFormula = '=VLOOKUP(H' + (i + 6) + ',Components!C5:D,2,FALSE)';
        let lastPrice = pullLastPrice(cid);
        let markup = lastPrice * rawMaterialMarkupPercentage;
        let costPerPoundProduct = markup * (concentration * 0.01);


        assembly.push([row,cid, nameFormula, concentration, lastPrice, markup, costPerPoundProduct]);
        i++;
    }

    return assembly;

}




function injectProductionData() {

    // this triggers all
    clearProductionData();
    injectProductionBasicData();
    injectProductionBillOfMaterials();
    injectProductionFillWeights();
    injectProductionHistory();

}

function injectProductionBasicData() {

    ps.getRange('W8').setValue(pullBatchSize());
    ps.getRange('W10').setValue(pullBatchTime());
}

function injectProductionBillOfMaterials() {

    let data = assembleBillOfMaterialsCosting();
    let range = ps.getRange('G6:M' + (5 + data.length));
    range.setValues(data);

}

function injectProductionFillWeights() {

    let data = pullFillWeights();
    let range = pd.getRange('N19:O21');
    range.setValues(data);

}

function injectProductionHistory() {

    let data = pullProductionHistory();

    if (data.length === 0) {

        Logger.log('No history to pull');

    } else {

        let entriesCount = data.length;
        let range = ps.getRange('G37:M' + (36 + entriesCount));
        range.setValues(data);
    }

}

function clearProductionDataResetButton() {

    // this is necessary because the reset button also clears the selected base. however, when clear production data is triggered from the injectproductiondata function, the selected base cannot be cleared.

    clearProductionSelectedProduct();
    clearProductionData();

}

function clearProductionData() {

    // this triggers all the clears
    clearProductionBasicData();
    clearProductionBillOfMaterials();
    clearProductionFillWeights();
    clearProductionHistory();
    clearProductionSystemLogs();

}

function clearProductionBasicData() {

    ps.getRange('W8').clearContent();
    ps.getRange('W10').clearContent();

}

function clearProductionSelectedProduct() {

    ps.getRange('C6').clearContent();

}

function clearProductionBillOfMaterials() {

    ps.getRange('G6:M30').clearContent();

}

function clearProductionFillWeights() {

    pd.getRange('N19:O21').clearContent();

}   

function clearProductionHistory() {

    ps.getRange('G37:M').clearContent();

}

function clearProductionSystemLogs() {

    pd.getRange('T6:T34').clearContent();

}