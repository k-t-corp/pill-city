export default class ApiError extends Error {
  constructor(statusCode, data) {
    super()
    this.name = 'ApiError'
    this.message = `${statusCode}: ${data}`
    this.statusCode = statusCode
    this.data = data
  }
}
