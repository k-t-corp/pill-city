const AccessTokenKey = 'access_token'
const AccessTokenExpiresKey = 'access_token_expires'

export const accessTokenExists = (): boolean => {
  if (window.localStorage.getItem(AccessTokenExpiresKey) === null) {
    return false
  }
  const expires = parseInt(window.localStorage.getItem(AccessTokenExpiresKey) as string)
  const now = new Date().getTime() / 1000
  if (expires <= now) {
    return false
  }
  return window.localStorage.getItem(AccessTokenKey) !== null
}

export const getAccessToken = (): string => {
  return window.localStorage.getItem(AccessTokenKey) as string
}

export const setAccessToken = (accessToken: string, expires: number) => {
  window.localStorage.setItem(AccessTokenKey, accessToken)
  window.localStorage.setItem(AccessTokenExpiresKey, `${expires}`)
}

export const removeAccessToken = () => {
  window.localStorage.removeItem(AccessTokenKey)
}
