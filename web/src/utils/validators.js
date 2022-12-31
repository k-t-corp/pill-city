const idRegex = /^[A-Za-z0-9_-]+$/i;

export const validateId = (id) => {
  return id && id.trim() && id.trim().length <= 15 && id.trim().match(idRegex)
}

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const validateEmail = (email) => {
  return String(email).toLowerCase().match(emailRegex)
}

export const validatePassword = (password) => {
  return password && password.trim()
}
