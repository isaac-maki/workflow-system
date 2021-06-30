function pullAddFillingWeights() {

    let cid = ds.getRange('M5').getValue();
    let array = ds.getRange('M8:O10').getValues().flat();

    array.unshift(cid);
    
    let payload = [array]
    return payload;    

}

function dropAddFillingWeights() {

    let payload = pullAddFillingWeights();

    let dropRange = CoffeeMaki.dropZoneRangeAlt(fw, 'C', 'L', 6, 'C4', 1) 
    dropRange.setValues(payload);
    CoffeeMaki.setBorderStandard(dropRange);
    
}

function clearAddFillWeights() {

    let sheet = ss.getSheetByName("Add Fill Weights");

    sheet.getRange('C5').clearContent();
    sheet.getRange('D13:D14').clearContent();
    sheet.getRange('E12:F14').clearContent();
    CoffeeMaki.rangeSort(fw, "C", "L", 6, "C4");
}

function executeAddFillWeight() {

    dropAddFillingWeights();
    clearAddFillWeights();

}