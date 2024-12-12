/**
 * Theme related functions.
 * @module src/theme
 */

import { Colors } from './constants';

/**
 * Theme related functions.
 * @namespace Theme
 * @memberof src/theme
 * @exports setTheme - Sets the theme for the spreadsheet.
 */
export namespace Theme {
  /**
   * Sets the theme for the spreadsheet. Must be called from the onOpen trigger.
   * @function setTheme
   * @param {GoogleAppsScript.Events.SheetsOnOpen} e - The onOpen event object.
   */
  export function setTheme(e: GoogleAppsScript.Events.SheetsOnOpen) {
    const theme = e.source.getSpreadsheetTheme();
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
  }
}