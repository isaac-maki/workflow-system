// Global

DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.getActive();
const ui = SpreadsheetApp.getUi();

// Sheets

const ne = ss.getSheetByName('New');
const sp = ss.getSheetByName('Specifications');
const pl = ss.getSheetByName('PropertiesList');



// Menu

function onOpen(e) {
    SpreadsheetApp.getUi()
        .createMenu('Maki Operations')
        .addItem('One', '')
        .addSeparator()
        .addItem('Two', '')
        .addToUi();
  }
 


  
