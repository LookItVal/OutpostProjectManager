import { Project, Proposal } from '../classes/initiatives';
import { SerializedData, ProposalNameArray, InitiativeParams, unknownFunction, OPDSheetJSONTests } from '../interfaces';
import { ValidationError } from '../classes/errors';
import { spreadsheet, version } from '../constants';
import { openChangelogAsModalDialogue } from '../changelog';
import { User } from '../classes/user';
import { Client } from '../classes/client';

interface RequestHandlersExports {
  [key: string]: unknownFunction | unknown;
  Project: typeof Project;
  Proposal: typeof Proposal;
  Client: typeof Client;
  ValidationError: typeof ValidationError;
  User: typeof User;
  spreadsheet: typeof spreadsheet;
  version: typeof version;
  openChangelogAsModalDialogue: typeof openChangelogAsModalDialogue;
}
declare const exports: RequestHandlersExports;
let currentBenchmark: {[key: string]: number[]} = {};

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
    const lucky_charms = exports.Project.getInitiative().serialize();
    console.log('THIS IS THE LAST PART OF THE BACKEND FUNCTION', lucky_charms);
    return lucky_charms;
  } catch (e: unknown) {
    if (e instanceof exports.ValidationError) {
      console.error(e.message);
      return {'title': e.message.split(':')[0]} as SerializedData;
    }
    console.error(e);
    return {'title': 'A fatal error has occured.'} as SerializedData;
  }
}

export function generateProposal(nameArray: ProposalNameArray): void {
  exports.Proposal.getProposal({nameArray} as InitiativeParams).generateProposal();
}

export function acceptProposal(nameArray: ProposalNameArray): void {
  exports.Proposal.getProposal({nameArray} as InitiativeParams).acceptProposal();
  jumpToProject();
}

export function generateJob(nameArray: ProposalNameArray): void {
  exports.Project.getProject({nameArray} as InitiativeParams).generateProject();
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
  selectEmptyProject();
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
  const project = exports.Project.getProject();
  if (project.clientName !== 'Test Client') {
    throw new Error('You are not authorized to perform this action.');
  }
  const row = project.rowNumber;
  const spreadsheet = exports.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
  const sheet = spreadsheet.getActiveSheet();
  sheet.getRange(`A${row}`).setValue('');
  sheet.getRange(`C${row}`).setValue('');
  sheet.getRange(`D${row}`).setValue('');
  sheet.getRange(`E${row}`).setValue('');
  sheet.getRange(`F${row}`).setValue('');
  project.deleteFiles();
}

export function deleteClientFiles(): void {
  if (!exports.User.isDeveloper) {
    throw new Error('You are not authorized to perform this action.');
  }
  const client = new exports.Client({name: 'Test Client'});
  if (client.name !== 'Test Client') {
    throw new Error('You are not authorized to perform this action.');
  }
  client.deleteClientFiles();
}

// add function to delete the text in the spreadsheet but make sure it only does if its thee test client weve been playing with.

export function selectEmptyProposal(): void {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getLastRow()+1;
  sheet.getRange(`A${row}`).activate();
}

export function selectNoDocsProposal(): void {
  selectEmptyProposal();
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
  const proposal = exports.Proposal.getProposal();
  if (proposal.clientName !== 'Test Client') {
    throw new Error('You are not authorized to perform this action.');
  }
  const row = proposal.rowNumber;
  const spreadsheet = exports.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
  const sheet = spreadsheet.getActiveSheet();
  sheet.getRange(`A${row}`).setValue('');
  sheet.getRange(`B${row}`).setValue('');
  sheet.getRange(`C${row}`).setValue('');
  sheet.getRange(`D${row}`).setValue('');
  sheet.getRange(`E${row}`).setValue('');
  proposal.deleteFiles();
}

// will only run a function that has been exported.
export function benchmark(functionName: string, ...args: unknown[]): unknown {
  if (functionName === 'clear') {
    currentBenchmark = {};
    return;
  }
  if (functionName === 'get') {
    const realBenchmark: { [key: string]: number } = {};
    for (const key of Object.keys(currentBenchmark)) {
      if (key === 'jumpToProjects' || key === 'jumpToProposals') {
        // if length of currentBenchmark[key] is 1, then it is a valid benchmark
        // otherwise throw an error
        if (currentBenchmark[key].length === 1) {
          realBenchmark[key] = currentBenchmark[key][0];
          continue;
        }
        throw new Error('Extra Jump Benchmark found');
      }
      if (key === 'refreshSidebar') {
        if (currentBenchmark[key][0]) {
          realBenchmark['getInitiative from empty project'] = currentBenchmark[key][0];
          continue;
        }
        if (currentBenchmark[key][1]) {
          realBenchmark['getInitiative from project with no docs'] = currentBenchmark[key][1];
          continue;
        }
        throw new Error('Extra Refresh Sidebar Benchmark found');
      }
      if (key === 'generateJob') {
        if (currentBenchmark[key][0]) {
          realBenchmark['generateProject from existing client'] = currentBenchmark[key][0];
          continue;
        }
        if (currentBenchmark[key][1]) {
          realBenchmark['generateProject from new client'] = currentBenchmark[key][1];
          continue;
        }
        throw new Error('Extra Generate Job Benchmark found');
      }
      throw new Error('Function not found');
    }
    return realBenchmark;
  }
  //if function_name is not in exports, throw an error
  if (!(functionName in exports)) {
    throw new Error('Function not found');
  }
  if (typeof exports[functionName] !== 'function') {
    throw new Error('Function not found');
  }
  const start = Date.now();
  const result = (exports[functionName] as unknownFunction)(...args);
  const end = Date.now();
  const time = end - start;
  if (!(functionName in currentBenchmark)) {
    currentBenchmark[functionName] = [];
  }
  (currentBenchmark[functionName]).push(time);
  return result;
}

export function showBenchmark(frontendBenchmark: OPDSheetJSONTests): void {
  const fullBenchmark = {OPDSheet: {
    'Frontend': frontendBenchmark,
    'Backend': currentBenchmark
  }};
  // convert fullBenchmark into json string
  const fullBenchmarkString = JSON.stringify(fullBenchmark);
  console.log(fullBenchmarkString);
  const output = HtmlService.createTemplateFromFile('src/html/baseStyle').evaluate();
  output.append('<H2> Full Benchmark JSON </H2>');
  output.append(`<p>${fullBenchmarkString}</p>`);
  output.append('</body>');
  output.append('</html>');
  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(output, 'Full Benchmark Results');
}
