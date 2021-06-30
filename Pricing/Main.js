// Global

DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.getActive();
const ui = SpreadsheetApp.getUi();

// Sheets

const wpss = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/18odzUYyHVFfC9-LL3SNBsj9oSnzSwOT5pYAFFbtVIXo/edit'); // this is Workflow-Production
const fd = wpss.getSheetByName('formularyDatabase');
const pd = ss.getSheetByName('productionData');
const ps = ss.getSheetByName('Production');
const st = ss.getSheetByName('Settings');
const da = ss.getSheetByName('Data');




// Menu

function onOpen(e) {
    SpreadsheetApp.getUi()
        .createMenu('Maki Operations')
        .addItem('blank', 'blank')
        .addSeparator()
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Test Menu')
            .addItem('One Submenu Item', 'mySecondFunction')
            .addItem('Another Submenu Item', 'myThirdFunction'))
        .addToUi();
  }
 


  