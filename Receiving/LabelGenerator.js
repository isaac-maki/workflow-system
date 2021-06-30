function receptionData() {

    // define sheet
    let data = ss.getSheetByName(".receiveData");

    // get po number and enter into array
    let poNumber = data.getRange("G2").getValue();

    // get amount of elements
    let count = data.getRange('L5').getValue();

    // create array from data
    let dataArray = data.getRange('L7:R' + (count + 6)).getValues();

    // append elements

    let i = 0;
    while (i < dataArray.length) {

        dataArray[i].push(poNumber);
        i++;
    }

    return dataArray;

}


function generateLabelDocument() {

    // build array
    let labelData = receptionData();
    let dataCount = labelData.length;
   

    // document name
    let poNumber = labelData[0][7];
    let name = 'PO# ' + poNumber + ' Labels';

    // doucmnet generation
    let folderId = '1EAB3eJlICkhlgR3T0FAFz9SkF4fe7jGK';
    let id = CoffeeMaki.documentGenerator(folderId, name);
    let document = DocumentApp.openById(id);
    let body = document.getBody();

    // generic variables
    let timestamp = new Date();


    // loop for each lab sample that is in the request
    let i = 0;
    while(i < dataCount) {

        let copies = labelData[i][6];
        let lot = labelData[i][2];
        let name = labelData[i][1];
        let qrCodeUrl = "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=" + lot;
        let qrBlob = UrlFetchApp.fetch(qrCodeUrl).getBlob();

        // this is here because the first page always has some fucking line that is added and it ruins the spacing. will figure out later
        if (i === 0) {
            body.appendPageBreak();
        }

        // loop to generate additional pages labels with duplicates
        if (copies > 0) {

            let j = 0;
            while(j < copies) {

                let lotSection = body.appendParagraph(lot);
                lotSection.setHeading(DocumentApp.ParagraphHeading.HEADING2).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
                let  nameSection = body.appendParagraph(name);
                nameSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

                let qrSection = body.appendParagraph("");
                qrSection.appendInlineImage(qrBlob);
                qrSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

                
                let timeSection = body.appendParagraph(timestamp.toString()).setFontSize(6);
                timeSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER)

                body.appendPageBreak();
                j++;
            }

        } else {

            let lotSection = body.appendParagraph(lot);
            lotSection.setHeading(DocumentApp.ParagraphHeading.HEADING2).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
            let  nameSection = body.appendParagraph(name);
            nameSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

            let qrSection = body.appendParagraph("");
            qrSection.appendInlineImage(qrBlob);
            qrSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

            let timeSection = body.appendParagraph(timestamp.toString()).setFontSize(6);
            timeSection.setAlignment(DocumentApp.HorizontalAlignment.CENTER)

            body.appendPageBreak();
         
        }
        i++;
    }

    // document creation functions from library to change page size, margins, and convert to pdf.
    CoffeeMaki.documentPageSize(document,'standardLabel',false);
    CoffeeMaki.documentMargins(document,14.4);

    // Save and close the document before pdf generation
    document.saveAndClose();

    // pdf generation and open url
    let pdf = CoffeeMaki.documentPdfConverter(document, folderId);
    CoffeeMaki.openTabs([pdf]);

    // set to printed
    printedBoolean();


}

function printedBoolean() {

    ss.getSheetByName('.receiveData').getRange('R3').setValue(true);

}