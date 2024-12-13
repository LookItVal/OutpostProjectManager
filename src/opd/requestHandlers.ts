/**
 * Request handlers for the frontend of the Outpost Project Database.
 * @module src/opd/requestHandlers
 */

import { Project, Proposal } from '../classes/initiatives';
import { SerializedData, ProposalNameArray, ProjectNameArray } from '../interfaces';
import { ValidationError } from '../classes/errors';
import { State } from '../constants';
import { Changelog } from '../changelog';

interface RequestHandlersExports {
  Project: typeof Project;
  Proposal: typeof Proposal;
  ValidationError: typeof ValidationError;
}
declare const exports: RequestHandlersExports;

/**
 * Jump to the proposal sheet.
 * @function jumpToProposal
 */
export function jumpToProposal(): void {
  const spreadsheet = State.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
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

/**
 * Jump to the project sheet.
 * @function jumpToProject
 */
export function jumpToProject(): void {
  const spreadsheet = State.spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
  const sheet = exports.Project.recentSheet;
  spreadsheet.setActiveSheet(sheet);
  sheet.setActiveRange(sheet.getRange(`A${exports.Project.recentRow}`));
}

/**
 * Get the initiative data and return it as a serialized object.
 * @function getInitiative
 * @returns {SerializedData} The serialized data of the initiative.
 */
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

/**
 * Request the generation of a proposal.
 * @function requestProposalGeneration
 * @returns {boolean} Whether the user has confirmed the proposal generation.
 */
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

/**
 * Generate a proposal.
 * @function generateProposal
 * @param {ProposalNameArray} nameArray - The name array of the proposal.
 */
export function generateProposal(nameArray: ProposalNameArray): void {
  Proposal.getProposal({nameArray}).generateProposal();
}

/**
 * Request the acceptance of a proposal.
 * @function requestProposalAccept
 * @returns {boolean} Whether the user has confirmed the proposal acceptance.
 */
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

/**
 * Accept a proposal.
 * @function acceptProposal
 * @param {ProposalNameArray} nameArray - The name array of the proposal.
 */
export function acceptProposal(nameArray: ProposalNameArray): void {
  Proposal.getProposal({nameArray}).acceptProposal();
  jumpToProject();
}

/**
 * Request the generation of a costing sheet.
 * @function requestCostingGeneration
 * @returns {boolean} Whether the user has confirmed the costing generation.
 */
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

/**
 * Generate a costing sheet.
 * @function generateCosting
 * @param {ProjectNameArray} nameArray - The name array of the project.
 */
export function generateCosting(nameArray: ProjectNameArray): void {
  Project.getProject({nameArray}).createCostingSheet();
}

/**
 * Request the generation of a job.
 * @function requestJobGeneration
 * @returns {boolean} Whether the user has confirmed the job generation.
 */
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

/**
 * Generate a job.
 * @function generateJob
 * @param {ProjectNameArray} nameArray - The name array of the project.
 */
export function generateJob(nameArray: ProposalNameArray): void {
  Project.getProject({nameArray}).generateProject();
}

/**
 * Open the changelog as a modal dialogue.
 * @function openSheetChangelog
 */
export function openSheetChangelog(): void {
  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(Changelog.openChangelogAsModalDialogue(), 'Changelog');
}

/**
 * Initialize the constants for the frontend.
 * @function initConstants
 * @returns {SerializedData} The serialized data of the constants.
 */
export function initConstants(): SerializedData {
  return {version: State.version};
}