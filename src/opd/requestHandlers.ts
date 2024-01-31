import { Project, Proposal } from '../classes/initiatives';
import { SerializedData, ProposalNameArray, InitiativeParams } from '../interfaces';
import { ValidationError } from '../classes/errors';
import { properties, spreadsheet, version } from '../constants';
import { openChangelogAsModalDialogue } from '../changelog';
import { benchmark, verboseLog } from '../utilities';

interface RequestHandlersExports {
  Project: typeof Project;
  Proposal: typeof Proposal;
  ValidationError: typeof ValidationError;
  properties: typeof properties;
  spreadsheet: typeof spreadsheet;
  version: typeof version;
  openChangelogAsModalDialogue: typeof openChangelogAsModalDialogue;
  benchmark: typeof benchmark;
  verboseLog: typeof verboseLog;
}
declare const exports: RequestHandlersExports;

export function jumpToProposal(): void {
  const benchmarked = exports.benchmark( function jumpToProposal() {
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
  });
  benchmarked();
}


export function jumpToProject(): void {
  const benchmarked = exports.benchmark( function jumpToProject() {
    const spreadsheet = exports.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
    const sheet = exports.Project.recentSheet;
    spreadsheet.setActiveSheet(sheet);
    sheet.setActiveRange(sheet.getRange(`A${exports.Project.recentRow}`));
  });
  benchmarked();
}

export function getInitiative(): SerializedData {
  const benchmarked = exports.benchmark( function getInitiative(): SerializedData {
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
  });
  return benchmarked() as SerializedData;
}

export function requestProposalGeneration(): boolean {
  const benchmarked = exports.benchmark( function requestProposalGeneration(): boolean {
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
  });
  return benchmarked() as boolean;
}

export function generateProposal(nameArray: ProposalNameArray): void {
  const benchmarked = exports.benchmark( function generateProposal(nameArray): void {
    Proposal.getProposal({nameArray} as InitiativeParams).generateProposal();
  });
  benchmarked(nameArray);
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
  const benchmarked = exports.benchmark( function acceptProposal(nameArray): void {
    Proposal.getProposal({nameArray} as InitiativeParams).acceptProposal();
    jumpToProject();
  });
  benchmarked(nameArray);
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
  const benchmarked = exports.benchmark( function generateJob(nameArray): void {
    Project.getProject({nameArray} as InitiativeParams).generateProject();
  });
  benchmarked(nameArray);
}

export function openSheetChangelog(): void {
  const benchmarked = exports.benchmark( function openSheetChangelog(): void {
    const ui = SpreadsheetApp.getUi();
    ui.showModalDialog(exports.openChangelogAsModalDialogue(), 'Changelog');
  });
  benchmarked();
}

export function initConstants(): SerializedData {
  return {version: exports.version};
}

export function requestBenchmark(): boolean | undefined {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Benchmark',
    'Would you like to run a benchmark?',
    ui.ButtonSet.YES_NO);
  if (response === ui.Button.YES) {
    return true;
  }
  return undefined;
}