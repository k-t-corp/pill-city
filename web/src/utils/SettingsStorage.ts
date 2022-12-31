const UseMultiColumnKey = "use_multi_column"

export const getUseMultiColumn = (): boolean => {
  return window.localStorage.getItem(UseMultiColumnKey) === "true"
}

export const setUseMultiColumn = (use: boolean) => {
  window.localStorage.setItem(UseMultiColumnKey, use ? 'true' : 'false')
}
