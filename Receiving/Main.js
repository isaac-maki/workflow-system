// Global

DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1DLaHP1xv74e1rHaQ88xObDjOeg8wxZeetTc2LvJSXg8/edit");
let ui = SpreadsheetApp.getUi();


function onOpen(e) {
    SpreadsheetApp.getUi()
        .createMenu('Maki Labs Operations')
        .addItem('Reset Receive', 'executeManualClearOfReceive')
        .addItem('Manual Flush', 'manualFlush')
        .addSeparator()
        .addItem('Animal of the day', 'animalOfDay' )
        .addToUi();
  }
  

  function animalOfDay() {

    ui.alert('There is no animal of the day....');    

  }


  function manualFlush() {
    SpreadsheetApp.flush();

  }