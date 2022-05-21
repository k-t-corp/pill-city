import axios from 'axios'
import ApiError from './ApiError'
import {getAccessToken, setAccessToken, accessTokenExists} from "./AuthStorage";

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

  async postPost(content, isPublic, circleIds, reshareable, resharedFrom, newPostMedias, mentionedUserIds, newPostPollChoices) {
    Api.throwOnUnauthorized()

    // gather uploaded media and their indices
    let uploadedMediaFormData = new FormData()
    let uploadedMediaIndex = 0
    for (let i = 0; i < newPostMedias.length; i++) {
      const m = newPostMedias[i]
      if (m.type === 'Uploaded') {
        const blob = new Blob([m.media], {type: 'image/*'})
        uploadedMediaFormData.append(`media${uploadedMediaIndex++}`, blob)
      }
    }

    // upload media
    let uploadedMediaObjNames = []
    if (uploadedMediaFormData.length !== 0) {
      uploadedMediaObjNames = await this.uploadMedia(uploadedMediaFormData)
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
        mentioned_user_ids: mentionedUserIds,
        poll_choices: pollChoices,
        poll_choice_media_object_names: pollChoiceMediaObjectNames
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async uploadMedia(mediaData) {
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
      throw new ApiError(res)
    }
    return res.data
  }

  async getOwnedMedia(pageNumber) {
    Api.throwOnUnauthorized()
    const res = await this.axiosInstance.get(
      `/media`,
      {
        params: {
          page: pageNumber
        }
      }
    )
    if (res.status !== 200) {
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

  async postComment(content, postId, mentionedUserIds, mediaData, ownedMediaObjectNames) {
    Api.throwOnUnauthorized()
    let allMediaObjNames = []
    if (mediaData.length !== 0) {
      allMediaObjNames = await this.uploadMedia(mediaData)
    }
    allMediaObjNames = allMediaObjNames.concat(ownedMediaObjectNames)
    const res = await this.axiosInstance.post(
      `/posts/${postId}/comment`,
      {
        content,
        mentioned_user_ids: mentionedUserIds,
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

  async postNestedComment(content, postId, commentId, mentionedUserIds, mediaData, ownedMediaObjectNames) {
    Api.throwOnUnauthorized()
    let allMediaObjNames = []
    if (mediaData.length !== 0) {
      allMediaObjNames = await this.uploadMedia(mediaData)
    }
    allMediaObjNames = allMediaObjNames.concat(ownedMediaObjectNames)
    const res = await this.axiosInstance.post(
      `/posts/${postId}/comment/${commentId}/comment`,
      {
        content,
        mentioned_user_ids: mentionedUserIds,
        media_object_names: allMediaObjNames
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
    return null
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

  async createMyMediaSet() {
    const res = await this.axiosInstance.post(
      `/mediaSets`,
      {
        name: 'default'
      }
    )
    if (res.status !== 201) {
      throw new ApiError(res)
    }
    return res.data
  }

  async getMyMediaSet() {
    const res = await this.axiosInstance.get(
      `/mediaSets?mine=1`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    if (res.data.length === 0) {
      return null
    }
    return res.data[0]
  }

  async getPublicMediaSets() {
    const res = await this.axiosInstance.get(
      `/mediaSets?mine=0`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async makeMyMediaSetPublic() {
    const defaultMediaSetId = (await this.getMyMediaSet()).id
    const res = await this.axiosInstance.patch(
      `/mediaSet/${defaultMediaSetId}/public`
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async addMediaToMyMediaSet(objectName) {
    const defaultMediaSetId = (await this.getMyMediaSet()).id
    const res = await this.axiosInstance.post(
      `/mediaSet/${defaultMediaSetId}/media`,
      { object_name: objectName }
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async removeMediaFromMyMediaSet(objectName) {
    const defaultMediaSetId = (await this.getMyMediaSet()).id
    const res = await this.axiosInstance.delete(
      `/mediaSet/${defaultMediaSetId}/media`,
      {
        data: {
          object_name: objectName
        }
      }
    )
    if (res.status !== 200) {
      throw new ApiError(res)
    }
    return res.data
  }

  async deleteMyMediaSet() {
    const defaultMediaSetId = (await this.getMyMediaSet()).id
    const res = await this.axiosInstance.delete(
      `/mediaSet/${defaultMediaSetId}`
    )
    if (res.status !== 200) {
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
}

const api = new Api(process.env.REACT_APP_API_ENDPOINT)
export default api
