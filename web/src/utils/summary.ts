const summary = (summary: string , summaryLength: number): string => {
  if (summary.length > summaryLength) {
    return `${summary.slice(0,summaryLength)}...`
  }
  return summary
}

export default summary
