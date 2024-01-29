// State
export const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null  = SpreadsheetApp.getActiveSpreadsheet();

export const properties = PropertiesService.getScriptProperties();
//Regex queries
export const regexJobName: RegExp = /^\d{4}\s\d{4}\s.*/;
export const regexProposalName: RegExp = /^PROPOSAL: \d{4}\s.*/;
export const regex4Digits: RegExp = /^\d{4}/;
export const regexProposalOpen: RegExp = /^PROPOSAL:/;
export const regexPullDigits: RegExp = /\d+/g;

//Changelog
export const version = '1.2.2';
export const changelog = {
  1: {
    2: [
      'Shiny Things Update',
      {
        2: [
          ['Cleaned up log statements', 'Maintaniance'],
          ['Managed Git Repo', 'Maintaniance'],
          ['Added Auto-filling for Client Names in the Outpost Project Database', 'New Feature'],
          ['Added Animation to Projects and Proposals Buttons', 'UI Change'],
          ['Cleaned Up Client Folder Structure', 'Maintaniance'],
          ['Added Cursor Pointing to buttons in the HTML stylesheet', 'UI Change'],
          ['Added Changelog to the calendar sidebar', 'UI Change'],
        ],
        1: [
          ['Stopped text from flashing on project generation', 'Bug Fix'],
          ['Disabled Load Button when loading new content', 'Bug Fix'],
          ['Reorganized folder structure', 'Maintaniance']
        ],
        0: [
          ['Added Changelog', 'New Feature'],
          ['Fully Converted Codebase Into Typescript.', 'Maintaniance'],
          ['Began Readme and some documentation.', 'Maintaniance'],
          ['Added Better organization to frontend, with bigger text and icons with subtle animations.', 'UI Change'],
          ['Prepared the code base for more rapid changes.', 'Maintaniance']
        ]
      }
    ]
  }
};