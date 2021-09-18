import React from 'react';

export default (content, className) => {

  const regExForStrikeThrough = /-(.+?)-/g
  const regExForItalic = /_(.+?)_/g
  const regExForBold = /\*(.+?)\*/g
  const regExForMention = /@([A-Za-z0-9_-]+)(\s|$)/g;

  const newContent = content
    .replace(regExForStrikeThrough, '<del>$1</del>')
    .replace(regExForItalic, '<i>$1</i>')
    .replace(regExForBold, '<b>$1</b>')
    .replace(
      regExForMention,
      `<a href="/profile/$1" style="color: #56a5ff; text-decoration: none;">@$1</a>$2`
    );

  return <div className={className} dangerouslySetInnerHTML={{__html: newContent}}/>

}
