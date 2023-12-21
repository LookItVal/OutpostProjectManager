/////////////////////////////////////////////
//               Constants                 //
/////////////////////////////////////////////

// Folder Ids
const reconciliationFolderId = "1NNilomBvR1yumr9e89IE2qysCKLCs55O";
const clientFolderId = "1Y5CTtT86ORvnZXg-yuY6el5tWx1AbBfp";
// Spreadsheet Ids
const projectDataSheetId = '1a7d08zpaNTUMUAa9nH10UHHIkGoBJfhVd-hRrnLM7ls';
// TemplateIds
const reconciliationSheetTemplateId = '1pagP4j59__jDa2iB2YokYVG56RYChVOG2jUXuCVPG1c';
const proposalTemplateId = '1bTp3KyCw8MmU7WJoAVyhA_x_MPbYWTwqhXzkBM7vq20';
const costingSheetTemplateId = '1UJ5P8V92bFpJEcccCiIwAULAN5Cv_zb7YWjY38i7A9A';
// OPD Sheed Ids
const proposalsSheetId = 202907659;
//Regex queries
const regexJobName = /^\d{4}\s\d{4}\s.*/;
const regexProposalName = /^PROPOSAL: \d{4}\s.*/;
const regex4Digits = /^\d{4}/;
const regexProposalOpen = /^PROPOSAL:/;

/////////////////////////////////////////////
//           Built-In Functions            //
/////////////////////////////////////////////

// Triggered when the add-on is installed, calls onOpen(e)
function onInstall(e) {
  onOpen(e);
}

// Triggered when the document is opened
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  console.log(e);
  // Checks if the active spreadsheet matches the specific project data sheet ID
  if (SpreadsheetApp.getActiveSpreadsheet().getId() === projectDataSheetId) {
  // Creates a menu for the add-on in the UI
  ui.createMenu("Outpost Project Manager")
      .addItem('Show Sidebar', 'openOPDSidebar')
      .addToUi();
  }
}

/////////////////////////////////////////////
//              Custom Logic               //
/////////////////////////////////////////////

//Function to distribute the propper sidebar depending on the current sheet
function openSheetSidebar() {
  var currentSheet = SpreadsheetApp.getActiveSpreadsheet().getId();
  if (currentSheet === projectDataSheetId) {
    return openOPDSidebar();
  }
  else {
    return getSheetsHomepage();
  }
}

// Function to extract the name array from the spreadsheet and convert it into a title
function getProjectTitle() {
  var currentSheet = SpreadsheetApp.getActiveSheet();
  var currentRow = currentSheet.getActiveCell().getRow();
  const currentSheetId = currentSheet.getSheetId();
  // If the project is a proposal
  if (currentSheetId === proposalsSheetId) {
    if (currentRow === 1) {
      return 'Proposal Not Found';
    }
    var nameArray = [];
    nameArray.push(currentSheet.getRange(`A${currentRow}`).getDisplayValue());
    nameArray.push(currentSheet.getRange(`B${currentRow}`).getDisplayValue());
    nameArray.push(currentSheet.getRange(`C${currentRow}`).getDisplayValue());
    // If one item in the array is empty, return a blank title.
    for (const item of nameArray) {
      if (item === "") {
        return 'Proposal Not Found';
      }
    }
    return `PROPOSAL: ${nameArray[0]} ${nameArray[1]} ${nameArray[2]}`;
  }
  // If the project is a project
  if (currentRow === 1) {
    return 'Project Not Found';
  }
  var nameArray = [];
  nameArray.push(currentSheet.getRange(`A${currentRow}`).getDisplayValue());
  nameArray.push(currentSheet.getRange(`B${currentRow}`).getDisplayValue());
  nameArray.push(currentSheet.getRange(`C${currentRow}`).getDisplayValue());
  nameArray.push(currentSheet.getRange(`D${currentRow}`).getDisplayValue());
  // If one item in the array is empty, return a blank title.
  for (const item of nameArray) {
    if (item === "") {
      return 'Project Not Found';
    }
  }
  return `${nameArray[0]} ${nameArray[1]} ${nameArray[2]} ${nameArray[3]}`;
}

//function to get the name array from the spreadsheet
function getProjectNameArray() {
  const currentSheet = SpreadsheetApp.getActiveSheet();
  const currentRow = currentSheet.getActiveCell().getRow();
  const currentSheetId = currentSheet.getSheetId();
  let nameArray = [];
  // If the project is a proposal  
  if (currentSheetId === proposalsSheetId) {
    nameArray.push("PROPOSAL:");
    nameArray.push(currentSheet.getRange(`A${currentRow}`).getDisplayValue());
    nameArray.push(currentSheet.getRange(`B${currentRow}`).getDisplayValue());
    nameArray.push(currentSheet.getRange(`C${currentRow}`).getDisplayValue());
    return nameArray;
  }
  // If the project is a project
  nameArray.push(currentSheet.getRange(`A${currentRow}`).getDisplayValue());
  nameArray.push(currentSheet.getRange(`B${currentRow}`).getDisplayValue());
  nameArray.push(currentSheet.getRange(`C${currentRow}`).getDisplayValue());
  nameArray.push(currentSheet.getRange(`D${currentRow}`).getDisplayValue());
  return nameArray;
}

// Gets the sheets for the OPD spreadsheet and removes un numbered sheets, and makes sure they are ordered.
// It doesnt actually do anything to make sure they are ordered tho it just expects them to already be ordered.
// Fix it if you want i dont wanna get into it, but dont fucking slow down this app okay? its slow enough.
function getOrderedSheets(spreadsheet) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  const badSheets = ['OLD MASTER SHEET', 'Proposals']
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    if (badSheets.includes(sheet.getName())) {
      sheets.splice(i, 1); // Remove the sheet at index i
      i--; // Decrement the index since the array is modified
    }
  }
  return sheets;
}

// Gets the id of the active reconciliation sheet based on the name of the project. returns null if none found
// Should this return just the actual object instead? Maybe refactor this.
function findSheet(name) {
    const folder = DriveApp.getFolderById(reconciliationFolderId);
    const files = folder.getFiles();
    // A file iterator is not an array.
    while (files.hasNext()) {
      const file = files.next();
      const modifiedName = replaceWhitespace(file.getName());
      name = replaceWhitespace(name);
      if (modifiedName === name) {
        return file.getId();
      }
    }
    return null;
  }

//  Returns an array of OPM.Client objects
function getClients() {
  const rootFolder = DriveApp.getFolderById(clientFolderId);
  const clientFolders = rootFolder.getFolders();
  var clients = [];
  // A Folder iterator is not an array.
  while (clientFolders.hasNext()) {
    const client = clientFolders.next();
    clients.push(new Client({folder: client}));
  }
  return clients;
}

// function to determine from the name of the initiative if it is a proposal or a project
function initiativeType(name) {
  if (regexProposalName.test(name)) return "PROPOSAL";
  if (regexJobName.test(name)) return "PROJECT";
}

// function to get the last row with content in the A column. only checks for content in the A column. can not use the native getLastRow() function because it will return the last row with any content in it.
function setActiveCellToLastRow(spreadsheet) {
  const sheet = spreadsheet.getActiveSheet();
  const columnA = sheet.getRange('A:A').getValues();

  let lastRowWithContent = 0;
  for (let i = 0; i < columnA.length; i++) {
    if (columnA[i][0] === "") {
      lastRowWithContent = i;
      break;
    }
  }
  sheet.setActiveRange(sheet.getRange(`A${lastRowWithContent}`));
}

/////////////////////////////////////////////
//           Utility Functions             //
/////////////////////////////////////////////

/// mother of fuck check this before running it.
function cleanClientFiles() {
  var clients = getClients();
  for (const client of clients) {
    var archiveFolder = null
    if (!client.folder.getFoldersByName("DEC 2023 ARCHIVE").hasNext()) {
      archiveFolder = client.folder.createFolder("DEC 2023 ARCHIVE");
    } else {
      archiveFolder = client.folder.getFoldersByName("DEC 2023 ARCHIVE").next();
    }
    var folders = client.folder.getFolders();
    while (folders.hasNext()) {
      const folder = folders.next();
      if (folder.getName() == "DEC 2023 ARCHIVE") {
        continue;
      }
      folder.moveTo(archiveFolder);
    }
    var files = client.folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      file.moveTo(archiveFolder);
    }
  }
}

/////////////////////////////////////////////
//            Button Functions             //
/////////////////////////////////////////////

// Function to change the active sheet to the proposal sheet.
function jumpToProposal() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Proposals'));
  // set the active cell to the last row with anything in it.
  const lastRow = spreadsheet.getActiveSheet().getLastRow();
  spreadsheet.getActiveSheet().getRange(`A${lastRow}`).activate();
}

// Function to change the active sheet to the sheet with the last recorded Job.
function jumpToJob() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let lastSheet = null; 
  for (const sheet of getOrderedSheets()) {
    if (sheet.getRange('A51').isBlank()) {
      lastSheet = sheet;
      continue;
    }
    break;
  }
  spreadsheet.setActiveSheet(lastSheet);
  setActiveCellToLastRow(spreadsheet);
}


// Sends the simplified project to the frontend
function getProject() {
  // This should work by retreving the name array not the full title.
  let nameArray = getProjectNameArray();
  try {
    return getInitiative({nameArray}).solidify();
  } catch (e) {
    if (e instanceof ValidationError) {
      return {"title": e.message.split(":")[0]};
    }
    console.error(e);
    return {"title": "A fatal error has occured."};
  }
}

function requestProposalGeneration() {
  const proposal = getProject();
  if (proposal.type !== "PROPOSAL") {
    throw new ValidationError("generateProposal function found a project not a proposal");
  }
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    "Generate Proposal?",
    `Are you sure you want to generate a proposal in the ${proposal.clientName} folder called ${proposal.title}?`,
    ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    return true;
  } else {
    return false;
  }
}

function generateProposal() {
  getProject().generateProposal();
}


/////////////////////////////////////////////
//               UI Elements               //
/////////////////////////////////////////////

// Function to display the default homepage UI for the calendar add-on
function calendarHomepageUI() {
  return CardService.newCardBuilder()
    .setName("Card name")
    .setHeader(CardService.newCardHeader().setTitle("Outpost Project Manager"))
    .addSection(CardService.newCardSection()
      .setHeader("No Event Selected.")
      .addWidget(CardService.newTextParagraph()
        .setText("Select an event to find its reconciliation sheet.")))
    .build();
}

// Function to display UI for selecting an event and showing its details
function selectEventUI(event) {
  try {
    event = new Booking(event);
    return CardService.newCardBuilder()
      .setName("Select Event")
      .setHeader(CardService.newCardHeader().setTitle("Project Details"))
      .addSection(CardService.newCardSection()
        .setHeader(event.event.getSummary())
        .addWidget(CardService.newTextButton()
          .setText("Open Reconciliation")
          .setOpenLink(CardService.newOpenLink()
              .setUrl(`https://docs.google.com/spreadsheets/d/${event.sheetId}/edit#gid=0`))))
      .build();
  } catch {
    return calendarHomepageUI();
  }
}

// Function to make a generic sidebar that says nothing for the sheets ui
function getSheetsHomepage() {
  return CardService.newCardBuilder()
    .setName("Card name")
    .setHeader(CardService.newCardHeader().setTitle("Outpost Project Manager"))
    .addSection(CardService.newCardSection()
      .setHeader("Incompatable Sheet")
      .addWidget(CardService.newTextParagraph()
        .setText("This sheet does not have any special functionality associated with it.")))
    .build();
}


// Function to open the custom sidebar UI
function openOPDSidebar() {
  var ui = HtmlService.createTemplateFromFile('OPDSidebar')
      .evaluate()
      .setTitle('Outpost Project Manager')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(ui);
}
