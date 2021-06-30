function splitReceiving() {
    // declare sheets
    let data = ss.getSheetByName(".receiveData");

    // determine amount of line items receiving
    let count = data.getRange("D4").getValue();

    // create main component data array
    let inputData = data.getRange("C7:G" + (6 + count)).getValues();

    let splitArray = [];

    for (let i = 7; i < (7 + count); i++) {
        
        //counter for input data array; e.g., row 7 = 0 index on inputData array.
        let j = i -7;
        
        let cid = inputData[j][0];
        let name = inputData[j][1];
        let quantity = inputData[j][2];
        let uom = inputData[j][3];
        let info = inputData[j][4];
        let date = new Date();

        let splitCell = data.getRange("H" + i);
        
        if (splitCell.isBlank()) {
            
            let lot = CoffeeMaki.lotGenerator(cid,date);

            splitArray.push([cid, name, lot, info, quantity,uom]);

        } else {
 
            let increments = splitCell.getValue();
            let lotArray = CoffeeMaki.incrementedLotGenerator(cid,date,increments)
            let p = 0;
            while (p < increments) {
                
                let lot = lotArray[p];

                splitArray.push([cid, name, lot, info, null, uom,]);

                p++;

            }
        }

        
    }

    return splitArray;
}

function deliverSplitArray() {

    // declare sheet
    let re = ss.getSheetByName("Receive");

    let payload = splitReceiving();
    Logger.log(payload);
    let lineCount = payload.length;

    let dropZone = re.getRange('N8:S' + (7 + lineCount));

    dropZone.setValues(payload);

    

}