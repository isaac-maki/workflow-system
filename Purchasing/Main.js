// Global

DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.getActive();
let ui = SpreadsheetApp.getUi();

const cd = ss.getSheetByName('confirmationData');
const co = ss.getSheetByName('Confirm');
const ca = ss.getSheetByName('PO Components Archive');
const po = ss.getSheetByName('PO');

function onOpen(e) {
    SpreadsheetApp.getUi()
        .createMenu('Maki Labs Operations')
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Reset Forms')
            .addItem('One Submenu Item', 'mySecondFunction')
            .addItem('Confirm Form', 'clearConfirmForm'))
        .addToUi();
  }
 


  