import axios from 'axios'
import ApiError from './ApiError'
import {getAccessToken, setAccessToken, accessTokenExists} from "./AuthStorage";

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
    if (!accessTokenExists()) {
      throw new ApiError(401)
    }
  }

  static authorizedHeaders() {
    return {
      'Authorization': `Bearer ${getAccessToken()}`
    }
  }

  async signUp(id, password, invitationCode) {
    const res = await this.axiosInstance.post(
      `/signUp`,
      {
        'id': id,
        'password': password,
        'invitation_code': invitationCode
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return null
  }

  async isOpenRegistration() {
    const res = await this.axiosInstance.get(
      `/isOpenRegistration`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data.is_open_registration
  }

  async signIn(id, password) {
    const res = await this.axiosInstance.post(
      `/signIn`,
      {
        'id': id,
        'password': password
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    setAccessToken(res.data['access_token'])
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

  async getUser(userId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/user/${userId}`,
      {
        headers: Api.authorizedHeaders()
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async getProfile(profileUserId, fromId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/profile/${profileUserId}`,
      {
        params: {
          'from_id': fromId
        }
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

  async postPost(content, isPublic, circlesNames, reshareable, resharedFrom, mediaData) {
    Api.throwOnUnauthorized()
    let mediaObjName = []
    if (mediaData.length !== 0) {
      mediaObjName = await this.postMedia(mediaData)
    }
    const res = await this.axiosInstance.post(
      `/posts`,
      {
        content,
        is_public: isPublic,
        circle_names: circlesNames,
        reshareable: reshareable,
        reshared_from: resharedFrom,
        media_object_names: mediaObjName
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return null
  }

  async postMedia(mediaData) {
    const res = await this.axiosInstance.post(
      `/posts/media`,
      mediaData,
      {
        headers: {
          'accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.8',
          'Content-Type': `multipart/form-data;`,
        }
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    console.log("res", res)
    return res.data
  }

  async getHome(fromId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/home`,
      {
        params: {
          'from_id': fromId
        }
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async getPost(postId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/post/${postId}`
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
    if (res.status !== 201) {
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

  async follow(followingUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/following/${followingUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async unfollow(followingUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/following/${followingUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async isFollowing(followingUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/following/${followingUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async addReaction(emoji, postId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/posts/${postId}/reactions`,
      {
        emoji
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async deleteReaction(postId, reactionId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/posts/${postId}/reaction/${reactionId}`,
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return null
  }

  async updateAvatar(newAvatar) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/me/avatar`,
      newAvatar,
      {
        headers: {
          'accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.8',
          'Content-Type': `multipart/form-data;`,
        }
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
  }

  async updateProfilePic(newProfilePic, userId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.patch(
      `/me/profilePic/${newProfilePic}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
  }

  async getNotifications(fromId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/notifications`,
      {
        params: {
          'from_id': fromId
        }
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async markNotificationAsRead(notificationId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.put(
      `/notification/${notificationId}/read`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async markAllNotificationsAsRead() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.put(
      `/notifications/read`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async createInvitationCode() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/invitationCode`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
  }

  async getInvitationCodes() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/invitationCodes`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }
}
