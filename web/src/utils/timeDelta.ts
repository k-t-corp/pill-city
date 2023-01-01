const minute = 60, hour = 3600, day = 3600 * 24, week = 3600 * 24 * 7;

const deltaToString = (d: number): (string | false) => {
  if (d < minute) {
    return `${Math.floor(d)}s`;
  } else if (d < hour) {
    return `${Math.floor(d / minute)}m`;
  } else if (d < day) {
    return `${Math.floor(d / hour)}h`;
  } else if (d < week) {
    return `${Math.floor(d / day)}d`;
  } else {
    return false
  }
}

const nowSeconds = (): number => {
  return new Date().getTime() / 1000;
}

export const pastTime = (time: number): string => {
  const d = deltaToString(nowSeconds() - time)
  if (!d) {
    return new Date(time * 1000).toISOString().split('T')[0];
  }
  return d
}
