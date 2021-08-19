function sumQuantitative()
{
    // Declare Sheets
    let as = ss.getActiveSheet();

    // Declares columns to check
    let columns = ["P", "Q", "R", "S", "T", "U"];

    // Loop to go through each column
    for (let i = 0; i < columns.length; i++) {

        // variable declarations
        let name = as.getRange(columns[i] + "7");
        let blankName = true;
        let sum = as.getRange(columns[i] + "42").getValue();
        let dataRange = as.getRange(columns[i] + "8:" + columns[i] + "41");
        let sumPasteRange = as.getRange(columns[i] + "8");

        // Checks to see if there is data in the columm, if not it will be skipped
        if (name.isBlank()) {
            blankName = true;
        } else {
            blankName = false;
        }

        // Conditional to only do work if there is data in the range.
        if (blankName == false) {
            dataRange.clearContent();
            sumPasteRange.setValue(sum);
        } else {
            Logger.log(columns[i] + " column was blank and therefore skipped.");
        }
    }
}


