import { Colors } from './constants';

export function onInstall(e: GoogleAppsScript.Events.SheetsOnOpen): void {
  onOpen(e);
}

export function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen): void {
  // yea idk what goin on here
  console.log('THIS IS THE CUSTOM ONE');
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
  console.log('completed');
}

export function onEdit(e: object): void {
  // yea idk what goin on here
  console.log('THE ON EDIT FUCTION HAS BEEN RUN', e);
}

export function onSelectionChange(e: object): void {
  // yea idk what goin on here
  console.log('THE ON SELECTION CHANGE FUNCTION HAS BEEN RUN', e);
}

