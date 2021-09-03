export default (postedAtSeconds) => {
  const currentTimeAtSeconds = new Date().getTime() / 1000;
  const deltaAtSeconds = currentTimeAtSeconds - postedAtSeconds
  if (deltaAtSeconds < 60) {
    return `${Math.floor(deltaAtSeconds)}s`
  } else if (deltaAtSeconds < 3600) {
    return `${Math.floor(deltaAtSeconds / 60)}m`
  } else if (deltaAtSeconds < 3600 * 24) {
    return `${Math.floor(deltaAtSeconds / 3600)}h`
  } else if (deltaAtSeconds < 3600 * 24 * 7) {
    return `${Math.floor(deltaAtSeconds / (3600 * 24))}d`
  } else {
    return new Date(postedAtSeconds * 1000).toISOString().split('T')[0];
  }
}
