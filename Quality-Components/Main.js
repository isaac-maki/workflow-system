// Global

DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.getActive();
const ui = SpreadsheetApp.getUi();

// Sheets

const ne = ss.getSheetByName('New');
const sp = ss.getSheetByName('Specifications');
const pl = ss.getSheetByName('PropertiesList');
const ma = ss.getSheetByName('Main');
const co = ss.getSheetByName('COA');
const qn = ss.getSheetByName('qualityNotes');
const ar = ss.getSheetByName('Archive');



// Menu

function onOpen(e) {
    SpreadsheetApp.getUi()
        .createMenu('Maki Operations')
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Reset')
        .addItem('Main / COA', 'clearEntryAll')
        .addItem('New', 'clearNewForm'))
        .addSeparator()
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Toggles')
        .addItem('Main / Extra Parameters', 'toggleMainExtraParameters'))
        .addSeparator()
        .addItem('Commit Lot Quick Add', 'utilityQuickAddLot')
        .addToUi();
}
