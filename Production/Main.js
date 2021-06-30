// Global

DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.getActive();
let ui = SpreadsheetApp.getUi();


// sheets

const td = ss.getSheetByName('.terminateData');
const ts = ss.getSheetByName('Termination');
const cb = ss.getSheetByName('Create BPR');
const bu = ss.getSheetByName('.bprUtilities');
const bs = ss.getSheetByName('BPR');
const ab = ss.getSheetByName('BPR-Archive');
const ac = ss.getSheetByName('BPR-Components-Archive');
const di = ss.getSheetByName('Disperse');

const iv = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o/edit').getSheetByName('Inventory');
const tr = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o/edit').getSheetByName('Transactions');
const ii = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o/edit').getSheetByName('inventoryInfo');
const wi = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1SgphgWw3d72VRiuLYvCVP6wz4Ww66mvbdtj6b3irrEo/edit').getSheetByName('Work Instructions');
const fw = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/15JdQoLLt2ExlglrIwJxVXxbbCa_qdXV-K1IdfJ31gY8/edit').getSheetByName('Fill Weights');

//const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/18odzUYyHVFfC9-LL3SNBsj9oSnzSwOT5pYAFFbtVIXo/edit");



function onOpen(e) {
SpreadsheetApp.getUi()
    .createMenu('Maki Labs Operations')
    .addSubMenu(ui.createMenu('Reset Forms')
        .addItem('Create BPR', 'clearSheets')
        .addItem('Termination', 'clearTerminate'))
    .addItem('Flush System', 'flushSystem')
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu('Toggle Terminate Elements')
        .addItem('BOM Requirements', 'toggleTerminationBomRequirements')
        .addItem('Notes', 'toggleTerminationNotes')
        .addItem('Logs', 'toggleTerminationLogs'))
    .addSubMenu(SpreadsheetApp.getUi().createMenu('Toggle Create BPR Elements')
        .addItem('Available Materials', 'toggleAvailableMaterials')
        .addItem('Enable Bypass Mode', 'enableByPassMode'))
    .addToUi()
}
 

function flushSystem() {
    flushComponents();

}

function flushComponents()  {

    let sheet = ss.getSheetByName('Components');
    let cell = sheet.getRange('C5');
    let formula = 
        '=IMPORTRANGE(\"https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o\",\"Components!C5:K\")';

    cell.clearContent();
    cell.setValue(formula);

}