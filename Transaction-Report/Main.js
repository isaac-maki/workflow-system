// Global

DocumentApp.getActiveDocument();
//const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1usFYNcXz54NseMHTbQkgr8dgmB21uuqxvFocwOg1aKI/edit");
const ss = SpreadsheetApp.getActive();
let ui = SpreadsheetApp.getUi();


// Menu

const pe = ss.getSheetByName("Performance");



function onOpen(e) {
    SpreadsheetApp.getUi()
        .createMenu('Ghosty Menu')
        .addItem('Animal of the Day', 'joke')
        .addSeparator()
        .addItem('Add Year URL', 'yearUrl')
        .addSeparator()
        .addItem('Add Dates to Summation', 'dateRangeDrop')
        .addItem('Conduct Summations', 'summationDrop')
        .addToUi();
  }
  


  function joke(){
      ui.alert("There is no animal of the day for a spreadsheet dumby. \;\)");
  }
