import { Booking } from './classes/booking';
import { InitEvent } from './interfaces';
import { properties } from './constants';

// this next chunk deals with clasps inability to deal with imports properly.
// it's a bit of a hack, but it works.
// just put define everything you want to import in the export interface
// then declare a const exports of that type.
// always call imports from that exports object. it doesnt exist here,
// but it will exist in the compiled code.
interface UIExport {
  properties: typeof properties;
  Booking: typeof Booking;
}
declare const exports: UIExport;

/////////////////////////////////////////////
//                Calendar                 //
/////////////////////////////////////////////

export function calendarHomepageUI(): GoogleAppsScript.Card_Service.Card {
  return CardService.newCardBuilder()
    .setName('Card name')
    .setHeader(CardService.newCardHeader().setTitle('Outpost Project Manager'))
    .addSection(CardService.newCardSection()
      .setHeader('No Event Selected.')
      .addWidget(CardService.newTextParagraph()
        .setText('Select an event to find its reconciliation sheet.')))
    .build();
}

export function selectEventUI(e: InitEvent): GoogleAppsScript.Card_Service.Card {
  try {
    const booking = new exports.Booking({event: e}) as Booking;
    console.log('the booking object', booking.sheetId);
    return CardService.newCardBuilder()
      .setName('Select Event')
      .setHeader(CardService.newCardHeader().setTitle('Project Details'))
      .addSection(CardService.newCardSection()
        .setHeader(booking.calendarEvent?.getTitle() ?? 'Booking Error')
        .addWidget(CardService.newTextButton()
          .setText('Open Reconciliation')
          .setOpenLink(CardService.newOpenLink()
            .setUrl(`https://docs.google.com/spreadsheets/d/${booking.sheetId}/edit#gid=0`))))
      .build();
  } catch (e: unknown) {
    console.error(e);
    return calendarHomepageUI();
  }
}

/////////////////////////////////////////////
//                 Sheets                  //
/////////////////////////////////////////////

export function openSheetSidebar(): GoogleAppsScript.Card_Service.Card | void {
  const currentSheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  console.log(currentSheetId, exports.properties.getProperty('projectDataSpreadsheetId'));
  if (currentSheetId === exports.properties.getProperty('projectDataSpreadsheetId')) return openOPDSidebar();
  return getSheetsHomepage();
}

export function getSheetsHomepage(): GoogleAppsScript.Card_Service.Card {
  return CardService.newCardBuilder()
    .setName('Card name')
    .setHeader(CardService.newCardHeader().setTitle('Outpost Project Manager'))
    .addSection(CardService.newCardSection()
      .setHeader('Incompatable Sheet')
      .addWidget(CardService.newTextParagraph()
        .setText('This sheet does not have any special functionality associated with it.')))
    .build();
}

export function openOPDSidebar(): void {
  const ui = HtmlService.createTemplateFromFile('src/opd/html/sidebar')
    .evaluate()
    .setTitle('Outpost Project Manager')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(ui);
}
