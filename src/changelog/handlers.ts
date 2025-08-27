import { changelog } from '../constants';
import { ChangelogDict } from '../interfaces';

interface ChangelogHandlersExport {
  changelog: typeof changelog;
}
declare const exports: ChangelogHandlersExport;

export function openCardChangelog(): GoogleAppsScript.Card_Service.Card {
  const changelog: ChangelogDict = exports.changelog;
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('Changelog'));
  // Iterate over the changelog and add each item as a text paragraph
  for (const minorVersionKey of Object.keys(changelog[1]).reverse()) {
    const minorVersion = parseInt(minorVersionKey);
    const section = CardService.newCardSection().setHeader(`Version 1.${minorVersion}: ${changelog[1][minorVersion][0]}`);
    section.setCollapsible(true);
    for (const patchVersionKey of Object.keys(changelog[1][minorVersion][1]).reverse()) {
      const patchVersion = parseInt(patchVersionKey);
      const patches = changelog[1][minorVersion][1][patchVersion];
      section.addWidget(CardService.newTextParagraph().setText(`--- Release 1.${minorVersion}.${patchVersion} ---`));
      for (const changeKey of Object.keys(patches).reverse()) {
        const change = patches[parseInt(changeKey)] as string[];
        section.addWidget(CardService.newDecoratedText()
          .setWrapText(true)
          .setTopLabel(change[1])
          .setText(change[0]));
      }
    }
    card.addSection(section);
  }
  return card.build();
}

export function openChangelogAsModalDialogue(): GoogleAppsScript.HTML.HtmlOutput {
  const changelog: ChangelogDict = exports.changelog;
  const output = HtmlService.createTemplateFromFile('src/changelog/html/changelog').evaluate();
  for (const minorVersionKey of Object.keys(changelog[1]).reverse()) {
    const minorVersion = parseInt(minorVersionKey);
    output.append('<details>');
    output.append(`<summary>Version 1.${minorVersion}: ${changelog[1][minorVersion][0]}</summary>`);
    for (const patchVersionKey of Object.keys(changelog[1][minorVersion][1]).reverse()) {
      const patchVersion = parseInt(patchVersionKey);
      const patches = changelog[1][minorVersion][1][patchVersion];
      output.append(`<p>--- Release 1.${minorVersion}.${patchVersion} ---</p>`);
      for (const changeKey of Object.keys(patches).reverse()) {
        const change = patches[parseInt(changeKey)] as string[];
        output.append('<div class="changelog-item">');
        output.append(`<p><b>${change[1]}</b>`);
        output.append(`<br>${change[0]}</p>`);
      }
      output.append('<br>');
    }
    output.append('</details>');
    output.append('<br>');
  }
  output.append('</body>');
  output.append('</html>');
  return output;
}

