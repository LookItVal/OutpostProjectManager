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
export const version = '1.2.5';
export const changelog = {
  1: {
    2: [
      'Shiny Things Update',
      {
        5: [
          ['Added autofill for project title in Reconciliation Sheet', 'New Feature'],
          ['Added autofill for project title in Costing Sheet', 'New Feature'],
          ['Fixed bug on copying and pasting in Costing Sheet', 'Bug Fix'],
          ['Changed initialization script to track subscript directories', 'Maintaniance']
        ],
        4: [
          ['Added autofill function for project title and user info', 'New Feature'],
          ['Added autofill prompts to the openening of the proposal document for the first time', 'New Feature'],
          ['Added new build system for bound scripts', 'Maintaniance'],
          ['Added new initializations script for bound scripts', 'Maintaniance']
        ],
        3: [
          ['Added Folder button to calendar sidebar', 'New Feature'],
          ['Added Proposal and Costing sheet buttons to sidebar', 'New Feature'],
          ['Made buttons only show up if their information was found', 'Bug Fix'],
          ['Changed wording on some buttons', 'UI Change'],
          ['Added buttons to proposal document to autofill title and terms', 'New Feature']
        ],
        2: [
          ['Cleaned up log statements', 'Maintaniance'],
          ['Managed Git Repo', 'Maintaniance'],
          ['Added Auto-filling for Client Names in the Outpost Project Database', 'New Feature'],
          ['Added Animation to Projects and Proposals Buttons', 'UI Change'],
          ['Cleaned Up Client Folder Structure', 'Maintaniance'],
          ['Added Cursor Pointing to buttons in the HTML stylesheet', 'UI Change'],
          ['Added Changelog to the calendar sidebar', 'UI Change'],
          ['Added Changelog to the project sidebar', 'UI Change']
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

//Colors
export namespace Colors {
  export function newColor(color: string): GoogleAppsScript.Spreadsheet.Color {
    return SpreadsheetApp.newColor().setRgbColor(color).build();
  }
  export const textColor: string = '#000000';
  export const backgroundColor: string = '#F4FAFF';
  export const hyperlinkColor: string = '#3F72A0';
  export const fontFamily: string = 'Arial';
  export const accent1: string = '#1b8acf';
  export const accent2: string = '#80bbff';
  export const accent3: string = '#9fa6b3';
  export const accent4: string = '#bdc6d4';
  export const accent5: string = '#dbe5f6';
  export const accent6: string = '#e3edff';
}  