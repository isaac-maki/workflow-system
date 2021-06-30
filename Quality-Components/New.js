const coaParameters = {
    cid: 'cid',
    data: [], //main data array from H6:O
    newParameters: [],
    newUom: [],
    specificationPushArray: [],
    boolNewUom: false,
    boolNewParameter: false,
    isPublic: false
    
};

function saveCoaBasics() {

    // save cid
    let cid = ne.getRange('C11').getValue();
    coaParameters.cid = cid;

    // save data
    let data = CoffeeMaki.getDataArray(ne, 'H4', 'H6:P', 5);
    coaParameters.data = data; 

    // save if public
    let public = ne.getRange('C26').getValue();
    coaParameters.isPublic = public;

}

function boolAliases() {

    let n = ne.getRange('D18').getValue();
    if (n > 0) {
        pushAliases();
    } 

}

function boolNewAnalyticalProperty(code, analyticalProperty, uom) {

    let generatedApId;
    if (code <= 0) {

        generatedApId = utilityGenerateApId();
        coaParameters.newParameters.push([generatedApId, analyticalProperty, uom]);
        coaParameters.boolNewParameter = true;
    }
    return generatedApId;
}

function boolNewUom(code, uom) {

    if (code <= 0) {

        coaParameters.newUom.push([uom]);
        coaParameters.boolNewUom = true;
    }

}

function boolUomOverride(uomAuto, uomManual, uomExists) {

    let uom;
    if (uomAuto === '#N/A' || uomManual.length > 0) {

        boolNewUom(uomExists, uomManual);
        uom = uomManual;

    } else {
        uom = uomAuto;
    }

    return uom;

}

function utilityGenerateApId() {

    let c1 = CoffeeMaki.characterFromCode(CoffeeMaki.randomBetween(65,90));
    let c2 = CoffeeMaki.characterFromCode(CoffeeMaki.randomBetween(65,90));
    let rng = CoffeeMaki.leadingZeros(CoffeeMaki.randomBetween(1,9999),4);
    let apId = c1 + c2 + rng;
    return apId;

}

function utilityBuildSpecification(type, q1, q2 = null) {

    let specification;

    switch (type) {
        case 'Between':
            specification = q1 +  " ≤ x ≤ " + q2;
            break;
        case 'Greater Than Equal To':
            specification = "≥ " + q1;
            break;
        case 'Greater Than':
            specification = "> " + q1;
            break;
        case 'Less Than Equal To':
            specification = "≤ " + q1;
            break;
        case 'Less Than':
            specification = "< " + q1;
            break;
        case 'Minimum':
            specification = q1 + 'Minimum';
            break;
        case "Maximum":
            specification = q1 + 'Maximum';
            break;
        case 'Standard':
            specification = q1;
            break;
        default:
            break;
    }

    return specification;
}

function buildSpecificationArray() {

    let data = coaParameters.data;
    let cid = coaParameters.cid;
    let i = 0;

    while (i < data.length) {

        let analyticalProperty = data[i][0];
        let type = data[i][1];
        let q1 = data[i][2];
        let q2 = data[i][3];
        let uomAuto = data[i][4];
        let uomManual = data[i][5];
        let apExists = data[i][6];
        let uomExists = data[i][7];
        let apId = data[i][8];

        // determine if the parameters are new and then add then with new ApId
        let generatedApId = boolNewAnalyticalProperty(apExists, analyticalProperty, uomManual)

        // determine if manual or override uom will be used. Also adds uom if new
        let uom = boolUomOverride(uomAuto, uomManual, uomExists) 

        // uses the generated ap id from generatedApId if it was new, otherwise uses one from data
        if (apExists <= 0) {
            apId = generatedApId;
        }

        // builds specification text for coa generation
        let specification = utilityBuildSpecification(type, q1,q2);

        let cidAp = cid + '-' + apId;

        // pushes to array that will be dropped onto ComponentsParameters!
        coaParameters.specificationPushArray.push([cidAp, cid, apId, analyticalProperty, q1, q2, specification, uom]);

        i++;
        
    }
}

function pushAliases() {

    let aliases = CoffeeMaki.getDataArray(ne,'D18', 'C19:C', 18);
    let i = 0;
    let array = []
    let cid = coaParameters.cid;
    
    while (i < aliases.length) {

        let alias = aliases[i][0];
        array.push([cid, alias]);
        i++;
    }

    let range = CoffeeMaki.dropZoneRangeAlt(sp, 'N', 'O', 6, 'N4', array.length);
    range.setValues(array);
    CoffeeMaki.setBorderStandard(range);
    CoffeeMaki.rangeSort(sp, 'N', 'O', 6, 'N4'); 

}

function pushParameterArray() {

    let array = coaParameters.specificationPushArray;
    let range = CoffeeMaki.dropZoneRangeAlt(sp, 'C', 'J', 6, 'C4', array.length);
    range.setValues(array);
    CoffeeMaki.setBorderStandard(range);
    CoffeeMaki.rangeSort(sp, 'C', 'J', 6, 'C4'); 

}

function pushNewUomArray() {

    let array = coaParameters.newUom;
    let range = CoffeeMaki.dropZoneRangeAlt(pl, 'C', 'C', 6, 'C4', array.length);
    range.setValues(array);
    CoffeeMaki.setBorderStandard(range);
    CoffeeMaki.rangeSort(pl, 'C', 'C', 6, 'C4'); 


}

function pushNewParametersArray() {

    let array = coaParameters.newParameters;
    let range = CoffeeMaki.dropZoneRangeAlt(pl, 'H', 'J', 6, 'H4', array.length);
    range.setValues(array);
    CoffeeMaki.setBorderStandard(range);
    CoffeeMaki.rangeSort(pl, 'H', 'J', 6, 'H4'); 


}

function pushComponentPublicity() {
    
    let range = CoffeeMaki.dropZoneRangeAlt(pl, 'H', 'J', 6, 'H4', array.length);
    range.setValues(array);
    CoffeeMaki.setBorderStandard(range);
    CoffeeMaki.rangeSort(pl, 'H', 'J', 6, 'H4'); 
    
}
function clearNewForm() {

    ne.getRange('C6').clearContent();
    ne.getRange('C19:C21').clearContent();
    ne.getRange('H6:K51').clearContent();
    ne.getRange('M6:M51').clearContent();

}

function executeCoaParameters() {

    saveCoaBasics();
    boolAliases();
    buildSpecificationArray();
    if (coaParameters.boolNewUom) {pushNewUomArray()};
    if (coaParameters.boolNewParameter) {pushNewParametersArray()};
    pushParameterArray();
    clearNewForm();

}