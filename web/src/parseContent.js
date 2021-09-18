import React from 'react';

export default (content, className) => {

  const regExForStrikeThrough = /(^|\s)-(.+?)-($|\s)/g
  const regExForItalic = /(^|\s)_(.+?)_($|\s)/g
  const regExForBold = /(^|\s)\*(.+?)\*($|\s)/g
  const regExForMention = /@([A-Za-z0-9_-]+)(\s|$)/g;

  const newContent = content
    .replace(regExForStrikeThrough, '$1<del>$2</del>$3')
    .replace(regExForItalic, '$1<i>$2</i>$3')
    .replace(regExForBold, '$1<b>$2</b>$3')
    .replace(
      regExForMention,
      `<a href="/profile/$1" style="color: #56a5ff; text-decoration: none;">@$1</a>$2`
    );

  return <div className={className} dangerouslySetInnerHTML={{__html: newContent}}/>

}
