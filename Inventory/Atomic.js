/* ===== | Atomic.js | ======
// This is meant for functions that are atomic.
// That is they are stripped down to fundamentals and able to be
// used in other functions.
*/

const dynamicRange =
{
    a1: function dynamicRange(sheetName, headerRange,colName)
    {
        let sheet = ss.getSheetByName(sheetName); // The sheet the range exists on
        let range = sheet.getRange(headerRange); // The range the headers of the data.
        let finder = range.createTextFinder(colName).findNext(); // Finds the next instance of colName in the headerRange
        let cell = finder.getA1Notation(); // Gets the A1 cell notation
        return cell;
    },

    row: function dynamicRange(sheetName, headerRange,colName)
    {
        let sheet = ss.getSheetByName(sheetName); // The sheet the range exists on
        let range = sheet.getRange(headerRange); // The range the headers of the data.
        let finder = range.createTextFinder(colName).findNext(); // Finds the next instance of colName in the headerRange
        let row = finder.getRow(); // Gets the row
        return row;
    },
    col: function dynamicRange(sheetName, headerRange,colName)
    {
        let sheet = ss.getSheetByName(sheetName); // The sheet the range exists on
        let range = sheet.getRange(headerRange); // The range the headers of the data.
        let finder = range.createTextFinder(colName).findNext(); // Finds the next instance of colName in the headerRange
        let col = finder.getColumn(); // Gets the column as an integer
        return columnToLetter(col); // Converts the column index integer to letter
    },
    verticalData: function verticalDataRange(sheetName, labelColumn, dataColumnOffset, labelName)
    {
        let sheet = ss.getSheetByName(sheetName);
        let _labelColumn = labelColumn
        let labelRange = sheet.getRange(_labelColumn + "1:" + _labelColumn + "1000");
        let finder = labelColumn.createTextFinder(labelName).findNext();
        let dataColumn = _labelColumn + dataColumnOffset;
        return dataColumn;
    }
}


const coffee = {
    // This is used to determine the payload range. This is used a lot for copy/paste of data from one sheet to another.
    // rowsAmount should be set to a variable that counds the rows in your data. This can be accomplished with a array.length or variable that includes a count/countA cell from the spreadsheet. By default this is offset by -1. 
    payloadRange: function (sheetName,startCol, endCol, rowsAmount)
    {
        let sheet = ss.getSheetByName(sheetName);
        let lastRow = sheet.getLastRow();
        sheet.insertRowAfter(lastRow);
        let newLastRow = lastRow + 1;
        rows = rowsAmount - 1; // Offset because one is included in the new last row.
        endRow = newLastRow + rows;
        let payload = sheet.getRange(startCol + newLastRow + ":" + endCol + endRow);
        return payload;
    }
}



// Converts an column index integer to letter format.
// E.g., 1 = A
// From: http://stackoverflow.com/questions/21229180/convert-column-index-into-corresponding-column-letter
function columnToLetter(column) {
    var temp, letter = '';
    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  }


