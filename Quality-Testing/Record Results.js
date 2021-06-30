function boolOnlyOneEntry() {

   
    let entries = CoffeeMaki.getDataArray(ma, 'H4', 'J6:J', 5).flat(); 

    let onlyOne = (current) => current === 1;

    let result = entries.every(onlyOne);

    return result;

}

function buildResultArray() {

    let requiredArray = CoffeeMaki.getDataArray(ma,'H4', 'H6:I', 5);
    let lot = ma.getRange('C6').getValue();
    let resultArray = [];
    let i = 0;

    while (i < requiredArray.length) {

        let parameterType = requiredArray[i][1];

        switch (parameterType) {
            case 'Viscosity': {

                let vd = ss.getSheetByName('viscosityData');
                let methodId = requiredArray[i][0];
                let lotMethod = lot + '-' + methodId;

                let dataRow = CoffeeMaki.determineRowExternalSheet(vd, 'B2:B', 2, lot);
                let data = vd.getRange('A' + dataRow + ':J' + dataRow).getValues().flat();
                let viscosity = data[8];
                let units = 'mPa·s';
                let note = 'Temperature = rt' + '; ' +
                           'Spindle \= Brookfield#' + data[2] + '; ' +
                           'RPM = ' + data[3] + '; ' +
                           'Container = ' + data[7]; 

                let specification = 'needs work brah';

                resultArray.push([lotMethod, lot, methodId, 'Viscosity', specification, viscosity, units, 'Pending', note]);
                break;
            }
            default:
                break;
        }

        i++;
    }
    return resultArray;
}

function executeAutoResultValidation() {

    if(!boolOnlyOneEntry()) {

        ui.alert('Bulk result recording is only available when each parameter only has one examination data. Please enter result manually.');

    } else {

        executeAutoResult();

    }

}



function executeAutoResult() {

    let results = buildResultArray();
    let zone = CoffeeMaki.dropZoneRangeAlt(re, 'C', 'K', 6, 'C4', results.length);
    zone.setValues(results);
    
}

