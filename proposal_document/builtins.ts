export function onOpen(e: object): void {
  console.log(e);
  // Maybe you can get the ui from e, check the logs.
  const ui = DocumentApp.getUi();
  ui.createMenu('Outpost Project Manager')
    .addItem('Set Header Title', 'setHeaderTitle')
    .addSubMenu(ui.createMenu('Set Terms')
      .addItem('100% Upfront', 'setTerms100')
      .addItem('50/50%', 'setTerms50')
      .addItem('35/35/30%', 'setTerms35'))
    .addSeparator()
    .addItem('Name Range', 'nameRange')
    .addItem('List Named Ranges', 'listNamedRanges')
    .addToUi();
}