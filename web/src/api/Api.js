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

  async postPost(content, isPublic, circlesNames) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/posts`,
      {
        content,
        is_public: isPublic,
        circle_names: circlesNames
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

  async postComment(content, postId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/posts/${postId}/comment`,
      {
        content
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return null
  }

  async postNestedComment(content, postId, commentId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/posts/${postId}/comment/${commentId}/comment`,
      {
        content
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return null
  }

  async getCircles() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/circles`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async getCircle(circleName) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/circle/${circleName}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async createCircle(name) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/circle/${name}`
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return null
  }

  async deleteCircle(name) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/circle/${name}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return null
  }

  async addToCircle(circleName, memberUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/circle/${circleName}/membership/${memberUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async removeFromCircle(circleName, memberUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/circle/${circleName}/membership/${memberUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }
}
