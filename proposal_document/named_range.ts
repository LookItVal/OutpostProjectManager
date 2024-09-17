// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace NamedRange {
  export function nameRange(): void {
    const doc = DocumentApp.getActiveDocument();
    const selection = doc.getSelection();
    if (selection) {
      const ui = DocumentApp.getUi();
      const response = ui.prompt('Name this range', 'Enter a name for this range', ui.ButtonSet.OK_CANCEL);
      if (response.getSelectedButton() !== ui.Button.OK) {
        return;
      }
      doc.addNamedRange(response.getResponseText(), selection);
    }
  }

  export function listNamedRanges(): void {
    const doc = DocumentApp.getActiveDocument();
    const namedRanges = doc.getNamedRanges();
    const ui = DocumentApp.getUi();
    let message = '';
    for (const range of namedRanges) {
      message += `${range.getName()} - ${range.getId()}\n`;
    }
    ui.alert('Named Ranges', message, ui.ButtonSet.OK);
  }

  export function removeNamedRange(): void {
    const doc = DocumentApp.getActiveDocument();
    const ui = DocumentApp.getUi();
    const namedRanges = doc.getNamedRanges();
    const rangeNames = namedRanges.map(range => ` ${range.getName()}`);
    const response = ui.prompt('Remove Named Range', `Enter the name of the range to remove from the list:\n${rangeNames}`, ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() !== ui.Button.OK) {
      return;
    }
    if (!rangeNames.includes(response.getResponseText())) {
      ui.alert('Error', 'The named range does not exist.', ui.ButtonSet.OK);
      return;
    }
    const range = doc.getNamedRanges(response.getResponseText())[0];
    range.remove();
  }

  export function namedRangeDetails(): void {
    const doc = DocumentApp.getActiveDocument();
    const ui = DocumentApp.getUi();
    const namedRanges = doc.getNamedRanges();
    const rangeNames = namedRanges.map(range => ` ${range.getName()}`);
    const response = ui.prompt('Named Range Details', `Enter the name of the range to get details for:\n${rangeNames}`, ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() !== ui.Button.OK) {
      return;
    }
    if (!rangeNames.includes(` ${response.getResponseText()}`)) {
      ui.alert('Error', 'The named range does not exist.', ui.ButtonSet.OK);
      return;
    }
    const range = doc.getNamedRanges(response.getResponseText())[0];
    const rangeId = range.getId();
    const rangeElement = range.getRange();
    const rangeText = rangeElement.getRangeElements().map(element => element.getElement().asText().getText()).join('');
    const message = `ID: ${rangeId}\nText: ${rangeText}`;
    ui.alert('Named Range Details', message, ui.ButtonSet.OK);
  }
} 