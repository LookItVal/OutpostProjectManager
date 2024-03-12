function setHeaderTitle() {
  //get document
  const document = DocumentApp.getActiveDocument();
  const header = document.getNamedRanges('projectNameHeader')[0].getRange();
  //get name of the document
  const name = document.getName();
  // change the text of the header to the name of the document
  header.getRangeElements()[0].getElement().asText().setText(name);
  // change text color to black
  header.getRangeElements()[0].getElement().asText().setForegroundColor('#000000');
}

function setTerms(newTerms) {
  const termsRange = DocumentApp.getActiveDocument().getNamedRanges('terms')[0].getRange();
  elements = termsRange.getRangeElements();
  // while length of elements is greater than 1, remove the first element
  while (elements.length > 1) {
    elements[0].getElement().removeFromParent();
    elements = termsRange.getRangeElements();
  }
  // replace the text of the first element with the new terms
  elements[0].getElement().asText().setText(newTerms);
  // change text color to black
  elements[0].getElement().asText().setForegroundColor('#000000');
}

function setTerms100() {
  setTerms(terms100);
}

function setTerms50() {
  setTerms(terms50);
}

function setTerms35() {
  setTerms(terms35);
}
