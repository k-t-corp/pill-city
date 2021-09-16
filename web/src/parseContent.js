import React from 'react';

export default (content, className) => {

  /* const [
    regExForStrikeThrough,
    regExForItalic,
    regExForBold
  ] = [ "-", "_", "\\*" ].map(
    char => new RegExp(`(?<=\\s|^)${char}(.+?)${char}(?=\\s|$)`, "g")
  ); */

  const regExForStrikeThrough = /(?<=\s|^)-(.+?)-(?=\s|$)/g
  const regExForItalic = /(?<=\s|^)_(.+?)_(?=\s|$)/g
  const regExForBold = /(?<=\s|^)\*(.+?)\*(?=\s|$)/g
  const regExForMention = /@([A-Za-z0-9_-]+)(?=\s|$)/g;

  const newContent = content
    .replace(regExForStrikeThrough, '<del>$1</del>')
    .replace(regExForItalic, '<i>$1</i>')
    .replace(regExForBold, '<b>$1</b>')
    .replace(
      regExForMention,
      `<a href="/profile/$1" style="color: #56a5ff; text-decoration: none;">@$1&nbsp;</a>`
    );

  return <div className={className} dangerouslySetInnerHTML={{__html: newContent}}/>

}
