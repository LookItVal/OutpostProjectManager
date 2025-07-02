import { Booking } from './classes/booking';
import { Reconciliation } from './classes/reconciliation';
import { User } from './classes/user';
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
  Reconciliation: typeof Reconciliation;
  User: typeof User;
  version: typeof version;
}
declare const exports: UIExport;

/////////////////////////////////////////////
//                Calendar                 //
/////////////////////////////////////////////

export function calendarHomepageUI(): GoogleAppsScript.Card_Service.Card {
  const unreconciledEvents = exports.User.getUnreconciledEvents(exports.Booking.getReconciliationPeriod());
  if (unreconciledEvents.length > 1) {
    const cardSection = CardService.newCardSection()
      .setHeader('Unreconciled Events');

    unreconciledEvents.forEach(event => {
      const booking = new exports.Booking({ eventId: event.getId(), calendarId: User.calendar.getId() }) as Booking;
      cardSection.addWidget(
        CardService.newTextParagraph()
          .setText(`<b><i>${booking.date.toLocaleDateString('en-US')}</i></b><br><b>${event.getTitle()}</b>`)
      );
      cardSection.addWidget(
        CardService.newTextButton()
          .setText('Open in New Tab')
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setOpenLink(CardService.newOpenLink()
            .setUrl(booking.calendarEventLink)
            .setOpenAs(CardService.OpenAs.FULL_SIZE)
            .setOnClose(CardService.OnClose.NOTHING))
      );
      cardSection.addWidget(CardService.newDivider());
    });
    return CardService.newCardBuilder()
      .setName('Card name')
      .setHeader(CardService.newCardHeader().setTitle('Outpost Project Manager'))
      .addSection(cardSection)
      .setFixedFooter(mainFooter())
      .build();
  } else {
    return CardService.newCardBuilder()
      .setName('Card name')
      .setHeader(CardService.newCardHeader().setTitle('Outpost Project Manager'))
      .addSection(CardService.newCardSection()
        .setHeader('All Events Reconciled')
        .addWidget(CardService.newTextParagraph()
          .setText('Select an event to find its associated files and reconciliation.')))
      .setFixedFooter(mainFooter())
      .build();
  }
}

export function selectEventUI(e: InitEvent): GoogleAppsScript.Card_Service.Card {
  try {
    const booking = new exports.Booking({event: e}) as Booking;

    const sidebar = CardService.newCardBuilder()
      .setName('Select Event')
      .setHeader(CardService.newCardHeader().setTitle('Project Details'));

    const filesSection = CardService.newCardSection();
    filesSection.addWidget(CardService.newTextParagraph()
      .setText(booking.project?.title ?? 'Booking Error'));
    if (booking.project?.folder) {
      filesSection.addWidget(CardService.newTextButton()
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setText('     🖿 Open Folder 🖿     ')
        .setOpenLink(CardService.newOpenLink()
          .setUrl(`https://drive.google.com/drive/folders/${booking.project?.folder?.getId()}`)));
    }
    if (booking.sheetId) {
      filesSection.addWidget(CardService.newTextButton()
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor('#3d9400')
        .setText('✓ Open Reconciliation ✓')
        .setOpenLink(CardService.newOpenLink()
          .setUrl(`https://docs.google.com/spreadsheets/d/${booking.sheetId}/edit#gid=0`)));
    }
    if (booking.project?.costingSheetId) {
      filesSection.addWidget(CardService.newTextButton()
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setText('$ Open Costing Sheet $')
        .setOpenLink(CardService.newOpenLink()
          .setUrl(`https://docs.google.com/spreadsheets/d/${booking.project?.costingSheetId}/edit#gid=0`)));
    }
    if (booking.project?.proposalDocumentId) {
      filesSection.addWidget(CardService.newTextButton()
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setText('🗋 Open Proposal 🗋')
        .setOpenLink(CardService.newOpenLink()
          .setUrl(`https://docs.google.com/document/d/${booking.project?.proposalDocumentId}/edit`)));
    }
    // if none found then add a message
    if (!booking.project?.folder && !booking.sheetId && !booking.project?.costingSheetId && !booking.project?.proposalDocumentId) {
      filesSection.addWidget(CardService.newTextParagraph()
        .setText('\n - No associated files found.'));
    }
    sidebar.addSection(filesSection);

    try {
      if (booking.project?.reconciliationSheet) {
        const sheetRows = exports.Reconciliation.findRow(booking);
        //const reconciliation = new exports.Reconciliation({event: e, row: sheetRow}) as Reconciliation;

        let reconciliationSection = CardService.newCardSection()
          .setHeader('Reconciliation Details');
        if (sheetRows.length === 0) {
          reconciliationSection = CardService.newCardSection()
            .setHeader('Reconciliation Details 🔴');
        }
        if (sheetRows.length > 1) {
          reconciliationSection = CardService.newCardSection()
            .setHeader('Reconciliation Details 🟡');
          reconciliationSection.addWidget(
            CardService.newTextParagraph()
              .setText(`Found ${sheetRows.length} reconciliation rows for this event. Select one to link it to the booking.\n\n`)
          );
          sheetRows.forEach((row) => {
            const reconciliation = new exports.Reconciliation({event: e, row: row}) as Reconciliation;

            const selectButton = CardService.newTextButton()
              .setText(`Select Row ${row}`)
              .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName('setReconciliationRow')
                  .setParameters({ row: JSON.stringify(row) })
              );
            const openButton = CardService.newTextButton()
              .setText('Open')
              .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
              .setBackgroundColor('#3d9400')
              .setOpenLink(CardService.newOpenLink()
                .setUrl(`https://docs.google.com/spreadsheets/d/${booking.sheetId}/edit#gid=0&range=A${row}:H${row}`));
            // Add a title with the name of the row
            reconciliationSection.addWidget(
              CardService.newTextParagraph()
                .setText(`<b>Row ${row}</b>`)
            );
            reconciliationSection.addWidget(
              CardService.newButtonSet()
                .addButton(selectButton)
                .addButton(openButton)
            );        reconciliationSection.addWidget(
              CardService.newTextParagraph()
                .setText(`<b>Date:</b> ${reconciliation.date?.toLocaleDateString('en-GB')}
                          <b>Hours:</b> ${reconciliation.hours}
                          <b>Work Performed:</b> ${reconciliation.workPerformed}
                          <b>Description:</b> ${reconciliation.description}
                          <b>Billing Additions:</b> ${reconciliation.billingAdditions}
                          <b>Spot Numbers:</b> ${reconciliation.spotNumbers}
                          <b>Project Status:</b> ${reconciliation.status}`)
            );
            reconciliationSection.addWidget(
              CardService.newDivider()
            );
            reconciliationSection.addWidget(
              CardService.newTextParagraph()
                .setText('\n')
            );
          });
        } 
        let currentWorkPerformed = '';
        let currentDescription = '';
        let currentBillingAdditions = '';
        let currentSpotNumbers = '';
        let currentStatus = '';
        let row: number = 0;
        if (sheetRows.length == 1) {
          row = sheetRows[0];
          const reconciliation = new exports.Reconciliation({event: e, row: row}) as Reconciliation;
          if (!reconciliation.date) {
            reconciliationSection = CardService.newCardSection()
              .setHeader('Reconciliation Details 🔴');
          } else if (reconciliation.date.getMonth() !== booking.date.getMonth() ||
                    reconciliation.date.getDate() !== booking.date.getDate()) {
            reconciliationSection = CardService.newCardSection()
              .setHeader('Reconciliation Details 🟡');
          } else if (reconciliation.date.getMonth() === booking.date.getMonth() &&
                    reconciliation.date.getDate() === booking.date.getDate()) {
            reconciliationSection = CardService.newCardSection()
              .setHeader('Reconciliation Details 🟢');
          }
          currentWorkPerformed = reconciliation.workPerformed;
          currentDescription = reconciliation.description;
          currentBillingAdditions = reconciliation.billingAdditions;
          currentSpotNumbers = reconciliation.spotNumbers;
          currentStatus = reconciliation.status;
        } 
        if (sheetRows.length <= 1) {
          const sheet = SpreadsheetApp.openById(booking.sheetId).getSheets()[0];
          const workPerformedCell = sheet.getRange('D3');
          const workPerformedRule = workPerformedCell.getDataValidation();
          let dropdownItems: string[] = [];
          if (workPerformedRule && workPerformedRule.getCriteriaType() === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
            const args = workPerformedRule.getCriteriaValues();
            if (args && args[0] && Array.isArray(args[0])) {
              dropdownItems = args[0] as string[];
            }
          }
          const workPerformedDropdown = CardService.newSelectionInput()
            .setType(CardService.SelectionInputType.DROPDOWN)
            .setTitle('Work Performed')
            .setFieldName('workPerformed');
          dropdownItems.forEach(item => {
            workPerformedDropdown.addItem(item, item, currentWorkPerformed === item);
          });

          const descriptionInput = CardService.newTextInput()
            .setFieldName('description')
            .setTitle('Description')
            .setValue(currentDescription || '');

          const billingAdditionsInput = CardService.newTextInput()
            .setFieldName('billingAdditions')
            .setTitle('Billing Additions')
            .setValue(currentBillingAdditions || '');

          const spotNumbersInput = CardService.newTextInput()
            .setFieldName('spotNumbers')
            .setTitle('Spot Numbers')
            .setValue(currentSpotNumbers || '');


          const statusCell = sheet.getRange('H3');
          const statusRule = statusCell.getDataValidation();
          dropdownItems = [];
          if (statusRule && statusRule.getCriteriaType() === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
            const args = statusRule.getCriteriaValues();
            if (args && args[0] && Array.isArray(args[0])) {
              dropdownItems = args[0] as string[];
            }
          }
          const statusDropdown = CardService.newSelectionInput()
            .setType(CardService.SelectionInputType.DROPDOWN)
            .setTitle('Project Status')
            .setFieldName('status');
          dropdownItems.forEach(item => {
            statusDropdown.addItem(item, item, currentStatus === item);
          });

          const comfirmButton = CardService.newTextButton()
            .setText('Confirm Changes')
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor('#3d9400')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('fillReconciliationRow')
                .setParameters({ row: JSON.stringify(row) })
            );
          
          const cancleButton = CardService.newTextButton()
            .setText('Cancel')
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor('#d93025') 
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('selectEventUI')
            );

          
          reconciliationSection.addWidget(
            CardService.newTextParagraph()
              .setText('')
          );
          reconciliationSection.addWidget(workPerformedDropdown);
          reconciliationSection.addWidget(descriptionInput);
          reconciliationSection.addWidget(billingAdditionsInput);
          reconciliationSection.addWidget(spotNumbersInput);
          reconciliationSection.addWidget(statusDropdown);
          reconciliationSection.addWidget(
            CardService.newTextParagraph()
              .setText('')
          );
          reconciliationSection.addWidget(
            CardService.newButtonSet()
              .addButton(comfirmButton)
              .addButton(cancleButton)
          );
        }
        sidebar.addSection(reconciliationSection);
      }
    } catch (error: unknown) {
      console.error('Error finding reconciliation rows:', error);
    }
    sidebar.setFixedFooter(mainFooter());
    return sidebar.build();
  } catch (e: unknown) {
    console.error(e);
    return calendarHomepageUI();
  }
}

export function setReconciliationRow(e: InitEvent & { parameters: { row: string } }): GoogleAppsScript.Card_Service.ActionResponse {
  try {
    const row = JSON.parse(e.parameters.row);
    const reconciliation = new exports.Reconciliation({event: e, row: row}) as Reconciliation;
    reconciliation.linkBooking();

    const updatedCard = selectEventUI(e);
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(updatedCard))
      .setNotification(CardService.newNotification()
        .setText(`Successfully linked reconciliation row ${row}`))
      .build();
  } catch (error: unknown) {
    console.error('Error in setReconciliationRow:', error);
    
    // Return an error notification
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText(`Error linking reconciliation: ${error instanceof Error ? error.message : 'Unknown error'}`))
      .build();
  }
}

export function fillReconciliationRow(e: InitEvent & { parameters: { row?: string, overwriteDate?: 'true' | 'false' }, formInputs: { [key: string]: string } }): GoogleAppsScript.Card_Service.ActionResponse {
  try {
    let row: number;
    const booking = new exports.Booking({ event: e }) as Booking;
    const sheet = SpreadsheetApp.openById(booking.sheetId).getSheets()[0];
    if (e.parameters.row && e.parameters.row !== '0') {
      row = JSON.parse(e.parameters.row);
    } else {

      row = sheet.getLastRow() + 1;
    }
    const reconciliation = new exports.Reconciliation({event: e, row: row}) as Reconciliation;

    if (reconciliation.date) {
      if (!(reconciliation.date.getMonth() == booking.date.getMonth() &&
            reconciliation.date.getDate() == booking.date.getDate())) {
        if (e.parameters.overwriteDate && e.parameters.overwriteDate === 'true') {
          reconciliation.date = booking.date;
        }
        if (!e.parameters.overwriteDate) {
          return CardService.newActionResponseBuilder()
            .setNotification(CardService.newNotification()
              .setText(`The date of the booking (${booking.date.toLocaleDateString('en-GB')}) does not match the date of the reconciliation row (${reconciliation.date.toLocaleDateString('en-GB')}).\n\n` +
                'Would you like to overwrite the date in the reconciliation row?'))
            .setNavigation(CardService.newNavigation()
              .pushCard(CardService.newCardBuilder()
                .setName('Confirm Date Overwrite')
                .setHeader(CardService.newCardHeader().setTitle('Confirm Date Overwrite'))
                .addSection(CardService.newCardSection()
                  .addWidget(CardService.newTextParagraph()
                    .setText(`The date of the booking (${booking.date.toLocaleDateString('en-GB')}) does not match the date of the reconciliation row (${reconciliation.date.toLocaleDateString('en-GB')}).\n\n` +
                      'Would you like to overwrite the date in the reconciliation row?'))
                  .addWidget(CardService.newTextParagraph()
                    .setText(`<b>Original Reconciliation</b>
                              <b>Date:</b> ${reconciliation.date.toLocaleDateString('en-GB')}
                              <b>Hours:</b> ${reconciliation.duration}
                              <b>Technician:</b> ${reconciliation.technician}
                              <b>Work Performed:</b> ${reconciliation.workPerformed}
                              <b>Description:</b> ${reconciliation.description}
                              <b>Billing Additions:</b> ${reconciliation.billingAdditions}
                              <b>Spot Numbers:</b> ${reconciliation.spotNumbers}
                              <b>Status:</b> ${reconciliation.status}
                              
                              <b>New Reconciliation</b>
                              <b>Date:</b> ${booking.date.toLocaleDateString('en-GB')}
                              <b>Hours:</b> ${booking.duration}
                              <b>Technician:</b> ${booking.technician}
                              <b>Work Performed:</b> ${e.formInputs.workPerformed ? e.formInputs.workPerformed[0] : ''}
                              <b>Description:</b> ${e.formInputs.description ? e.formInputs.description[0] : ''}
                              <b>Billing Additions:</b> ${e.formInputs.billingAdditions ? e.formInputs.billingAdditions[0] : ''}
                              <b>Spot Numbers:</b> ${e.formInputs.spotNumbers ? e.formInputs.spotNumbers[0] : ''}
                              <b>Status:</b> ${e.formInputs.status ? e.formInputs.status[0] : ''}`)))
                .addSection(CardService.newCardSection()
                  .addWidget(CardService.newTextButton()
                    .setText('Yes, overwrite date')
                    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
                    .setBackgroundColor('#3d9400')
                    .setOnClickAction(
                      CardService.newAction()
                        .setFunctionName('fillReconciliationRow')
                        .setParameters({ row: JSON.stringify(row), overwriteDate: 'true' })
                    ))
                  .addWidget(CardService.newTextButton()
                    .setText('No, keep existing date')
                    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
                    .setBackgroundColor('#d93025')
                    .setOnClickAction(
                      CardService.newAction()
                        .setFunctionName('selectEventUI')
                    ))).build()))
            .build();
        }
      }
    } else {
      reconciliation.date = booking.date;
    }
    reconciliation.hours = booking.duration;
    reconciliation.technician = booking.technician;
    reconciliation.workPerformed = (e.formInputs.workPerformed ?? [''])[0];
    reconciliation.description = (e.formInputs.description ?? [''])[0];
    reconciliation.billingAdditions = (e.formInputs.billingAdditions ?? [''])[0];
    reconciliation.spotNumbers = (e.formInputs.spotNumbers ?? [''])[0];
    reconciliation.status = (e.formInputs.status ?? [''])[0];

    const updatedCard = selectEventUI(e);
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(updatedCard))
      .setNotification(CardService.newNotification()
        .setText(`Successfully filled reconciliation row ${row}`))
      .build();
  } catch (error: unknown) {
    console.error('Error in fillReconciliationRow:', error);
    
    // Return an error notification
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText(`Error filling reconciliation: ${error instanceof Error ? error.message : 'Unknown error'}`))
      .build();
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
  const ui = HtmlService.createTemplateFromFile('src/opd/html/sidebar')
    .evaluate()
    .setTitle('Outpost Project Manager')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(ui);
}

/////////////////////////////////////////////
//                  Misc                   //
/////////////////////////////////////////////

export function mainFooter(): GoogleAppsScript.Card_Service.FixedFooter {
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