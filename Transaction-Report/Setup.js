function yearUrl(){
    let sheet = ss.getSheetByName(".yearUrl");

    let range = sheet.getRange("A1");

    let prompt = ui.prompt("Copy and paste the Yearly Report Spreadsheet URL");
    let result = prompt.getResponseText();

    range.setValue(result);


}