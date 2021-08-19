function getDays() {

    let allSheets = ss.getSheets();
    let sheetNames = []
    allSheets.forEach(sheet => sheetNames.push(sheet.getSheetName()));
    
    let TwoDigitSheets = sheetNames.filter(name => name.length == 2);
    TwoDigitSheets.shift();
    let days = TwoDigitSheets.reverse();
    return days;

}

function buildDateArray() {

    let sums = ss.getSheetByName('Summation');

    let inputDate = sums.getRange('A2').getValue();
    let month = inputDate.getMonth() + 1;
    let year = inputDate.getFullYear();
    let dayArray = getDays();
    
    let i = 0;
    let dateArray = [];
    while (i < dayArray.length) {

        let daySpecific = dayArray[i];
        let dateString = month + '/' + daySpecific + '/' + year;
        dateArray.push([dateString]);
        i++;
    }

    Logger.log(dateArray)

    let j = 0 + dateArray.length;
    while (j < 22) {
        dateArray.push([null]);
        j++;
    }

    Logger.log(dateArray)
    return dateArray;



}

/*
function buildDateRange() {

    let sums = ss.getSheetByName('Summation');

    let dateInPut = new Date(sums.getRange('A2').getValue());
    
    let month = dateInPut.getMonth();
    let year = dateInPut.getFullYear();
    let days = getDays();
    Logger.log(days);

    let dateRange = [];
    let i = 0;
    while (i < days.length) {
        
        let day = parseInt(days[i]);
        Logger.log(day);
        let congifuredDate = new Date(year, month, day);
        Logger.log(congifuredDate);
        dateRange.push([congifuredDate]);
        i++;
    }
    Logger.log(dateRange);
    let datesCount = dateRange.length;
    let j = 0 + datesCount;
    Logger.log(datesCount);
    while (j < 22) {
        dateRange.push([null]);
        j++;
    }
    Logger.log(dateRange);
    return dateRange;
}
*/
function dateRangeDrop() {

    let sums = ss.getSheetByName('Summation');

    let payload = buildDateArray();
    let dropZone = sums.getRange('C6:C27');
    dropZone.setValues(payload);

}

function summationTable() {

    let days = getDays();

    let tablePayload = [];
    let i = 0;
    while (i < days.length) {

        let sheet = ss.getSheetByName(days[i]);
        let gross = sheet.getRange('Z16').getValue();
        let net = sheet.getRange('Z17').getValue();
        let logistics = sheet.getRange('Z10').getValue();
        let packages = sheet.getRange('F7').getValue();
        let insurance = sheet.getRange('Z8').getValue();
        let gfsq = sheet.getRange('Z22').getValue();
        let gfsc = sheet.getRange('Z23').getValue();
        let cfsq = sheet.getRange('Z25').getValue();
        let cfsc = sheet.getRange('Z26').getValue();
        tablePayload.push([gross, net, logistics, packages, insurance, gfsq, gfsc,cfsq,cfsc])
        i++;

    }
    let j = 0 + tablePayload.length;
    while (j < 22) {
        tablePayload.push([null,null,null,null,null,null,null,null,null]);
        j++;
    }
    return tablePayload;
}

function summationDrop() {

    let dropZone = ss.getSheetByName('Summation').getRange('D6:L27');
    let summations = summationTable();
    dropZone.setValues(summations);

}