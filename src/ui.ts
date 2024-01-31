import { Booking } from './classes/booking';
import { InitEvent } from './interfaces';
import { properties, version} from './constants';
import { User } from './classes/user';

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
    .setFixedFooter(mainFooter())
    .build();
}

export function selectEventUI(e: InitEvent): GoogleAppsScript.Card_Service.Card {
  try {
    const booking = new exports.Booking({event: e}) as Booking;
    return CardService.newCardBuilder()
      .setName('Select Event')
      .setHeader(CardService.newCardHeader().setTitle('Project Details'))
      .addSection(CardService.newCardSection()
        .setHeader(booking.calendarEvent?.getTitle() ?? 'Booking Error')
        .addWidget(CardService.newTextButton()
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor('#3d9400')
          .setText('✓ Open Reconciliation ✓')
          .setOpenLink(CardService.newOpenLink()
            .setUrl(`https://docs.google.com/spreadsheets/d/${booking.sheetId}/edit#gid=0`))))
      .setFixedFooter(mainFooter())
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
  const output = HtmlService.createTemplateFromFile('src/html/baseStyle').evaluate();
  output.append(HtmlService.createHtmlOutputFromFile('src/opd/html/sidebar').getContent());
  if (User.isAdmin) output.append(HtmlService.createHtmlOutputFromFile('src/opd/html/adminSidebar').getContent());
  output.append('<div class="sidebar bottom width-100">');
  output.append(HtmlService.createHtmlOutputFromFile('src/opd/html/sidebarBottom').getContent());
  if (User.isDeveloper) output.append(HtmlService.createHtmlOutputFromFile('src/opd/html/devSidebar').getContent());
  output.append(HtmlService.createHtmlOutputFromFile('src/html/footer').getContent());
  output.append('</div>');
  output.append(HtmlService.createHtmlOutputFromFile('src/opd/html/sidebarjs').getContent());
  output.append('</body></html>');
  output
    .setTitle('Outpost Project Manager')
    .setWidth(1000)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(output);
}

/////////////////////////////////////////////
//                  Misc                   //
/////////////////////////////////////////////

export function mainFooter(): GoogleAppsScript.Card_Service.FixedFooter {
  return CardService.newFixedFooter()
    .setPrimaryButton(CardService.newTextButton()
      .setText(`${exports.version} Changelog`)
      .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
      .setOnClickAction(CardService.newAction()
        .setFunctionName('openCardChangelog')));
}