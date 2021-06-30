function pullBillOfMaterials() {

    let mbprCount = fdb.getRange('I4').getValue();
    let mbprMasterArray = fdb.getRange('I6:L' + (5 + mbprCount)).getValues();

    let activeMbpr = cb.getRange('C9').getValue();

    let billOfMaterials = mbprMasterArray.filter(function(component) {

        return component[0] === activeMbpr;

    });

    billOfMaterials.forEach(function(component) {
        component.shift();
    });

    let i = 0;
    while (i < billOfMaterials.length) {
        billOfMaterials[i].unshift(i + 1);
        let formula = '=VLOOKUP(I' + (i+6) + ',Components!C5:D,2,FALSE)';
        billOfMaterials[i].splice(2,0, formula);
        i++;
    }

    return billOfMaterials;

}

function pullAvailableComponents() {

    let bprNeeded = ss.getSheetByName('.bprNeeded');

    let componentsCount = bprNeeded.getRange('C4').getValue();
    let availableComponentsArray = bprNeeded.getRange('C6:E' + (5 + componentsCount)).getValues();

    let i = 0;
    while (i < availableComponentsArray.length) {

        let formula = '=VLOOKUP(S' + (i+6) + ',Components!C5:D,2,FALSE)';
        availableComponentsArray[i].splice(1,0,formula);
        i++;
    }

    return availableComponentsArray;
}


function bomHasDuplicatesBool() {

    let bom = pullBillOfMaterials();
    bom.forEach(function(bomLine) {

        bomLine.splice(0,1);
        bomLine.splice(1,3);
    });
    
    let dupBool = checkForDuplicates(bom.flat());

    return dupBool;

    
}

function pullData() {

    dropBillOfMaterials();
    
}


function pulledDataBool() {

    let value = bu.getRange('D31').getValue();

    if (value) {
        return true;
    } else {
        return false;
    }

}

function pullFillWeights() {

    let count = bu.getRange('U4').getValue();

    if (count === 0) {
        let response = ui.prompt('No Fill Weights', 'It appears there are no fill weights added for this product. Would you like to go to the form to add some?', ui.ButtonSet.YES_NO);

        if (response.getSelectedButton() == ui.Button.YES) {
            let urls = ["https://docs.google.com/spreadsheets/d/15JdQoLLt2ExlglrIwJxVXxbbCa_qdXV-K1IdfJ31gY8/edit"];

            CoffeeMaki.openTabs(urls);

        }

    } else {

        let data = bu.getRange('V6:V14').getValues().flat();
        let chunkedData = chunkSelection(data);

        return chunkedData;


    }



}

function checkForDuplicates(array) {
    return new Set(array).size !== array.length;
}

function chunkSelection(array) {

    // chunks the array into groups of 5. so if array has [1,2,3,4,5,6], this turns it into [1,2,3,4,5] and [6]. this is because the form only takes 5 samples at a time.

    let chunkedArray = [];

    for (let i = 0; i < array.length; i++) {

        if ( i % 3 === 0) {

            // begin a new array
            chunkedArray.push([array[i]]);

        } else {

            // pushes to current subarray in multidimensional array
            chunkedArray[chunkedArray.length - 1].push(array[i]);

        }
    }

    return chunkedArray;

}


function buildCompoundingArray() {

    let bomCount = bu.getRange('D7').getValue();

    let bomArray = bu.getRange('I6:L' + (5 + bomCount)).getValues();
 
    let payload = [];
    let i = 0;
    while (i < bomArray.length) {
        let indexNumber = 1 + i;
        let phase = bomArray[i][1];
        let cid = bomArray[i][0];
        let materialName = bomArray[i][3];
        let needed = bomArray[i][2];
        payload.push([indexNumber, phase, null, null, null, cid, materialName, null, needed, null, null,]);
        i++;
    }

    return payload;
}




function dropCreateBprData() {

    dropAvailableComponents();
    dropFillWeights();

}


function dropAvailableComponents() {

    let components = pullAvailableComponents();

    let dropZone = CoffeeMaki.dropZoneRangeAltExtUtil(cb, 'S', 'V',6, bu.getRange('D9'), components.length);

    dropZone.setValues(components);

}

function dropFillWeights() {
    
    let data = pullFillWeights();

    if (data.length > 0) {
        
        let dropZone = cb.getRange('Z6:AB8');
        dropZone.setValues(data);

    } else {

        Logger.log("No drop fill weights.")

    }

}


function dropBillOfMaterials() {

    let bom = pullBillOfMaterials();

    let dropZone = CoffeeMaki.dropZoneRangeAltExtUtil(cb,'H','L',6,bu.getRange('D7'),bom.length);
    dropZone.setValues(bom);

 

}


function dropCompoundingArray() {

    let compoundingTable = buildCompoundingArray();

    let bs = ss.getSheetByName('BPR');
    
    let dropZone = CoffeeMaki.dropZoneRangeAltExtUtil(bs, 'B', 'L',10,  bu.getRange('D13'), compoundingTable.length);

    dropZone.setValues(compoundingTable);

    // bordered cells
    let i = 0;
    while (i < compoundingTable.length) {
        let row = 10 + i;
        let tableRow = bs.getRange('B' + row + ':L' + row);
        let pwOne = bs.getRange('D' + row);
        let pwTwo = bs.getRange('F' + row);
        let add = bs.getRange('K' + row);
        tableRow.setBorder(true, null, true, null, null, null, '#b0b0b0', SpreadsheetApp.BorderStyle.SOLID);
        pwOne.setBorder(true, true, true, true, true, true, '#333333', SpreadsheetApp.BorderStyle.SOLID_MEDIUM); 
        pwTwo.setBorder(true, true, true, true, true, true, '#333333', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
        add.setBorder(true, true, true, true, true, true, '#333333', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
        i++;
    }

}

function generateBpr() {
    dropCompoundingArray();
    dropBprDetails();
    dropAdditionalDetails();

}

function dropBprDetails() {

    let timestamp = new Date();
    let cid = bu.getRange('D5').getValue();
    let mbprId = bu.getRange('D15').getValue();
    let batchSize = bu.getRange('D17').getValue();
    let batchNumber = CoffeeMaki.lotGenerator(cid, timestamp);
    let productName = bu.getRange('D19').getValue();
    let bprId = bu.getRange('D21').getValue() + 1;

    bs.getRange('F2').setValue(bprId);
    bs.getRange('F3').setValue(batchNumber);
    bs.getRange('K2').setValue(productName);
    bs.getRange('K3').setValue(mbprId);
    bs.getRange('K4').setValue(batchSize);
    bs.getRange('K5').setValue(timestamp);

}

function dropAdditionalDetails() {

    // this drops fill weights and the work instructions

    let data = bu.getRange('U17:V19').getValues();
    let i = 0;
    while (i < data.length) {
        data[i].splice(1,0,null);
        i++;
    }

    let dz = bs.getRange('D41:F43');
    dz.setValues(data);




}

function onEdit() {

    if (cb.getRange('C6').getValue() !== ''  && bu.getRange('D7').getValue() === 0) {
        pullData();
    } 
}



function toggleAvailableMaterials() {

    let hidden = bu.getRange('D31');

    if (hidden.getValue()) {

        cb.showColumns(18,6);
        hidden.setValue(false);


    } else {

        cb.hideColumns(18,6);
        hidden.setValue(true);

    }
}
