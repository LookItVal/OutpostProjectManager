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
} 