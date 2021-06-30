/* ====== | Main.js | =====
// This is meant for global elements.
// For cleanliness most other major functions will have their own 'file'
*/

// Global

DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o/edit");
let ui = SpreadsheetApp.getUi();


// Menu

function onOpen(e) {
    SpreadsheetApp.getUi()
        .createMenu('Maki Labs Operations')
        .addSeparator()
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Toggle Addition Fields')
            .addItem('New Components', 'toggleBulkAdditions')
            .addItem('Inventory Transactions', 'toggleBulkInventoryTransactions')
            .addItem('Import Pricing', 'toggleImportPrice'))
        .addSubMenu(SpreadsheetApp.getUi().createMenu('Commit Additions')
            .addItem('New Components', 'bulkAdditions')
            .addItem('Inventory Transactions', 'executeBulkInventoryTransactions')
            .addItem('Import Pricing', 'executeImportPricing')
            .addSeparator()
            .addItem('Execute IT/IP', 'executeItIp'))
        .addSeparator()
        .addItem('Autofill IT/IP from NC', 'copyDataOver')
        .addToUi();
  }

