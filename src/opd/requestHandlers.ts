import { Project, Proposal } from '../classes/initiatives';
import { SerializedData } from '../interfaces';
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

export function getProject(): SerializedData {
    const nameArray = [''];
    try {
        return Project.getInitiative({nameArray}).serialize();
    } catch (e: unknown) {
        if (e instanceof ValidationError) {
            return {'title': e.message.split(':')[0]} as SerializedData;
        }
        return {'title': 'A fatal error has occured.'} as SerializedData;
    }
}