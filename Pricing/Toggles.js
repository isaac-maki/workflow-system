function toggleProductionBomAndHistory() {

    let hidden = pd.getRange('D27');

    if (hidden.getValue()) {

        ps.showColumns(6,9);
        hidden.setValue(false);


    } else {

        ps.hideColumns(6,9);
        hidden.setValue(true);

    }
}

function toggleProductionParameters() {

    let hidden = pd.getRange('D29');

    if (hidden.getValue()) {

        ps.showColumns(21,7);
        hidden.setValue(false);


    } else {

        ps.hideColumns(21,7);
        hidden.setValue(true);

    }
}
