import React from 'react';

export default (content, className) => {
  const regExForStrikeThrough = / -(.+)- /g
  const regExForItalic = / _(.+)_ /g
  const regExForBold = / \*(.+)\* /g
  let newContent = content.replace(regExForStrikeThrough, '<del>$1</del>');
  newContent = newContent.replace(regExForItalic, '<i>$1</i>')
  newContent = newContent.replace(regExForBold, '<b>$1</b>')
  return <div className={className} dangerouslySetInnerHTML={{__html: newContent}}/>
}
