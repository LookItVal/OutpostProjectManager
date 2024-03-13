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
    fillEmail(e);
    fillName(e);
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

  export function setTerms(newTerms: string, e?: GoogleAppsScript.Events.DocsOnOpen): void {
    const doc = e?.source ?? DocumentApp.getActiveDocument();
    const termsRange = doc.getNamedRanges('terms')[0]?.getRange();
    const textRange = termsRange.getRangeElements()[0].getElement();
    textRange.asText().setText(newTerms);
    textRange.asText().setForegroundColor('#000000');
    while (termsRange.getRangeElements().length > 1) {
      const t = termsRange.getRangeElements()[1];
      // if element is incomplete
      if (t.isPartial()) {
        t.getElement().removeFromParent();
        termsRange.getRangeElements()[1].getElement().removeFromParent();
        break;
      }
      t.getElement().removeFromParent();
    }
    doc.getNamedRanges('terms')[0].remove();
    const newRange = doc.newRange();
    newRange.addElement(textRange);
    doc.addNamedRange('terms', newRange.build());
  }

  export function setTerms100(e?: GoogleAppsScript.Events.DocsOnOpen): void {
    setTerms(Constants.TERMS_100, e);
  }

  export function setTerms50(e?: GoogleAppsScript.Events.DocsOnOpen): void {
    setTerms(Constants.TERMS_50, e);
  }

  export function setTerms35(e?: GoogleAppsScript.Events.DocsOnOpen): void {
    setTerms(Constants.TERMS_35, e);
  }

  interface DocEvent {
    source: GoogleAppsScript.Document.Document;
    user?: {
      email: string;
      nickname: string;
    };
  }


  export function fillName(e: DocEvent): void {
    const doc = e.source ?? DocumentApp.getActiveDocument();
    const name = e.user?.nickname as string;
    const nameRange = doc.getNamedRanges('fullName')[0]?.getRange();
    nameRange.getRangeElements()[0].getElement().asText().setText(`Prepared by: ${name.charAt(0).toUpperCase()}${name.slice(1)} - Outpost Worldwide, Inc.`);
    nameRange.getRangeElements()[0].getElement().asText().setForegroundColor('#000000');
  }


  export function fillEmail(e: DocEvent): void {
    const doc = e.source;
    const email = e.user?.email;
    const emailRange = doc.getNamedRanges('email')[0]?.getRange();
    emailRange.getRangeElements()[0].getElement().asText().setText(`Prepared by: ${email} - Outpost Worldwide, Inc.`);
    emailRange.getRangeElements()[0].getElement().asText().setForegroundColor('#000000');
  }
}