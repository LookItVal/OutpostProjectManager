/**
 * Constants for the project
 * @module src/constants
 */

import { ChangelogDict } from './interfaces';

/**
 * The properties of the script.
 * @namespace State
 * @memberof src/constants
 */
export namespace State {

  /** 
   * The active spreadsheet.
   * @constant {GoogleAppsScript.Spreadsheet.Spreadsheet | null} spreadsheet
   * @default SpreadsheetApp.getActiveSpreadsheet()
   */
  export const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null  = SpreadsheetApp.getActiveSpreadsheet();

  /** 
   * The properties of the script accessable from within the google apps script project.
   * @constant {GoogleAppsScript.Properties.Properties} properties
   * @default PropertiesService.getScriptProperties()
   */
  export const properties = PropertiesService.getScriptProperties();

  /**
   * The changelog for the project.
   * @constant {ChangelogDict} changelog
   */
  export const changelog: ChangelogDict = {
    1: {
      2: [
        'Shiny Things Update',
        {
          7: [
            ['Fixed problem with finding the new sheet', 'Bug Fix'],
            ['Added new heartbeat to the frontend to check for version number and connection status', 'New Feature'],
            ['Connection now refreshes when the heartbeat is lost', 'New Feature'],
            ['Now checks to see if the selection has changed', 'New Feature'],
            ['Changed constants to cache value and only call when called to fix onOpen bug', 'Bug Fix'],
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

  /**
   * The version of the script derived from the last entry in the changelog.
   * @constant {string} version
   */
  export const version: string = (() => {
    const majorVersions = Object.keys(State.changelog).map(Number);
    const latestMajor = Math.max(...majorVersions);
    const minorVersions = Object.keys(State.changelog[latestMajor]).map(Number);
    const latestMinor = Math.max(...minorVersions);
    const patchVersions = State.changelog[latestMajor][latestMinor][1];
    const latestPatch = Math.max(...Object.keys(patchVersions).map(Number));
    return `${latestMajor}.${latestMinor}.${latestPatch}`;
  })();
}

/**
 * Regular expressions used in the project.
 * @namespace Regex
 * @memberof src/constants
 */
export namespace Regex {

  /**
   * The regular expression to match a job (project) name.
   * @constant {RegExp} regexJobName
   */
  export const regexJobName: RegExp = /^\d{4}\s\d{4}\s.*/;

  /**
   * The regular expression to match a proposal name.
   * @constant {RegExp} regexProposalName
   */
  export const regexProposalName: RegExp = /^PROPOSAL: \d{4}\s.*/;

  /**
   * The regular expression to match a string of 4 digits.
   * @constant {RegExp} regex4Digits
   */
  export const regex4Digits: RegExp = /^\d{4}/;

  /**
   * The regular expression to match the string 'PROPOSAL:'.
   * @constant {RegExp} regexProposalOpen
   */
  export const regexProposalOpen: RegExp = /^PROPOSAL:/;

  /**
   * The regular expression to match a string of digits. Mostly used to pull chunks of 4 digits from initiative names.
   * @constant {RegExp} regexPullDigits
   */
  export const regexPullDigits: RegExp = /\d+/g;
}

/**
 * The colors used in the outpost theme.
 * @namespace Colors
 * @memberof src/constants
 */
export namespace Colors {

  /**
   * Creates a new color object.
   * @function newColor
   * @param {string} color - The color to set the color object to in hex.
   * @returns {GoogleAppsScript.Spreadsheet.Color} The color object.
   */
  export function newColor(color: string): GoogleAppsScript.Spreadsheet.Color {
    return SpreadsheetApp.newColor().setRgbColor(color).build();
  }

  /**
   * The color of the text.
   * @constant {string} textColor
   * @default '#000000'
   */
  export const textColor: string = '#000000';

  /**
   * The color of the background.
   * @constant {string} backgroundColor
   * @default '#F4FAFF'
   */
  export const backgroundColor: string = '#F4FAFF';

  /**
   * The color of the sidebar.
   * @constant {string} sidebarColor
   * @default '#F4FAFF'
   */
  export const hyperlinkColor: string = '#3F72A0';

  /**
   * The main font for body text.
   * @constant {string} fontFamily
   * @default 'Arial'
   */
  export const fontFamily: string = 'Arial';

  /**
   * The main font for headings.
   * @constant {string} headingFontFamily
   * @default 'Century Gothic'
   */
  export const headingFontFamily: string = 'Century Gothic';

  /**
   * The 1st accent color.
   * @constant {string} accent1
   * @default '#1b8acf'
   */
  export const accent1: string = '#1b8acf';

  /**
   * The 2nd accent color.
   * @constant {string} accent2
   * @default '#80bbff'
   */
  export const accent2: string = '#80bbff';
  
  /**
   * The 3rd accent color.
   * @constant {string} accent3
   * @default '#9fa6b3'
   */
  export const accent3: string = '#9fa6b3';

  /**
   * The 4th accent color.
   * @constant {string} accent4
   * @default '#bdc6d4'
   */
  export const accent4: string = '#bdc6d4';

  /**
   * The 5th accent color.
   * @constant {string}
   * @default '#dbe5f6'
   */
  export const accent5: string = '#dbe5f6';

  /**
   * The 6th accent color.
   * @constant {string}
   * @default '#e3edff'
   */
  export const accent6: string = '#e3edff';
}  