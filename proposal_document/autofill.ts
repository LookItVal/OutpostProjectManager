// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Autofill {
  export function onOpen(e: GoogleAppsScript.Events.DocsOnOpen): void {
    console.log(e);
    const doc = e.source as GoogleAppsScript.Document.Document;
    if (doc.getNamedRanges('projectNameHeader').length !== 0) {
      initializeDocument(e);
    }
  }

  export function initializeDocument(e: GoogleAppsScript.Events.DocsOnOpen): void {
    setHeaderTitle(e);
  }

  export function setHeaderTitle(e?: GoogleAppsScript.Events.DocsOnOpen): void {
    const doc = e?.source ?? DocumentApp.getActiveDocument();
    const header = doc.getNamedRanges('projectNameHeader')[0]?.getRange();
    const name = doc.getName();
    if (name === 'Proposal Template') {
      //return;
    }
    header.getRangeElements()[0].getElement().asText().setText(name);
    header.getRangeElements()[0].getElement().asText().setForegroundColor('#000000');
    doc.getNamedRanges('projectNameHeader')[0].remove();
  }

  export function setTerms(newTerms: string): void {
    const termsRange = DocumentApp.getActiveDocument().getNamedRanges('terms')[0]?.getRange();
    let elements = termsRange.getRangeElements();
    elements[0].getElement().asText().setText(newTerms);
    elements[0].getElement().asText().setForegroundColor('#000000');
    while (elements.length > 1) {
      elements[1].getElement().removeFromParent();
      elements = termsRange.getRangeElements();
    }
  }

  export function setTerms100(): void {
    setTerms(Constants.TERMS_100);
  }

  export function setTerms50(): void {
    setTerms(Constants.TERMS_50);
  }

  export function setTerms35(): void {
    setTerms(Constants.TERMS_35);
  }
}