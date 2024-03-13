export function onOpen(e: object): void {
  console.log(e);
  // Maybe you can get the ui from e, check the logs.
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
    .addToUi();
  Autofill.onOpen(e);
}