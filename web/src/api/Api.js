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
    let res
    try {
      res = await this.axiosInstance.get(
        `/user/${userId}`,
        {
          headers: Api.authorizedHeaders()
        }
      )
    } catch (e) {
      res = e.response
    }
    if (res.status !== 200) {
      throw new ApiError(res.status, res.data)
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

  async postPost(content, isPublic, circleIds, reshareable, resharedFrom, mediaData, mentionedUserIds) {
    Api.throwOnUnauthorized()
    let mediaObjName = []
    if (mediaData.length !== 0) {
      mediaObjName = await this.media(mediaData)
    }
    const res = await this.axiosInstance.post(
      `/posts`,
      {
        content,
        is_public: isPublic,
        circle_ids: circleIds,
        reshareable: reshareable,
        reshared_from: resharedFrom,
        media_object_names: mediaObjName,
        mentioned_user_ids: mentionedUserIds
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async media(mediaData) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/media`,
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
    return res.data
  }

  async deletePost(postId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/post/${postId}`
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
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

  async postComment(content, postId, mentionedUserIds) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/posts/${postId}/comment`,
      {
        content,
        mentioned_user_ids: mentionedUserIds
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async deleteComment(postId, commentId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/posts/${postId}/comment/${commentId}`
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async postNestedComment(content, postId, commentId, mentionedUserIds) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/posts/${postId}/comment/${commentId}/comment`,
      {
        content,
        mentioned_user_ids: mentionedUserIds
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async deleteNestedComment(postId, commentId, nestedCommentId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/posts/${postId}/comment/${commentId}/comment/${nestedCommentId}`
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return res.data
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

  async getCircle(circleId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/circle/${circleId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async createCircle(name) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/circles`,
      {
        name
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res.status)
    }
    return null
  }

  async deleteCircle(circleId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/circle/${circleId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return null
  }

  async addToCircle(circleId, memberUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/circle/${circleId}/membership/${memberUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async removeFromCircle(circleId, memberUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/circle/${circleId}/membership/${memberUserId}`
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

  async updateProfilePic(newProfilePic) {
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
    return res.data
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

  async clearMediaUrlCache() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/clearMediaUrlCache`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data
  }

  async getApiGitCommit() {
    const res = await this.axiosInstance.get(
      `/gitCommit`
    )
    if (res.status !== 200) {
      throw new ApiError(res.status)
    }
    return res.data.git_commit
  }
}
