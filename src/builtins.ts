import { Colors } from './constants';

export function onInstall(e: GoogleAppsScript.Events.SheetsOnOpen): void {
  onOpen(e);
}

// This function runs no matter what app is open.
// For script specific needs, use bound scripts not this.
export function onOpen(e: object): void {
  console.log(e);
}

export function onEdit(e: object): void {
  // yea idk what goin on here
  console.log('THE ON EDIT FUCTION HAS BEEN RUN', e);
}

export function onSelectionChange(e: object): void {
  // yea idk what goin on here
  console.log('THE ON SELECTION CHANGE FUNCTION HAS BEEN RUN', e);
}

