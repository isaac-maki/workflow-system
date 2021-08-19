function emailNotes() {
    // Declare sheets
    let sheet = ss.getActiveSheet();

    // Notes declaration
    let noteCount = sheet.getRange("F44").getValue();
    let reportDate = sheet.getRange("A1").getValue();
    let dateFormatted = Utilities.formatDate(reportDate, "America/Los_Angeles","DD MMMM YYYY");

    let noteRange = sheet.getRange("C46:C" + (46 +(noteCount - 1)));
    let notes = noteRange.getValues();

    // Email parameters

    let emailTo = Session.getActiveUser().getEmail();
    let subject = dateFormatted + " Transaction Report Notes";
    let ghostyUrl = "https://i.imgur.com/lVKltnj.png";
    let ghostyBlob = UrlFetchApp
                        .fetch(ghostyUrl)
                        .getBlob()
                        .setName("ghosty");

    let notesBody = [];
    let nbIndex = 0;
    while (nbIndex < notes.length) {
        notesBody.push("<li>" + notes[nbIndex] + "</li>");
        nbIndex++;
    }

    Logger.log(notesBody);
    Logger.log(notesBody.toString().replace("," , ""))

    let body = "<p> Hello! </p>" +
                "<ul>" +
                notesBody.toString().replace("," , "")+         
                "</ul>";

    MailApp.sendEmail(
        {
            to: emailTo,
            subject: subject,
            htmlBody: body,
            inlineImages:
                {
                    ghostyImage: ghostyBlob
                } 
        }
    );
}