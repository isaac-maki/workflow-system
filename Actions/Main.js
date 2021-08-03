// === GLOBAL === //

// Document 
DocumentApp.getActiveDocument();
const ss = SpreadsheetApp.getActive();
let ui = SpreadsheetApp.getUi();

// Sheets

const re = ss.getSheetByName("Responsibilities");
const da = ss.getSheetByName('data');
const ac = ss.getSheetByName('Actionable');

// Global Object
const module = {
    responsibilities: [],
    actionables: [],
    today: new Date(),
    newActionables: []
};


// === FUNCTIONS === //

function init() {
    // saving data functions
    getResponsibilities();
    getActionables();
    runsies();
}

function getResponsibilities() {
    let rows = da.getRange('B1').getValue();
    let data = re.getRange('A2:D' + (1 + rows)).getValues();
    Logger.log(data);
    module.responsibilities = data;
}


function getActionables() {
    let rows = da.getRange('B3').getValue();
    let data = ac.getRange('A2:G' + (1 + rows)).getValues();
    module.actionables = data;
}

function runsies() {
    let array = module.responsibilities;
    let i = 0;
    while (i < array.length) {
        let id = array[i][0];
        let staffId = array[i][1];
        let actionId = array[i][2];
        let frequency = array[i][3];
        let latest = findLastActionable(id);
        let scheduled = boolAlreadyScheduled(latest);
        if (!scheduled) {
            scheduler(id, frequency, staffId, actionId)
        }

        i++;
    }
    dropNewActionables();
}

function scheduler(id, frequency, staffId, actionId) {
    let nextDate = findNextActionableDate(frequency);
    let appKey = createAppKey(id);
    let blankForFormulas = null;
    let actionable = [id, actionId, blankForFormulas, staffId, blankForFormulas, nextDate, blankForFormulas, appKey];
    module.newActionables.push(actionable);
}

function createAppKey(id) {

    let s1 = CoffeeMaki.characterFromCode(CoffeeMaki.randomBetween(65,90));
    let s2 = CoffeeMaki.characterFromCode(CoffeeMaki.randomBetween(65,90));
    let s3 = CoffeeMaki.randomBetween(1000000, 9999999);
    let appkey = id+'_'+s1+s2+s3;
    return appkey;
}

function dropNewActionables() {
    
    if (module.newActionables.length === 0) {
        Logger.log('No new actionables yo');
    } else {
        let payload = module.newActionables;
        let rows = da.getRange('B3');
        let range = CoffeeMaki.dropZoneRangeAltExtUtil(ac, 'A', 'H', 2, rows, module.newActionables.length);
        range.setValues(payload)
    }
}

function findLastActionable(id) {
    // Set equal to a variable for ease
    let array = module.actionables;

    // Map instances of responsibility (i.e., get matching actionables)
    let matchingActionables = array.filter(function(row) {
        return row[0] === id;
    })
    
    // map dates of matching actionables 
    let dates = matchingActionables.map(x => x[5]);

    // find latest
    let latest = new Date(Math.max.apply(null, dates));

    return latest

}

function boolAlreadyScheduled(date) {
    
    let scheduled;
    if (date > module.today) {
        scheduled = true;
    } else {
        scheduled = false;
    }
    return scheduled;
}


function findNextActionableDate(frequency) {
    
    let nextDate = new Date()

    switch (frequency) {
        case 'Daily': {
            
            nextDate.setDate(nextDate.getDate() + 1);

            break;
        }
        case 'Mondays': {
            nextDate = getNextDayOfWeek(nextDate, 1);
            break;
        }
        default:
            Logger.log(frequency + ' NOT FOUND');
            break;
    }

    let weekday = nextDate.getDay();
    
    switch (weekday) {
        case 0:
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 5:
            nextDate.setDate(nextDate.getDate() + 3);
            break;
        case 6:
            nextDate.setDate(nextDate.getDate() + 2);
            break;
        default:
            break;
    }

    return nextDate;

}


function getNextDayOfWeek(date, dayOfWeek) {
    let  resultDate = new Date(date.getTime());

    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);

    return resultDate;
}