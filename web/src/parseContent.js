import React from 'react';

export default (content, className) => {
  const regExForStrikeThrough = / -(.+)- /g
  const regExForItalic = / _(.+)_ /g
  const regExForBold = / \*(.+)\* /g
  const regExForMention = /@([A-Za-z0-9_-]+) /g;
  let newContent = content.replace(regExForStrikeThrough, '<del>$1</del>');
  newContent = newContent.replace(regExForItalic, '<i>$1</i>')
  newContent = newContent.replace(regExForBold, '<b>$1</b>')
  newContent = newContent.replace(regExForMention, `<span style="color: #56a5ff" onClick="window.location.href='/profile/$1'">@$1&nbsp;</span>`)
  return <div className={className} dangerouslySetInnerHTML={{__html: newContent}}/>
}
