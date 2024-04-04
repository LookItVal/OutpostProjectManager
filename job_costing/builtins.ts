import { regexProposalName } from '../src/constants';
import { Theme } from '../src/theme';

interface JobCostingExport {
  regexProposalName: typeof regexProposalName;
}

declare const exports: JobCostingExport;

export function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen): void {
  Theme.setTheme(e);
  if (isTemplate(e)) {
    return;
  }
  if (isFirstOpen(e)) {
    const sheet = e.source;
    sheet.getSheetByName('Top Sheet')?.getRange('B1').setValue(sheet.getName());
  }
}

export function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
  const range = e.range;
  if (range.getValue() === true) {
    range.expandGroups();
  }
  if (range.getValue() === false) {
    range.collapseGroups();
  }
}

export function isFirstOpen(e: GoogleAppsScript.Events.SheetsOnOpen): boolean {
  return !exports.regexProposalName.test(e.source.getName());
}

export function isTemplate(e: GoogleAppsScript.Events.SheetsOnOpen): boolean {
  return e.source.getName() === 'Job Costing Worksheet Template';
}