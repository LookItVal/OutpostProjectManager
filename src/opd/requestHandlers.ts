import { Project, Proposal } from '../classes/initiatives';
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
    const lucky_charms = Project.getInitiative().serialize();
    return lucky_charms;
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

export function requestCloseProject(): boolean {
  const project = Project.getProject();
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Close Project?',
    `Are you sure you want to close the project ${project.title}? This will archive the project and remove it from the active projects list.`,
    ui.ButtonSet.YES_NO);
  if (response === ui.Button.YES) {
    return true;
  }
  return false;
}

export function closeProject(nameArray: ProjectNameArray): void {
  const project = Project.getProject({nameArray});
  const bookings = project.getUnreconciledBookings();
  if (bookings.length === 0) {
    project.closeProject();
  }
  else {
    const ui = SpreadsheetApp.getUi();
    const modalAlert = HtmlService.createTemplateFromFile('src/opd/html/unreconciledBookings').evaluate();
    ui.showModalDialog(modalAlert, 'Unreconciled Bookings');
  }
}

export function openSheetChangelog(): void {
  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(exports.openChangelogAsModalDialogue(), 'Changelog');
}

export function initConstants(): SerializedData {
  return {version: exports.version, isAdmin: String(exports.User.isAdmin)};
}