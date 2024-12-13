/**
 * This file is for Google Apps Script built-in functions and simple triggers.
 * @module src/builtins
 */

import { Theme } from './theme';

/**
 * Run when the add-on is installed.
 * @function onInstall
 * @param {GoogleAppsScript.Events.SheetsOnOpen} e The event object.
 */
export function onInstall(e: GoogleAppsScript.Events.SheetsOnOpen): void {
  onOpen(e);
}

/**
 * This function runs no matter what app or document is open.
 * For script specific needs, use bound scripts not this.
 * Does inject the theme into the any sheet that is opened.
 * @function onOpen
 * @param {GoogleAppsScript.Events.SheetsOnOpen} e The event object.
 */
export function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen): void {
  Theme.setTheme(e);
  console.log(e);
}

/**
 * This function runs when the user edits the sheet. Theoretically.
 * @function onEdit
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e The event object.
 */
export function onEdit(e: object): void {
  // yea idk what goin on here
  console.log('THE ON EDIT FUCTION HAS BEEN RUN', e);
}

/**
 * This function runs when the user changes the selection in the sheet. Theoretically.
 * @function onSelectionChange
 * @param {GoogleAppsScript.Events.SheetsOnSelectionChange} e The event object.
 */
export function onSelectionChange(e: object): void {
  // yea idk what goin on here
  console.log('THE ON SELECTION CHANGE FUNCTION HAS BEEN RUN', e);
}