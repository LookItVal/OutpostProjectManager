// State
export const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null  = SpreadsheetApp.getActiveSpreadsheet();

export const properties = PropertiesService.getScriptProperties();
//Regex queries
export const regexJobName: RegExp = /^\d{4}\s\d{4}\s.*/;
export const regexProposalName: RegExp = /^PROPOSAL: \d{4}\s.*/;
export const regex4Digits: RegExp = /^\d{4}/;
export const regexProposalOpen: RegExp = /^PROPOSAL:/;
export const regexPullDigits: RegExp = /\d+/g;
