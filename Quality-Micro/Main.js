// Global

DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.getActive();
const ui = SpreadsheetApp.getUi();

// Sheets

const sd = ss.getSheetByName('selectionData'); 
const du = ss.getSheetByName('dataUtility'); 
const mf = ss.getSheetByName('MQL Form');
const sl = ss.getSheetByName('Selection');
const re = ss.getSheetByName('Results');
const mi = ss.getSheetByName('Micro');

const md = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1ewZrhTsb6nvmabnYIGDFEPozOn_EKoDrX6GoR17mxRM/edit').getSheetByName('microData');

// Menu

function onOpen(e) {
    SpreadsheetApp.getUi()
        .createMenu('Maki Operations')
        .addItem('Generate MQL Form', 'generateMqlFormFromChunks')
        .addSeparator()
        .addItem('Flush System', 'flushSelection')
        .addToUi();
  }
 


  
