import { Project, Proposal } from '../classes/initiatives';
import { Booking } from '../classes/booking';
import { User } from '../classes/user';
import { SerializedData, ProposalNameArray, ProjectNameArray } from '../interfaces';
import { ValidationError } from '../classes/errors';
import { properties, spreadsheet, version } from '../constants';
import { openChangelogAsModalDialogue } from '../changelog/handlers';

interface RequestHandlersExports {
  Project: typeof Project;
  Proposal: typeof Proposal;
  User: typeof User;
  ValidationError: typeof ValidationError;
  properties: typeof properties;
  spreadsheet: typeof spreadsheet;
  version: typeof version;
  openChangelogAsModalDialogue: typeof openChangelogAsModalDialogue;
}
declare const exports: RequestHandlersExports;

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
  try {
    const project = exports.Project.getProject();
    if (!project.folder) {
      try {
        const originalProject = exports.Project.getProject({jobYrMo: `${project.yrmo} ${project.jobNumber} ${project.clientName}`});
        const lucky_charms = originalProject.serialize();
        lucky_charms.newProject = project.serialize();
        return lucky_charms;
      } catch (e: unknown) {
        if (e instanceof ValidationError) {
          return project.serialize();
        }
      }
    }
    return project.serialize();
  } catch (e: unknown) {
    if (e instanceof ValidationError) {
      console.error(e.message);
      return {'title': e.message.split(':')[0]} as SerializedData;
    }
    console.error(e);
    return {'title': 'A fatal error has occured.'} as SerializedData;
  }
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
  if (project.type !== 'PROJECT') {
    throw new ValidationError('Project type is not set to project.');
  }
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Generate Costing?',
    `Are you sure you want to generate a costing sheet in the ${project.clientName} folder?`,
    ui.ButtonSet.YES_NO);
  if (response === ui.Button.YES) {
    return true;
  }
  return false;
}

export function generateCosting(nameArray: ProjectNameArray): void {
  Project.getProject({nameArray}).createCostingSheet();
}

export function requestJobGeneration(): boolean {
  const project = Project.getProject();
  if (project.type !== 'PROJECT') {
    throw new ValidationError('Project type is not set to project.');
  }
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Generate Job?',
    `Are you sure you want to generate a job in the ${project.clientName}? folder called ${project.title}?`,
    ui.ButtonSet.YES_NO);
  if (response === ui.Button.YES) {
    return true;
  }
  return false;
}

export function generateJob(nameArray: ProposalNameArray): void {
  Project.getProject({nameArray}).generateProject();
}

function showUnreconciledBookingsModal(bookings: Booking[]): GoogleAppsScript.HTML.HtmlOutput {
  const output = HtmlService.createTemplateFromFile('src/opd/html/unreconciledBookings').evaluate();
  for (const booking of bookings) {
    output.append(`<div class="row-container" id="booking-${booking.calendarId?.split('@')[0]}-${booking.eventId?.split('@')[0]}">`);
    output.append('<div class="row">');
    output.append('<div class="main">');
    output.append(`<p><b>${booking.technician}</b> - ${booking.date.toLocaleDateString()} - ${booking.duration} hours</p>`);
    output.append('<div style="display: flex; align-items: center; gap: 10px;">');
    output.append(`<button class="open-booking-button action" onclick="window.open('${booking.calendarEventLink}', '_blank')">Open</button>`);
    output.append(`<button class="delete-booking-button create" booking-id="${booking.eventId?.split('@')[0]}" calendar-id="${booking.calendarId?.split('@')[0]}" onclick="confirmDeleteBooking(this)">Delete</button>`);
    output.append('</div>');
    output.append('</div>');
    output.append('<div class="confirm-delete">');
    output.append('<p><b>Are you sure you want to delete this booking?</b></p>');
    output.append('<div style="display: flex; align-items: center; gap: 10px;">');
    output.append(`<button class="confirm-delete-button create" booking-id="${booking.eventId?.split('@')[0]}" calendar-id="${booking.calendarId?.split('@')[0]}" onclick="deleteBooking(this)">Yes</button>`);
    output.append(`<button class="cancel-delete-button action" booking-id="${booking.eventId?.split('@')[0]}" calendar-id="${booking.calendarId?.split('@')[0]}" onclick="cancelDeleteBooking(this)">No</button>`);
    output.append('</div>');
    output.append('</div>');
    output.append('</div>');
    output.append('</div>');
  }
  output.append('<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>');
  output.append('<script>\n');
  output.append(`let counter = ${bookings.length};\n`);
  output.append('function deleteBooking(button) {\n');
  output.append('  counter--;\n');
  output.append('  const bookingId = button.getAttribute("booking-id");\n');
  output.append('  const calendarId = button.getAttribute("calendar-id");\n');
  output.append('  $("#booking-" + calendarId + "-" + bookingId).fadeOut();\n');
  output.append('  setTimeout(() => {\n');
  output.append('    $("#booking-" + calendarId + "-" + bookingId).remove();\n');
  output.append('    if (counter === 0) {\n');
  output.append('      google.script.host.close();\n');
  output.append('    }\n');
  output.append('  }, 500);\n');
  output.append('  google.script.run.withFailureHandler(() => {}).withSuccessHandler(() => {}).deleteBooking({calendarId, bookingId});\n');
  output.append('}\n');

  output.append('function confirmDeleteBooking(button) {\n');
  output.append('  const bookingId = button.getAttribute("booking-id");\n');
  output.append('  const calendarId = button.getAttribute("calendar-id");\n');
  output.append('  $("#booking-" + calendarId + "-" + bookingId + " .row").addClass("checking-confirm");\n');
  output.append('}\n');

  output.append('function cancelDeleteBooking(button) {\n');
  output.append('  const bookingId = button.getAttribute("booking-id");\n');
  output.append('  const calendarId = button.getAttribute("calendar-id");\n');
  output.append('  $("#booking-" + calendarId + "-" + bookingId + " .row").removeClass("checking-confirm");\n');
  output.append('}\n');
  output.append('</script>');
  output.append('</body>');
  output.append('</html>');
  return output;
}

export function deleteBooking({calendarId, bookingId}: {calendarId: string, bookingId: string}): void {
  calendarId = calendarId + '@group.calendar.google.com';
  bookingId = bookingId + '@google.com';
  CalendarApp.getCalendarById(calendarId)?.getEventById(bookingId)?.deleteEvent();
}
  
export function checkReconciliationSheet(nameArray: ProjectNameArray): void {
  const project = Project.getProject({nameArray});
  if (project.type !== 'PROJECT') {
    throw new ValidationError('Project type is not set to project.');
  }
  if (!project.reconciliationSheetId) {
    throw new ValidationError('Can not find reconciliation sheet');
  }
  const bookings = project.getUnreconciledBookings();
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
  const bookings = project.getUnreconciledBookings();
  const ui = SpreadsheetApp.getUi();
  if (bookings.length === 0) {
    const response = ui.alert(
      'Close Project?',
      `Are you sure you want to close the project ${project.title}? This will archive the project and remove it from the active projects list.`,
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
  Project.getProject({nameArray}).closeProject();  
}

export function cancelRename(jobYrMo: string): void {
  const project = Project.getProject({jobYrMo});
  project.resetDatabaseRow();
}

export function openSheetChangelog(): void {
  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(exports.openChangelogAsModalDialogue(), 'Changelog');
}

export function initConstants(): SerializedData {
  return {version: exports.version, isAdmin: String(exports.User.isAdmin)};
}