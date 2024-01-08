import { Project, Proposal } from '../classes/initiatives';
import { SerializedData, ProposalNameArray } from '../interfaces';
import { ValidationError } from '../classes/errors';

export function jumpToProposal(): void {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    spreadsheet.setActiveSheet(Proposal.proposalSheet);
    const lastRow = spreadsheet.getActiveSheet().getLastRow();
    spreadsheet.getActiveSheet().getRange(`A${lastRow}`).activate();
}

export function jumpToProject(): void {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = Project.recentSheet;
    spreadsheet.setActiveSheet(sheet);
    const  columnA = sheet.getRange('A:A').getValues();
    let lastRowWithContent = 0;
    for (let i = 0; i < columnA.length; i++) {
        if (columnA[i][0] !== '') {
            lastRowWithContent = i;
            break;
        }
    }
    sheet.setActiveRange(sheet.getRange(`A${lastRowWithContent}`));
}

export function getInitiative(): SerializedData {
    //let nameArray = getProjectNameArray();
    try {
        return Project.getInitiative().serialize();
    } catch (e: unknown) {
        if (e instanceof ValidationError) {
            return {'title': e.message.split(':')[0]} as SerializedData;
        }
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