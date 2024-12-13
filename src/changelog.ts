/**
 * This file contains functions to display the changelog in different formats.
 * @module src/changelog
 */

import { State } from './constants';
import { ChangelogDict } from './interfaces';

/**
 * Functions to display the changelog in different formats.
 * @namespace Changelog
 * @memberof src/changelog
 */
export namespace Changelog {
  /**
   * Open the changelog as a popup card.
   * @returns {GoogleAppsScript.Card_Service.Card} The card object for the changelog.
   * @todo This always assumes there is only one major version. Why did I do this?
   */
  export function openCardChangelog(): GoogleAppsScript.Card_Service.Card {
    const changelog: ChangelogDict = State.changelog;
    const card = CardService.newCardBuilder();
    console.log(changelog);
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

  /**
   * Open the changelog as an HTML based modal dialogue.
   * @returns {GoogleAppsScript.HTML.HtmlOutput} The HTML output for the changelog.
   * @todo This always assumes there is only one major version. Why did I do this?
   */
  export function openChangelogAsModalDialogue(): GoogleAppsScript.HTML.HtmlOutput {
    const changelog: ChangelogDict = State.changelog;
    const output = HtmlService.createTemplateFromFile('src/html/baseStyle').evaluate();
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
    console.log(output.getContent());
    return output;
  }
}