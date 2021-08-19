const perfData = {
    names: ["Ana", "Juan", "Jorge", "Gertrudes"],
    dates: [],
    data: []
}

function getDays() {

    let dates = pe.getRange("C6:C27").getValues();
    let days = [];
    for (let i = 0; i < dates.length; i++) {
        let day = new Date(dates[i]);
        let formatted = day.toLocaleDateString("en-US", { day: "2-digit" });
        days.push(formatted);
    }
    perfData.dates = days;
}

function getData() {

    let rawArray = perfData.dates;
    let array = rawArray.filter(date => date !== "Invalid Date");
    let people = perfData.names;

    for (let i = 0; i < array.length; i++) {
        let sheet = ss.getSheetByName(array[i]);
        Logger.log(array[i]);
        let notes = sheet.getRange('P47:Q56').getValues();
        let dataRow = [];

        for (let j = 0; j < people.length; j++) {

            let person = people[j];
            switch (person) {
                case "Ana": {
                    let q = sheet.getRange("P8").getValue();
                    let t = sheet.getRange("P43").getValue();
                    let n = notes.filter(ele => ele[0] === "Ana");
                    dataRow.push(q);
                    dataRow.push(t);
                    let note = n.map(x => x[1]).join(";");
                    dataRow.push(note);
                    break;
                }
                case "Juan": {
                    let q = sheet.getRange("Q8").getValue();
                    let t = sheet.getRange("Q43").getValue();
                    let n = notes.filter(ele => ele[0] === "Juan");
                    dataRow.push(q);
                    dataRow.push(t);
                    let note = n.map(x => x[1]).join(";");
                    dataRow.push(note);
                    break;
                }
                case "Jorge": {
                    let q = sheet.getRange("R8").getValue();
                    let t = sheet.getRange("R43").getValue();
                    let n = notes.filter(ele => ele[0] === "Jorge");
                    dataRow.push(q);
                    dataRow.push(t);
                    let note = n.map(x => x[1]).join(";");
                    dataRow.push(note);
                    break;
                }
                case "Gertrudes": {
                    let q = sheet.getRange("S8").getValue();
                    let t = sheet.getRange("S43").getValue();
                    let n = notes.filter(ele => ele[0] === "Gertrudes");
                    dataRow.push(q);
                    dataRow.push(t);
                    let note = n.map(x => x[1]).join(";");
                    dataRow.push(note);;
                    break;
                }
                default:
                    break;
            }
        }
        Logger.log(dataRow);
        perfData.data.push(dataRow);
    }

}

function reportDataDelivery() {

    let data = perfData.data;
    let range = pe.getRange("D6:O" + (5 + data.length));
    range.setValues(data);

}

function executeReport() {
    getDays();
    getData();
    reportDataDelivery();


}