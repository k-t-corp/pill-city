import axios from 'axios'
import ApiError from './ApiError'
import {getCookie, setCookie, cookieExists} from "./authCookie";

export default class Api {
  constructor(endpoint) {
    this.axiosInstance = axios.create({
      baseURL: endpoint,
      headers: {
        ...Api.authorizedHeaders(),
        'Content-Type': 'application/json',
      }
    })
  }

  static throwOnUnauthorized() {
    if (!cookieExists()) {
      throw new ApiError(401)
    }
  }

  static authorizedHeaders() {
    return {
      'Authorization': `Bearer ${getCookie()}`
    }
  }

  async signUp(id, password) {
    const res = await this.axiosInstance.post(
      `/me`,
      {
        'id': id,
        'password': password
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return null
  }

  async signIn(id, password) {
    const res = await this.axiosInstance.post(
      `/auth`,
      {
        'id': id,
        'password': password
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    setCookie(res.data['access_token'])
    this.axiosInstance.defaults.headers = {
      ...this.axiosInstance.defaults.headers,
      ...Api.authorizedHeaders(),
    }
    return null
  }

  async getMe() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/me`,
      {
        headers: Api.authorizedHeaders()
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async getUsers() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/users`,
      {
        headers: Api.authorizedHeaders()
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async postPost(content) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/posts`,
      {
        content
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return null
  }

  async getPosts() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/posts`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }
}
