type FormattedContentSegmentType = "strikethrough" | "bold" | "italic" | "url" | "mention"

interface FormattedContentSegment {
  content: string;
  types: FormattedContentSegmentType[];
  reference?: number
}

interface FormattedContent {
  segments: FormattedContentSegment[];
  references: string[];
}

export default FormattedContent;
