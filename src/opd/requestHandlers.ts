import { Initiative, Project, Proposal } from '../classes/initiatives';
import { SerializedData, ProposalNameArray, InitiativeParams, unknownFunction } from '../interfaces';
import { ValidationError } from '../classes/errors';
import { properties, spreadsheet, version } from '../constants';
import { openChangelogAsModalDialogue } from '../changelog';
import { User } from '../classes/user';

interface RequestHandlersExports {
  [key: string]: unknownFunction | unknown;
  Project: typeof Project;
  Proposal: typeof Proposal;
  ValidationError: typeof ValidationError;
  User: typeof User;
  properties: typeof properties;
  spreadsheet: typeof spreadsheet;
  version: typeof version;
  openChangelogAsModalDialogue: typeof openChangelogAsModalDialogue;
}
declare const exports: RequestHandlersExports;
let current_benchmark: {[key: string]: number} = {};

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
    console.log('THIS IS THE LAST PART OF THE BACKEND FUNCTION', lucky_charms);
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

export function generateProposal(nameArray: ProposalNameArray): void {
  Proposal.getProposal({nameArray} as InitiativeParams).generateProposal();
}

export function acceptProposal(nameArray: ProposalNameArray): void {
  Proposal.getProposal({nameArray} as InitiativeParams).acceptProposal();
  jumpToProject();
}

export function generateJob(nameArray: ProposalNameArray): void {
  Project.getProject({nameArray} as InitiativeParams).generateProject();
}

export function openSheetChangelog(): void {
  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(exports.openChangelogAsModalDialogue(), 'Changelog');
}

export function initConstants(): SerializedData {
  return {version: exports.version};
}

//////////////////////////////////
//     Dev Request Handlers     //
//////////////////////////////////

export function selectEmptyProject(): void {
  const spreadsheet = exports.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
  const sheet = exports.Project.nextSheet;
  spreadsheet.setActiveSheet(sheet);
  const row = exports.Project.nextRow;
  sheet.getRange(`A${row}`).activate();
}

export function selectNoDocsProject(): void {
  const spreadsheet = exports.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
  const sheet = spreadsheet.getActiveSheet();
  const row = sheet.getActiveRange()?.getRow();
  sheet.getRange(`A${row}`).setValue('2400');
  sheet.getRange(`C${row}`).setValue('Test Client');
  sheet.getRange(`D${row}`).setValue('Test Project');
}

export function deleteProjectFiles(): void {
  if (!exports.User.isDeveloper) {
    throw new Error('You are not authorized to perform this action.');
  }
  const project = Project.getProject();
  if (project.clientName !== 'Test Client') {
    throw new Error('You are not authorized to perform this action.');
  }
  project.deleteFiles();
}

export function deleteClientFiles(): void {
  if (!exports.User.isDeveloper) {
    throw new Error('You are not authorized to perform this action.');
  }
  const initiative = Initiative.getInitiative();
  if (initiative.clientName !== 'Test Client') {
    throw new Error('You are not authorized to perform this action.');
  }
  initiative.client.deleteClientFiles();
}

// add function to delete the text in the spreadsheet but make sure it only does if its thee test client weve been playing with.

export function selectEmptyProposal(): void {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getLastRow()+1;
  sheet.getRange(`A${row}`).activate();
}

export function selectNoDocsProposal(): void {
  const spreadsheet = exports.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
  const sheet = spreadsheet.getActiveSheet();
  const row = sheet.getActiveRange()?.getRow();
  sheet.getRange(`A${row}`).setValue('2400');
  sheet.getRange(`B${row}`).setValue('Test Client');
  sheet.getRange(`C${row}`).setValue('Test Proposal');
}

export function deleteProposalFiles(): void {
  if (!exports.User.isDeveloper) {
    throw new Error('You are not authorized to perform this action.');
  }
  const proposal = Proposal.getProposal();
  if (proposal.clientName !== 'Test Client') {
    throw new Error('You are not authorized to perform this action.');
  }
  proposal.deleteFiles();
}

// will only run a function that has been exported.
export function benchmark(function_name: string, ...args: unknown[]): unknown {
  if (function_name === 'clear') {
    current_benchmark = {};
    return;
  }
  if (function_name === 'get') {
    return current_benchmark;
  }
  //if function_name is not in exports, throw an error
  if (!(function_name in exports)) {
    throw new Error('Function not found');
  }
  if (typeof exports[function_name] !== 'function') {
    throw new Error('Function not found');
  }
  const start = performance.now();
  const result = (exports[function_name] as unknownFunction)(...args);
  const end = performance.now();
  current_benchmark[function_name] = end - start;
  return result;
}