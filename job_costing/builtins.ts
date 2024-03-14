import { regexProposalName } from '../src/constants';

interface JobCostingExport {
  regexProposalName: typeof regexProposalName;
}

declare const exports: JobCostingExport;

export function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen): void {
  if (isTemplate(e)) {
    return;
  }
  if (isFirstOpen(e)) {
    const sheet = e.source;
    sheet.getSheetByName('Top Sheet')?.getRange('B1').setValue(sheet.getName());
  }
}

export function isFirstOpen(e: GoogleAppsScript.Events.SheetsOnOpen): boolean {
  return !exports.regexProposalName.test(e.source.getName());
}

export function isTemplate(e: GoogleAppsScript.Events.SheetsOnOpen): boolean {
  return e.source.getName() === 'Job Costing Worksheet Template';
}