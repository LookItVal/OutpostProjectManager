import { regexJobName } from '../src/constants';
import { Theme } from '../src/theme';

interface ReconciliationExport {
  regexJobName: typeof regexJobName;
}

declare const exports: ReconciliationExport;

export function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen): void {
  Theme.setTheme(e);
  if (isTemplate(e)) {
    return;
  }
  if (isFirstOpen(e)) {
    const sheet = e.source;
    sheet.getSheetByName('Top Sheet')?.getRange('A1').setValue(sheet.getName());
  }
}

export function isFirstOpen(e: GoogleAppsScript.Events.SheetsOnOpen): boolean {
  return !exports.regexJobName.test(e.source.getName());
}

export function isTemplate(e: GoogleAppsScript.Events.SheetsOnOpen): boolean {
  return !exports.regexJobName.test(e.source.getName());
}
