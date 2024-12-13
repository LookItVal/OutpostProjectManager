/**
 * UI functions for the Outpost Project Manager.
 * @module src/ui
 */

import { Booking } from './classes/booking';
import { InitEvent } from './interfaces';
import { properties, version} from './constants';
import { Initiative } from './classes/initiatives';

// this next chunk deals with clasps inability to deal with imports properly.
// it's a bit of a hack, but it works.
// just put define everything you want to import in the export interface
// then declare a const exports of that type.
// always call imports from that exports object. it doesnt exist here,
// but it will exist in the compiled code.
interface UIExport {
  properties: typeof properties;
  Booking: typeof Booking;
  version: typeof version;
}
declare const exports: UIExport;

/**
 * UI functions for the Calendar.
 * @namespace CalendarUI
 * @memberof src/ui
 * @exports homepageUI - The homepage UI for the Calendar.
 * @exports selectEventUI - The UI for selecting an event.
 */
export namespace CalendarUI {
  /**
   * The homepage UI for the Calendar.
   * @function homepageUI
   * @returns {GoogleAppsScript.Card_Service.Card} The Card object for the homepage.
   */
  export function homepageUI(): GoogleAppsScript.Card_Service.Card {
    return CardService.newCardBuilder()
      .setName('Card name')
      .setHeader(CardService.newCardHeader().setTitle('Outpost Project Manager'))
      .addSection(CardService.newCardSection()
        .setHeader('No Event Selected.')
        .addWidget(CardService.newTextParagraph()
          .setText('Select an event to find its reconciliation sheet.')))
      .setFixedFooter(mainFooter())
      .build();
  }

  /**
   * The UI for selecting an event.
   * @function selectEventUI
   * @param {InitEvent} e - The event to select, usually passed through the event objects as `e`.
   * @returns {GoogleAppsScript.Card_Service.Card} The Card object for the event selection.
   */
  export function selectEventUI(e: InitEvent): GoogleAppsScript.Card_Service.Card {
    try {
      const booking = new exports.Booking({event: e}) as Booking;
      const sidebar = CardService.newCardBuilder()
        .setName('Select Event')
        .setHeader(CardService.newCardHeader().setTitle('Project Details'));
      const section = CardService.newCardSection();
      section.addWidget(CardService.newTextParagraph()
        .setText(booking.project?.title ?? 'Booking Error'));
      if (booking.project?.folder) {
        section.addWidget(CardService.newTextButton()
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setText('     🖿 Open Folder 🖿     ')
          .setOpenLink(CardService.newOpenLink()
            .setUrl(`https://drive.google.com/drive/folders/${booking.project?.folder?.getId()}`)));
      }
      if (booking.sheetId) {
        section.addWidget(CardService.newTextButton()
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor('#3d9400')
          .setText('✓ Open Reconciliation ✓')
          .setOpenLink(CardService.newOpenLink()
            .setUrl(`https://docs.google.com/spreadsheets/d/${booking.sheetId}/edit#gid=0`)));
      }
      if (booking.project?.costingSheetId) {
        section.addWidget(CardService.newTextButton()
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setText('$ Open Costing Sheet $')
          .setOpenLink(CardService.newOpenLink()
            .setUrl(`https://docs.google.com/spreadsheets/d/${booking.project?.costingSheetId}/edit#gid=0`)));
      }
      if (booking.project?.proposalDocumentId) {
        section.addWidget(CardService.newTextButton()
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setText('🗋 Open Proposal 🗋')
          .setOpenLink(CardService.newOpenLink()
            .setUrl(`https://docs.google.com/document/d/${booking.project?.proposalDocumentId}/edit`)));
      }
      // if none found then add a message
      if (!booking.project?.folder && !booking.sheetId && !booking.project?.costingSheetId && !booking.project?.proposalDocumentId) {
        section.addWidget(CardService.newTextParagraph()
          .setText('\n - No associated files found.'));
      }
      sidebar.addSection(section)
        .setFixedFooter(mainFooter());
      return sidebar.build();
    } catch (e: unknown) {
      console.error(e);
      return homepageUI();
    }
  }
}

/**
 * UI functions for Google Sheets.
 * @namespace SheetsUI
 * @memberof src/ui
 * @exports openSheetSidebar - Opens the sidebar for the current sheet.
 * @exports getSheetsHomepage - The homepage UI for the current sheet.
 * @exports openOPDSidebar - Opens the sidebar for the Outpost Project Database.
 */
export namespace SheetsUI {
  /**
   * Opens the sidebar for the current sheet.
   * @function openSidebar
   * @returns {GoogleAppsScript.Card_Service.Card | void} The Card object for the sidebar, or `void` if the current sheet is the project data sheet.
   */
  export function openSidebar(): GoogleAppsScript.Card_Service.Card | void {
    const currentSheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    if (currentSheetId === properties.getProperty('projectDataSpreadsheetId')) return openOPDSidebar();
    return getHomepage();
  }

  /**
   * The homepage UI for the sheets side of the OPM. This gets delivered when there is no custom sidebar built for the current sheet.
   * @function getHomepage
   * @returns {GoogleAppsScript.Card_Service.Card} The blank Card object for the homepage.
   */
  export function getHomepage(): GoogleAppsScript.Card_Service.Card {
    return CardService.newCardBuilder()
      .setName('Card name')
      .setHeader(CardService.newCardHeader().setTitle('Outpost Project Manager'))
      .addSection(CardService.newCardSection()
        .setHeader('Incompatable Sheet')
        .addWidget(CardService.newTextParagraph()
          .setText('This sheet does not have any special functionality associated with it.')))
      .build();
  }

  /**
   * Opens the sidebar for the Outpost Project Database. Pulls in the sidebar from the `src/opd/html/sidebar.html` file.
   * @function openOPDSidebar
   * @see src/opd/html/sidebar.html
   */
  export function openOPDSidebar(): void {
    const ui = HtmlService.createTemplateFromFile('src/opd/html/sidebar')
      .evaluate()
      .setTitle('Outpost Project Manager')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    SpreadsheetApp.getUi().showSidebar(ui);
  }
}

/////////////////////////////////////////////
//                  Misc                   //
/////////////////////////////////////////////
/**
 * Footer for the main cards. Contains a button to open the changelog and a button to open the database.
 * @returns {GoogleAppsScript.Card_Service.FixedFooter} The footer for the main cards.
 * @private
 */
function mainFooter(): GoogleAppsScript.Card_Service.FixedFooter {
  const databaseButton = CardService.newTextButton()
    .setText('Open Database')
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setBackgroundColor('#3d9400')
    .setOpenLink(CardService.newOpenLink()
      .setUrl(`https://docs.google.com/spreadsheets/d/${Initiative.dataSpreadsheetId}/edit#gid=0`));
  const changelogButton = CardService.newTextButton()
    .setText(`${exports.version} Changes`)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(CardService.newAction()
      .setFunctionName('openCardChangelog'));
  return CardService.newFixedFooter()
    .setPrimaryButton(changelogButton)
    .setSecondaryButton(databaseButton);
}