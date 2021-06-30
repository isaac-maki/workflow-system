function boolPassSpecification(specificationArray, result) {

   let type = specificationArray[0];
   let q1 = specificationArray[1];
   let q2 = specificationArray[2];
   let outcome;


   switch (type) {
       case "Between": {

            if (result < q1 || result > q2) {
                outcome = false;
            } else {
                outcome = true;
            }
            break;
       }
       case "Maximum": {

            if (result > q1 ) {
                outcome = false;
            } else {
                outcome = true;
            }
            break;
       }
       case "Minimum": {

        if (result < q1 ) {
            outcome = false;
        } else {
            outcome = true;
        }
        break;
        }
       default:
           break;
   }

   return outcome;
}

function pullSpecification(cid, methodId) {

    let cidMethod = cid + '-' + methodId;
    let row = CoffeeMaki.determineRowExternalSheet(sp, 'C6:C', 6, cidMethod);
    Logger.log(row)
    let spec = sp.getRange('G' + row + ':J' + row).getValues().flat();

    return spec;

}

function pullResult(method) {

    let lot = qc.lot;
    let lotMethod = lot + '-' + method;
    let row = CoffeeMaki.determineRowExternalSheet(re, 'C6:C', 6, lotMethod);
    qc.currentRow = row;

    let result = re.getRange('H' + row).getValue();

    return result;



}

function pullBasicData(){

    //saves basic data so we don't pull it every time.

    let lot = ma.getRange('C6').getValue();
    let cid = ma.getRange('C10').getValue();
    qc.cid = cid;
    qc.lot = lot;
}

function buildSpecificationText(specificationArray) {

    let type = specificationArray[0];
    let q1 = specificationArray[1];
    let q2 = specificationArray[2];
    let text;

    switch (type) {
        case 'Between': {

            text = q1 + ' ≤ x ≤ ' + q2;
            break;
        }   
        default:
            break;
    }

    return text;
}

function buildExamResultsArray() {

    let items = CoffeeMaki.getDataArray(ma, 'P4', 'P6:P', 5);
    let cid = qc.cid;
    let array = [];
    let i = 0;
    
    while (i < items.length) {

        let methodId = items[i][0];

        let specification = pullSpecification(cid, methodId);
        let units = specification[3];
        let result = pullResult(methodId);

        let specificationText = buildSpecificationText(specification);
        let examOutcome = boolPassSpecification(specification, result);

        updateResultRow(specificationText, examOutcome);

        array.push([specificationText, result, units, examOutcome]);

        i++;
    }

    return array;
}

function updateResultRow(specificationText, examOutcome) {

    let status;
    
    if (examOutcome === true) {
        status = 'Pass';
    } else {
        status = 'Fail';
    }

    re.getRange('G' + qc.currentRow).setValue(specificationText);
    re.getRange('J' + qc.currentRow).setValue(status);


}

function deliverExamResults() {

    let data = buildExamResultsArray();
    let range = CoffeeMaki.dropZoneRangeAlt(ma, 'R', 'U', 6, 'R4', data.length);
    range.setValues(data);

}

function executeSpecificationValidation() {
    
    pullBasicData();
    deliverExamResults();

}