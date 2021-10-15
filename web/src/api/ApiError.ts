import {AxiosResponse} from "axios";

export default class ApiError extends Error {
  statusCode: number;

  constructor(response: AxiosResponse) {
    super()
    this.name = 'ApiError'
    if (response.data && response.data.message) {
      this.message = `${response.data.message} (${response.status})`
    } else if (response.data) {
      this.message = `${JSON.stringify(response.data)} (${response.status})`
    } else {
      this.message = `${response.statusText} (${response.status})`
    }
    this.statusCode = response.status
  }
}
