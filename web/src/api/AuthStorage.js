const AccessTokenKey = 'access_token'

export const accessTokenExists = () => {
  return window.localStorage.getItem(AccessTokenKey) !== null
}

export const getAccessToken = () => {
  return window.localStorage.getItem(AccessTokenKey)
}

export const setAccessToken = (accessToken) => {
  window.localStorage.setItem(AccessTokenKey, accessToken)
}

export const removeAccessToken = () => {
  window.localStorage.removeItem(AccessTokenKey)
}
