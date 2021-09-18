export default (summary, summaryLength) => {
  if (summary.length > summaryLength) return `${summary.slice(0,summaryLength)}...`
  else return summary
}
