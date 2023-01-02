import axios from 'axios'
import ApiError from './ApiError'
import {getAccessToken, setAccessToken, accessTokenExists} from "./AuthStorage";
import {purgeCache} from "../store/persistorUtils";

export class Api {
  constructor(endpoint) {
    this.axiosInstance = axios.create({
      baseURL: endpoint,
      headers: {
        ...Api.authorizedHeaders(),
        'Content-Type': 'application/json',
      },
      validateStatus: status => {
        return status < 500; // Resolve only if the status code is less than 500
      }
    })
  }

  static isUnauthorized() {
    return !accessTokenExists()
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

  async signUp(id, displayName, password, invitationCode, email) {
    const res = await this.axiosInstance.post(
      `/signUp`,
      {
        'id': id,
        'display_name': displayName,
        'password': password,
        'invitation_code': invitationCode,
        'email': email
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return null
  }

  async isOpenRegistration() {
    const res = await this.axiosInstance.get(
      `/isOpenRegistration`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
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
      throw new ApiError(res)
    }
    const {access_token, expires} = res.data
    purgeCache()
    setAccessToken(access_token, expires)
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
      throw new ApiError(res)
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
      throw new ApiError(res)
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
      throw new ApiError(res)
    }
    return res.data
  }

  async getUsers() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/users`,
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async searchUsers(keyword) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      '/users/search',
      {
        keyword
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async createPost(content, isPublic, circleIds, reshareable, resharedFrom, newPostMedias, newPostPollChoices) {
    Api.throwOnUnauthorized()

    // gather uploaded media and their indices
    const uploadedFiles = []
    for (let i = 0; i < newPostMedias.length; i++) {
      const m = newPostMedias[i]
      if (m.type === 'Uploaded') {
        uploadedFiles.push(m.media)
      }
    }

    // upload media
    let uploadedMediaObjNames = []
    if (uploadedFiles.length !== 0) {
      uploadedMediaObjNames = await this.createMediaAndGetObjectNames(uploadedFiles)
    }

    // build media object names
    let uploadedMediaObjNamesPtr = 0
    const mediaObjectNames = newPostMedias.map(m => {
      if (m.type === 'Uploaded') {
        return uploadedMediaObjNames[uploadedMediaObjNamesPtr++]
      } else {
        return m.media.object_name
      }
    })

    // build poll related parameters
    let pollChoices = []
    let pollChoiceMediaObjectNames = []
    if (newPostPollChoices.length > 0) {
      pollChoices = newPostPollChoices.map(pc => pc.text)
      pollChoiceMediaObjectNames = newPostPollChoices.map(_ => "null")
    }

    const res = await this.axiosInstance.post(
      `/posts`,
      {
        content,
        is_public: isPublic,
        circle_ids: circleIds,
        reshareable: reshareable,
        reshared_from: resharedFrom,
        media_object_names: mediaObjectNames,
        poll_choices: pollChoices,
        poll_choice_media_object_names: pollChoiceMediaObjectNames
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async createMediaAndGetObjectNames(files) {
    return Promise.all(files.map(async (f) => {
      const res = await this.createMedia(f)
      return res['object_name']
    }));
  }

  async createMedia(file) {
    Api.throwOnUnauthorized()
    const blob = new Blob([file], {type: 'image/*'})
    const form = new FormData()
    form.append(`file`, blob)

    const res = await this.axiosInstance.post(
      `/media`,
      form,
      {
        headers: {
          'accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.8',
          'Content-Type': `multipart/form-data;`,
        }
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async deletePost(postId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/post/${postId}`
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async deletePostMedia(postId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/post/${postId}/media`
    )
    if (res.status !== 201) {
      throw new ApiError(res)
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
      throw new ApiError(res)
    }
    return res.data
  }

  async pollHome(toId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/home`,
      {
        params: {
          'to_id': toId
        }
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async getPost(postId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/post/${postId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async createComment(content, postId, mediaFiles, ownedMediaObjectNames) {
    Api.throwOnUnauthorized()
    let allMediaObjNames = []
    if (mediaFiles.length !== 0) {
      allMediaObjNames = await this.createMediaAndGetObjectNames(mediaFiles)
    }
    allMediaObjNames = allMediaObjNames.concat(ownedMediaObjectNames)
    const res = await this.axiosInstance.post(
      `/posts/${postId}/comment`,
      {
        content,
        media_object_names: allMediaObjNames
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async deleteComment(postId, commentId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/posts/${postId}/comment/${commentId}`
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async createNestedComment(content, postId, commentId, mediaFiles, ownedMediaObjectNames, replyToNestedCommentId) {
    Api.throwOnUnauthorized()
    let mediaObjNames = []
    if (mediaFiles.length !== 0) {
      mediaObjNames = await this.createMediaAndGetObjectNames(mediaFiles)
    }
    mediaObjNames = mediaObjNames.concat(ownedMediaObjectNames)
    const res = await this.axiosInstance.post(
      `/posts/${postId}/comment/${commentId}/comment`,
      {
        content,
        media_object_names: mediaObjNames,
        reply_to_comment_id: replyToNestedCommentId
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async deleteNestedComment(postId, commentId, nestedCommentId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/posts/${postId}/comment/${commentId}/comment/${nestedCommentId}`
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async getCircles() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/circles`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async renameCircle(circleId, newName) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.patch(
      `/circle/${circleId}/name`,
      {
        'name': newName
      }
    )
    if (res.status !== 204) {
      throw new ApiError(res)
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
      throw new ApiError(res)
    }
    return res.data
  }

  async deleteCircle(circleId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/circle/${circleId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return null
  }

  async addToCircle(circleId, memberUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/circle/${circleId}/membership/${memberUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async removeFromCircle(circleId, memberUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/circle/${circleId}/membership/${memberUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async follow(followingUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/following/${followingUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async unfollow(followingUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/following/${followingUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
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
      throw new ApiError(res)
    }
    return res.data
  }

  async deleteReaction(postId, reactionId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/posts/${postId}/reaction/${reactionId}`,
    )
    if (res.status !== 200) {
      throw new ApiError(res)
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
      throw new ApiError(res)
    }
  }

  async updateProfilePic(newProfilePic) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.patch(
      `/me/profilePic/${newProfilePic}`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
  }

  async updateDisplayName(newDisplayName) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/me/displayName`,
      {
        display_name: newDisplayName
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
  }

  async updateEmail(newEmail) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/me/email`,
      {
        email: newEmail
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
  }

  async getEmail() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/me/email`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data.email
  }

  async getFollowingCounts() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/me/followingCounts`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async getFollowings() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/me/followings`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async getBlocking() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/me/blocking`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
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
      throw new ApiError(res)
    }
    return res.data
  }

  async pollNotifications(toId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/notifications`,
      {
        params: {
          'to_id': toId
        }
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async markNotificationAsRead(notificationId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.put(
      `/notification/${notificationId}/read`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async markAllNotificationsAsRead() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.put(
      `/notifications/read`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async createInvitationCode() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/invitationCode`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async getInvitationCodes() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/invitationCodes`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async clearMediaUrlCache() {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/clearMediaUrlCache`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async getApiGitCommit() {
    const res = await this.axiosInstance.get(
      `/gitCommit`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data.git_commit
  }

  async getLinkPreview(url) {
    const res = await this.axiosInstance.post(
      `/linkPreview`,
      { url }
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async forgetPassword(email) {
    const res = await this.axiosInstance.post(
      `/forgetPassword`,
      { email }
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async resetPassword(code, password) {
    const res = await this.axiosInstance.post(
      `/resetPassword`,
      { code, password }
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async getRssToken() {
    const res = await this.axiosInstance.get(
      `/rssToken`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async rotateRssToken() {
    const res = await this.axiosInstance.post(
      `/rssToken`
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async deleteRssToken() {
    const res = await this.axiosInstance.delete(
      `/rssToken`
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async vote(postId, choiceId) {
    const res = await this.axiosInstance.post(
      `/post/${postId}/poll/${choiceId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async block(blockingUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.post(
      `/block/${blockingUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async unblock(unblockingUserId) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.delete(
      `/block/${unblockingUserId}`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }
}

const api = new Api(process.env.REACT_APP_API_ENDPOINT)
export default api
