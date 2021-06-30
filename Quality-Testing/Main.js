// Global

DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.getActive();
const ui = SpreadsheetApp.getUi();

// Sheets

const ma = ss.getSheetByName('Main');
const re = ss.getSheetByName('Results');
const sp = ss.getSheetByName('Specifications');



// global objects

const qc = {
    lot: 'lot',
    cid: 'cid',
    currentRow: 0
};

// Menu

function onOpen(e) {
    SpreadsheetApp.getUi()
        .createMenu('Maki Operations')
        .addItem('Test', '')
        .addSeparator()
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Test Menu')
            .addItem('One Submenu Item', 'mySecondFunction')
            .addItem('Another Submenu Item', 'myThirdFunction'))
        .addToUi();
  }
 


  
