export default class CatchApiErrorBuilder {
  constructor() {
    this.handlers = {}
    this.unknownErrorHandler = undefined
    this.unknownStatusCodeHandler = undefined
  }

  handle(statusCode, handleData) {
    this.handlers[statusCode] = handleData
    return this
  }

  unknownError(handler) {
    this.unknownErrorHandler = handler
    return this
  }

  unknownStatusCode(handler) {
    this.unknownStatusCodeHandler = handler
    return this
  }

  build() {
    return err => {
      if (err.name !== 'mini-gplus.ApiError') {
        if (typeof this.unknownErrorHandler === "function") {
          this.unknownErrorHandler(err)
        } else {
          throw err
        }
      } else {
        if (typeof this.handlers[err.statusCode] === "function") {
          this.handlers[err.statusCode](err)
        } else {
          if (typeof this.unknownStatusCodeHandler === "function") {
            this.unknownStatusCodeHandler(err)
          } else {
            throw err
          }
        }
      }
    }
  }
}
