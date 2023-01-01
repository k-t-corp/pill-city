import React, {ReactNode} from 'react';
import FormattedContent, {FormattedContentSegment} from "../../models/FormattedContent";

interface Props {
  fc: FormattedContent
  className?: string
}

const convertSegment = (s: FormattedContentSegment, references: string[]): ReactNode => {
  let node: ReactNode = s.content;
  if (s.types.includes("strikethrough")) {
    node = <del>{node}</del>
  }
  if (s.types.includes("bold")) {
    node = <strong>{node}</strong>
  }
  if (s.types.includes("italic")) {
    node = <i>{node}</i>
  }
  if (s.types.includes("url") && s.reference !== undefined && s.reference < references.length) {
    node = <a
      href={references[s.reference]}
      style={{color: '#56a5ff', textDecoration: 'none'}}
      target="_blank" rel="noreferrer noopener">
      {node}
    </a>
  }
  if (s.types.includes("mention") && s.reference !== undefined && s.reference < references.length) {
    node = <a
      href={`/profile/${references[s.reference]}`}
      style={{color: '#56a5ff', textDecoration: 'none'}}>
      {node}
    </a>
  }
  return node
}

const FormattedContentComponent = (props: Props) => {
  const { fc, className } = props;

  return (
    <div className={className}>
      {fc.segments.map((segment, index) => {
        return (
          <span key={index}>{convertSegment(segment, fc.references)}</span>
        )
      })}
    </div>
  )
}

export default FormattedContentComponent
