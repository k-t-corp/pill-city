import React from 'react';
import FormattedContent from "../../models/FormattedContent";

interface Props {
  fc: FormattedContent
  className?: string
}

export default (props: Props) => {
  const { fc, className } = props;

  return (
    <div className={className}>
      {fc.segments.map((segment, index) => {
        return (
          <span key={index}>{segment.content}</span>
        )
      })}
    </div>
  )
}
