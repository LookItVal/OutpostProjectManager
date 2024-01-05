import { Booking } from './classes/booking';
import { InitEvent } from './interfaces';
import { properties } from './constants';

/////////////////////////////////////////////
//                Calendar                 //
/////////////////////////////////////////////

export function calendarHomepageUi(): GoogleAppsScript.Card_Service.Card {
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
        const booking = new Booking({event: e}) as Booking;
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
    } catch {
        return calendarHomepageUi();
    }
}

/////////////////////////////////////////////
//                 Sheets                  //
/////////////////////////////////////////////

export function openSheetsSidebar(): GoogleAppsScript.Card_Service.Card | void {
    const currentSheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    if (currentSheetId === properties.getProperty('sidebarSheetId')) return openOPDSidebar();
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
    const ui = HtmlService.createTemplateFromFile('opd/sidebar')
        .evaluate()
        .setTitle('Outpost Project Manager')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    SpreadsheetApp.getUi().showSidebar(ui);
}
