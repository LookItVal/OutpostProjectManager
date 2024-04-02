import { regexJobName } from '../src/constants';
import { Colors } from '../src/constants';

interface ReconciliationExport {
  regexJobName: typeof regexJobName;
}

declare const exports: ReconciliationExport;

export function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen): void {
  setTheme(e);
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


function setTheme(e: GoogleAppsScript.Events.SheetsOnOpen) {
  const theme = e.source.getSpreadsheetTheme();
  console.log(theme?.getThemeColors());
  theme?.setConcreteColor(SpreadsheetApp.ThemeColorType.TEXT, Colors.newColor(Colors.textColor));
  theme?.setConcreteColor(SpreadsheetApp.ThemeColorType.BACKGROUND, Colors.newColor(Colors.backgroundColor));
  theme?.setConcreteColor(SpreadsheetApp.ThemeColorType.HYPERLINK, Colors.newColor(Colors.hyperlinkColor));
  theme?.setConcreteColor(SpreadsheetApp.ThemeColorType.ACCENT1, Colors.newColor(Colors.accent1));
  theme?.setConcreteColor(SpreadsheetApp.ThemeColorType.ACCENT2, Colors.newColor(Colors.accent2));
  theme?.setConcreteColor(SpreadsheetApp.ThemeColorType.ACCENT3, Colors.newColor(Colors.accent3));
  theme?.setConcreteColor(SpreadsheetApp.ThemeColorType.ACCENT4, Colors.newColor(Colors.accent4));
  theme?.setConcreteColor(SpreadsheetApp.ThemeColorType.ACCENT5, Colors.newColor(Colors.accent5));
  theme?.setConcreteColor(SpreadsheetApp.ThemeColorType.ACCENT6, Colors.newColor(Colors.accent6));
  theme?.setFontFamily(Colors.fontFamily);
  console.log(theme?.getThemeColors());
}
