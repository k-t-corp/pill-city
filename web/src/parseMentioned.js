export default (content) => {
  const regExForMention = /@([A-Za-z0-9_-]+)(?=\s|$)/g;
  return [...content.matchAll(regExForMention)].map(a => a[1])
}
