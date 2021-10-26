export default (postedAtSeconds) => {

  const minute = 60, hour = 3600, day = 3600 * 24, week = 3600 * 24 * 7;

  const currentTimeAtSeconds = new Date().getTime() / 1000;
  const deltaAtSeconds = currentTimeAtSeconds - postedAtSeconds;

  const d = deltaAtSeconds;
  if (d < minute) {
    return `${Math.floor(d)}s`;
  } else if (d < hour) {
    return `${Math.floor(d / minute)}m`;
  } else if (d < day) {
    return `${Math.floor(d / hour)}h`;
  } else if (d < week) {
    return `${Math.floor(d / day)}d`;
  } else {
    return new Date(postedAtSeconds * 1000).toISOString().split('T')[0];
  }

}
