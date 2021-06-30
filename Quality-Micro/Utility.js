function clearSelected() {

    sl.getRange('G6:G').setValue(false);

}


function flushSelection()  {

    let cell = sl.getRange('C5');
    let formula = 
        '=QUERY(IMPORTRANGE(\"https://docs.google.com/spreadsheets/d/1NWCUI00OaEmKnvnCaElQKQ3YxXbqYvp_cko9IZIVC3o\",\"Inventory!C5:F\"),\"select Col1,Col2,Col3,Col4\",1)';

    cell.clearContent();
    cell.setValue(formula);

}