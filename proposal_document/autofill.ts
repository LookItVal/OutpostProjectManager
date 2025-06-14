import { DocEvent } from '../src/interfaces';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export namespace Autofill {
  export function onOpen(e: DocEvent): void {
    console.log(e);
    const doc = e.source as GoogleAppsScript.Document.Document;
    fillDate(e);
    if (doc.getNamedRanges('projectNameHeader').length !== 0) {
      initializeDocument(e);
    }
  }

  export function initializeDocument(e: DocEvent): void {
    setHeaderTitle(e);
    fillEmail(e);
    fillName(e);
  }

  export function setHeaderTitle(e?: DocEvent): void {
    const doc = e?.source ?? DocumentApp.getActiveDocument();
    const header = doc.getNamedRanges('projectNameHeader')[0]?.getRange();
    const frontPageHeader = doc.getNamedRanges('frontPageProjectName')[0]?.getRange();
    const name = doc.getName();
    if (name === 'Proposal Template') {
      return;
    }
    header.getRangeElements()[0].getElement().asText().setText(name);
    frontPageHeader.getRangeElements()[0].getElement().asText().setText(name);
    header.getRangeElements()[0].getElement().asText().setForegroundColor('#000000');
    frontPageHeader.getRangeElements()[0].getElement().asText().setForegroundColor('#000000');
    doc.getNamedRanges('projectNameHeader')[0].remove();
    doc.getNamedRanges('frontPageProjectName')[0].remove();
  }

  export function setTerms(newTerms: string, e?: DocEvent): void {
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

  export function setTerms100(e?: DocEvent): void {
    setTerms(Constants.TERMS_100, e);
  }

  export function setTerms50(e?: DocEvent): void {
    setTerms(Constants.TERMS_50, e);
  }

  export function setTerms35(e?: DocEvent): void {
    setTerms(Constants.TERMS_35, e);
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
    const email = e.user?.email as string;
    const emailRange = doc.getNamedRanges('email')[0]?.getRange();
    emailRange.getRangeElements()[0].getElement().asText().setText(email);
    emailRange.getRangeElements()[0].getElement().asText().setForegroundColor('#000000');
  }

  export function fillDate(e: DocEvent): void {
    const doc = e.source;
    const dateFormat: Record<string, 'numeric' | '2-digit' | 'short' | undefined> = { year: 'numeric', month: 'short', day: '2-digit' };
    const today = new Intl.DateTimeFormat('en-US', dateFormat).format(new Date());
    const emailRange = doc.getNamedRanges('todaysDate')[0]?.getRange();
    emailRange.getRangeElements()[0].getElement().asText().setText(today);
    emailRange.getRangeElements()[0].getElement().asText().setForegroundColor('#000000');
  }
}