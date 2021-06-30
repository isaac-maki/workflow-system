// Global

DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.getActive();
let ui = SpreadsheetApp.getUi();


// sheets

const ds = ss.getSheetByName('data');
const fw = ss.getSheetByName('Fill Weights');


//const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/18odzUYyHVFfC9-LL3SNBsj9oSnzSwOT5pYAFFbtVIXo/edit");


/*
function onOpen(e) {
    SpreadsheetApp.getUi()
        .createMenu('Maki Labs Operations')
        .addItem('Reset BPR Sheets', 'clearSheets')
        .addSeparator()
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Toggle Terminate Elements')
            .addItem('BOM Requirements', 'mySecondFunction')
            .addItem('Notes', 'myThirdFunction'))
        .addToUi();
  }
 */



  