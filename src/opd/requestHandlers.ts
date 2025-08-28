import { Project, Proposal } from '../classes/initiatives';
import { Booking } from '../classes/booking';
import { User } from '../classes/user';
import { SerializedData, ProposalNameArray, ProjectNameArray } from '../interfaces';
import { ValidationError } from '../classes/errors';
import { properties, spreadsheet, version } from '../constants';
import { openChangelogAsModalDialogue } from '../changelog/handlers';

declare const exports: {
  Project: typeof Project;
  Proposal: typeof Proposal;
  User: typeof User;
  Booking: typeof Booking;
  ValidationError: typeof ValidationError;
  properties: typeof properties;
  spreadsheet: typeof spreadsheet;
  version: typeof version;
  openChangelogAsModalDialogue: typeof openChangelogAsModalDialogue;
};

export function jumpToProposal(): void {
  const spreadsheet = exports.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
  const sheet = exports.Proposal.proposalSheet;
  if (!spreadsheet) {
    throw new ReferenceError('Spreadsheet is not defined');
  }
  if (!sheet) {
    throw new ReferenceError('Sheet is not defined');
  }
  spreadsheet.setActiveSheet(sheet as GoogleAppsScript.Spreadsheet.Sheet);
  const lastRow = sheet.getLastRow();
  sheet.getRange(`A${lastRow}`).activate();
}

export function jumpToProject(): void {
  const spreadsheet = exports.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
  const sheet = exports.Project.recentSheet;
  spreadsheet.setActiveSheet(sheet);
  sheet.setActiveRange(sheet.getRange(`A${exports.Project.recentRow}`));
}


export function getInitiative(): SerializedData {
  const spreadsheet = exports.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
  if (!spreadsheet) {
    throw new ReferenceError('Spreadsheet is not defined');
  }
  const sheet = spreadsheet.getActiveSheet();
  if (/^\d{4}-\d{4}$/.test(sheet.getName())) { // Check if the open sheet is a project sheet
    const selection = sheet.getActiveRange();
    if (!selection) {
      throw new ReferenceError('No selection found');
    }
    if (selection.getValues().length > 1) {
      return {'title': 'Multiple rows selected. Please select a single row.'} as SerializedData;
    }
    if (selection.getRow() === 1) {
      return {'title': 'Project Not Found.'} as SerializedData;
    }
    const rowValues = sheet.getRange(selection.getRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
    if ((rowValues[0].toString().trim() === '') || (rowValues[1].toString().trim() === '') || (rowValues[2].toString().trim() === '') || (rowValues[3].toString().trim() === '')) {
      return {'title': 'Selected row is empty. Please select a valid project.'} as SerializedData;
    }
    const project = exports.Project.getProject({ nameArray: [rowValues[0].toString().trim(), rowValues[1].toString().trim(), rowValues[2].toString().trim(), rowValues[3].toString().trim(), rowValues[10] ? 'TRUE' : 'FALSE'] });
    if (!project) {
      return {'title': 'Project Not Found.'} as SerializedData;
    }

    //if (project.folder) {  this is just another search.
    //  return project.serialize();
    //}
    
    // This slows things down every time there is a new project.
    // TODO: make a new button that does the rename.
    //const originalProject = exports.Project.getProject({ jobYrMo: `${project.yrmo} ${project.jobNumber} ${project.clientName}` });
    //if (originalProject) {
    //  const lucky_charms = originalProject.serialize();
    //  lucky_charms.newProject = project.serialize();
    //  return lucky_charms;
    //}

    return project.serialize();
  }
  if (sheet.getName() === 'Proposals') {
    const selection = sheet.getActiveRange();
    if (!selection) {
      throw new ReferenceError('No selection found');
    }
    if (selection.getValues().length > 1) {
      return {'title': 'Multiple rows selected. Please select a single row.'} as SerializedData;
    }
    if (selection.getRow() === 1) {
      return {'title': 'Proposal Not Found.'} as SerializedData;
    }
    const rowValues = sheet.getRange(selection.getRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
    if ((rowValues[0].toString().trim() === '') || (rowValues[1].toString().trim() === '') || (rowValues[2].toString().trim() === '')) {
      return {'title': 'Selected row is empty. Please select a valid proposal.'} as SerializedData;
    }
    const proposal = exports.Proposal.getProposal({ nameArray: ['PROPOSAL:', rowValues[0].toString().trim(), rowValues[1].toString().trim(), rowValues[2].toString().trim()] });
    if (!proposal) {
      return {'title': 'Proposal Not Found.'} as SerializedData;
    }
    return proposal.serialize();
  }
  return {};
}

export function requestProposalGeneration(): boolean {
  const proposal = Proposal.getProposal();
  if (proposal.type !== 'PROPOSAL') {
    throw new ValidationError('Proposal type is not set to proposal.');
  }
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Generate Proposal?',
    `Are you sure you want to generate a proposal in the ${proposal.clientName}? folder called ${proposal.title}?`,
    ui.ButtonSet.YES_NO);
  if (response === ui.Button.YES) {
    return true;
  }
  return false;
}

export function generateProposal(nameArray: ProposalNameArray): void {
  Proposal.getProposal({nameArray}).generateProposal();
}

export function requestQuoteGeneration(): boolean {
  const proposal = Proposal.getProposal();
  if (proposal.type !== 'PROPOSAL') {
    throw new ValidationError('Proposal type is not set to proposal.');
  }
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Generate Quote?',
    `Are you sure you want to generate a quote in the ${proposal.clientName}? folder called ${proposal.title}?`,
    ui.ButtonSet.YES_NO);
  if (response === ui.Button.YES) {
    return true;
  }
  return false;
}

export function generateQuote(nameArray: ProposalNameArray): void {
  Proposal.getProposal({nameArray}).generateQuote();
}

export function requestProposalAccept(): boolean {
  const proposal = Proposal.getProposal();
  if (proposal.type !== 'PROPOSAL') {
    throw new ValidationError('Proposal type is not set to proposal.');
  }
  if (proposal.status !== 'ACTIVE') {
    throw new ValidationError('Proposal status is not set to active.');
  }
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Accept Proposal?',
    `Are you sure you want to accept the proposal ${proposal.title} into a full project?`,
    ui.ButtonSet.YES_NO);
  if (response === ui.Button.YES) {
    return true;
  }
  return false;
}

export function acceptProposal(nameArray: ProposalNameArray): void {
  Proposal.getProposal({nameArray}).acceptProposal();
  jumpToProject();
}

export function requestCostingGeneration(): boolean {
  const project = Project.getProject();
  if (project!.type !== 'PROJECT') {
    throw new ValidationError('Project type is not set to project.');
  }
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Generate Costing?',
    `Are you sure you want to generate a costing sheet in the ${project!.clientName} folder?`,
    ui.ButtonSet.YES_NO);
  if (response === ui.Button.YES) {
    return true;
  }
  return false;
}

export function generateCosting(nameArray: ProjectNameArray): void {
  Project.getProject({nameArray})!.createCostingSheet();
}

export function requestJobGeneration(): boolean {
  const project = Project.getProject();
  if (project!.type !== 'PROJECT') {
    throw new ValidationError('Project type is not set to project.');
  }
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Generate Job?',
    `Are you sure you want to generate a job in the ${project!.clientName}? folder called ${project!.title}?`,
    ui.ButtonSet.YES_NO);
  if (response === ui.Button.YES) {
    return true;
  }
  return false;
}

export function generateJob(nameArray: ProposalNameArray): void {
  Project.getProject({nameArray})!.generateProject();
}

function showUnreconciledBookingsModal(bookings: Booking[]): GoogleAppsScript.HTML.HtmlOutput {
  const output = HtmlService.createTemplateFromFile('src/opd/html/unreconciledBookings');
  output.bookings = bookings;
  output.bookings = bookings.map(b => b.serialize());
  return output.evaluate();
}

export function deleteBooking({calendarId, bookingId}: {calendarId: string, bookingId: string}): void {
  calendarId = calendarId + '@group.calendar.google.com';
  bookingId = bookingId + '@google.com';
  CalendarApp.getCalendarById(calendarId)?.getEventById(bookingId)?.deleteEvent();
}
  
export function checkReconciliationSheet(nameArray: ProjectNameArray): void {
  const project = Project.getProject({nameArray});
  if (project!.type !== 'PROJECT') {
    throw new ValidationError('Project type is not set to project.');
  }
  if (!project!.reconciliationSheetId) {
    throw new ValidationError('Can not find reconciliation sheet');
  }
  const bookings = project!.getUnreconciledBookings();
  if (bookings.length === 0) {
    const ui = SpreadsheetApp.getUi();
    ui.alert('No unreconciled bookings found', 'Found no unreconciled bookings for this project.\n*Currently does not check for Intern or Freelance Reconciliations. Coming Soon.', ui.ButtonSet.OK);
    return;
  } else {
    const ui = SpreadsheetApp.getUi();
    const modalAlert = showUnreconciledBookingsModal(bookings);
    ui.showModalDialog(modalAlert, 'Unreconciled Bookings');
  }
}

export function requestCloseProject(): boolean {
  const project = Project.getProject();
  const bookings = project!.getUnreconciledBookings();
  const ui = SpreadsheetApp.getUi();
  if (bookings.length === 0) {
    const response = ui.alert(
      'Close Project?',
      `Are you sure you want to close the project ${project!.title}? This will archive the project and remove it from the active projects list.`,
      ui.ButtonSet.YES_NO);
    if (response === ui.Button.YES) {
      return true;
    }
    return false;
  } else {
    const modalAlert = showUnreconciledBookingsModal(bookings);
    ui.showModalDialog(modalAlert, 'Can Not Close: Unreconciled Bookings');
    return false;
  }
}

export function closeProject(nameArray: ProjectNameArray): void {
  Project.getProject({nameArray})!.closeProject();  
}

export function cancelRename(jobYrMo: string): void {
  const project = Project.getProject({jobYrMo});
  project!.resetDatabaseRow();
}

export function renameProject(projects: SerializedData): void {
  const originalProject = Project.getProject({nameArray: [projects.yrmo as string, projects.jobNumber as string, projects.clientName as string, projects.projectName as string, 'FALSE']}); 
  const newProject = projects.newProject as SerializedData;
  originalProject!.renameProject(newProject);
}

export function deleteAllBookings(bookings: SerializedData[]): void {
  bookings.forEach(b => {
    const calendarId = b.calendarId as string;
    const bookingId = b.eventId as string;
    deleteBooking({calendarId, bookingId});
  });
}

export function reconcileAllBookings(bookings: SerializedData[]): void {
  if (!bookings || bookings.length === 0) {
    throw new ValidationError('No bookings provided for reconciliation.');
  }
  bookings.forEach(b => {
    const calendarId = b.calendarId as string;
    const eventId = b.eventId as string;
    const booking = new exports.Booking({calendarId, eventId});
    booking.reconcileBooking();
  });
}

export function openSheetChangelog(): void {
  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(exports.openChangelogAsModalDialogue(), 'Changelog');
}

export function initConstants(): SerializedData {
  return {version: exports.version, isAdmin: String(exports.User.isAdmin)};
}