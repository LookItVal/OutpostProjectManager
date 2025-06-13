import { Autofill } from './autofill';
import { DocEvent } from '../src/interfaces';

export function onOpen(e: DocEvent): void {
  const ui = DocumentApp.getUi();
  ui.createMenu('Outpost Project Manager')
    .addItem('Set Header Title', 'Autofill.setHeaderTitle')
    .addSubMenu(ui.createMenu('Set Terms')
      .addItem('100% Upfront', 'Autofill.setTerms100')
      .addItem('50/50%', 'Autofill.setTerms50')
      .addItem('35/35/30%', 'Autofill.setTerms35'))
    .addSeparator()
    .addItem('Name Range', 'NamedRange.nameRange')
    .addItem('List Named Ranges', 'NamedRange.listNamedRanges')
    .addItem('Remove Named Range', 'NamedRange.removeNamedRange')
    .addItem('Named Range Details', 'NamedRange.namedRangeDetails')
    .addItem('Named Date Range Details', 'NamedRange.namedDateRangeDetails')
    .addToUi();

  if (e.source.getName() === 'Proposal Template') {
    return;
  }
  Autofill.onOpen(e);
  if (e.source.getNamedRanges('terms')[0].getRange().getRangeElements()[0].getElement().asText().getForegroundColor() !== '#ff0000') {
    return;
  }
  let result = ui.alert('Terms 50/50%', 'Would you like to autofill the terms based on the following:\nDates are firm with 50% payment due at the time of booking, 50% due at the time of final delivery.', ui.ButtonSet.YES_NO);
  if (result === ui.Button.YES) {
    Autofill.setTerms50(e);
    return;
  }
  result = ui.alert('Terms 100% Upfront', 'Would you like to autofill the terms based on the following:\nDates are firm with 100% payment due at the time of booking.', ui.ButtonSet.YES_NO);
  if (result === ui.Button.YES) {
    Autofill.setTerms100(e);
    return;
  }
  result = ui.alert('Terms 35/35/30%', 'Would you like to autofill the terms based on the following:\nDates are firm with 35% payment due at the time of booking, 35% due at the midpoint of the project, and 50% due at the time of final delivery.', ui.ButtonSet.YES_NO);
  if (result === ui.Button.YES) {
    Autofill.setTerms35(e);
  }
}