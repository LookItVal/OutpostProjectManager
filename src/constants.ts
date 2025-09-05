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
export const version = '1.4.1';
export const changelog = {
  1: {
    4: [
      'Fluid Nomenclature',
      {
        1: [
          ['Ensure "Open Calendar" buttons work from inside the Unreconciled Bookings Modal', 'Bug Fix']
        ],
        0: [
          ['Added Rename button inside OPD', 'UI Change'],
          ['Rename button open modal dialogue that requests the change. It will rename all documents associated with the project', 'New Feature'],
          ['Renaming the client moves projects into the new client folder. If the client is new it makes a new folder. If there is nothing remaning in the old client folder after the move, the old client is removed.', 'New Feature']
        ]
      }
    ],
    3: [
      'Project Reconciliation',
      {
        4: [
          ['Added system for Deleting every unreconciled calendar event when closing a project.', 'New Feature'],
          ['Added system for Reconciling every unreconciled calendar event when closing a project.', 'New Feature']
        ],
        3: [
          ['Added Button only visable to administrators to check the status of unreconciled bookings.', 'New Feature'],
          ['Close Project button now checks for unreconciled bookings before closing.', 'New Feature'],
          ['Can now delete unreconciled bookings from the OPD if admin.', 'New Feature'],
        ],
        2: [
          ['Calendar sidebar now searches for unreconciled bookings when no project is selected', 'New Feature'],
          ['Calendar sidebar now returns events to their original position when the changed are cancled', 'New Feature'],
          ['The Reconciliation data is not lost when updating reconciliations to new days', 'Bug Fix'],
          ['The Reconciliation Details sections of the calendar sidebar now shows 🟡 when the time does not match', 'Bug Fix']
        ],
        1: [
          ['Ensure calendar bookings can find the reconciliation sheet with leading and trailing whitespace', 'Bug Fix']
        ],
        0: [
          ['Added link between calendar bookings and project reconciliations', 'New Feature'],
          ['Added Means of viewing and editing project reconciliations from the calendar', 'New Feature'],
          ['Added heartbeat to the sheets sidebar to prevent it from closing', 'Bug Fix'],
          ['Outpost Project Database now occasionally auto-refreshes the sidebar in the background', 'New Feature']
        ]
      }
    ],
    2: [
      'Shiny Things Update',
      {
        7: [
          ['Added new button to close project that is only visible to administrators', 'New Feature'],
          ['Added new button to make a more basic proposal', 'New Feature']
        ],
        6: [
          ['Made new logo to make app more visable on white backgrounds', 'UI Change'],
          ['Made new style guide for sheets', 'New Feature'],
          ['Added Injection of style guide to sheets', 'New Feature'],
          ['Added button to open the OPD from the calendar', 'New Feature'],
          ['Added button make new job costing from the project stage', 'New Feature']
        ],
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
  export const headingFontFamily: string = 'Century Gothic';
  export const accent1: string = '#1b8acf';
  export const accent2: string = '#80bbff';
  export const accent3: string = '#9fa6b3';
  export const accent4: string = '#bdc6d4';
  export const accent5: string = '#dbe5f6';
  export const accent6: string = '#e3edff';
}  