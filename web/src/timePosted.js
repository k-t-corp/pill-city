export default (postedAtSeconds) => {
  const minute = 60, hour = 3600, day = 86400, week = 604800;
  const currentTimeAtSeconds = new Date().getTime() / 1000;
  const deltaAtSeconds = currentTimeAtSeconds - postedAtSeconds;
  const d = deltaAtSeconds;
  return
    d < minute ? `${Math.floor(d)}s`
    : d < hour ? `${Math.floor(d / minute)}m`
    : d < day  ? `${Math.floor(d / hour)}h`
    : d < week ? `${Math.floor(d / day)}d`
    : new Date(postedAtSeconds * 1000).toISOString().split('T')[0];
}
