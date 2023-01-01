import React, {useEffect, useState} from 'react'
import {useHistory, useParams} from "react-router-dom";
import PostComponent from "../../components/Post/Post";
import NewPost from "../../components/NewPost/NewPost";
import getProfilePicUrl from "../../utils/getUserBannerUrl";
import ApiError from "../../api/ApiError";
import User from "../../models/User";
import PostModel from "../../models/Post"
import useInView from "react-cool-inview";
import getNameAndSubName from "../../utils/getNameAndSubName";
import api from "../../api/Api";
import {useAppSelector} from "../../store/hooks";
import {ResharedPost} from "../../models/Post";
import PillModal from "../../components/PillModal/PillModal";
import "./Profile.css"
import AvatarV2 from "../../components/MediaV2/AvatarV2";
import PillDropdownMenu from "../../components/PillDropdownMenu/PillDropdownMenu";
import {DotsVerticalIcon} from "@heroicons/react/solid";

const InfiniteScrollBefore = 5

const Profile = () => {
  const { id: userId } = useParams<{id?: string}>()
  const me = useAppSelector(state => state.me.me)

  const [user, updateUser] = useState<User | null>(null)
  const [userNotFound, updateUserNotFound] = useState(false)

  const [postsLoading, updatePostsLoading] = useState(true)
  const [posts, updatePosts] = useState<PostModel[]>([])
  const [loadingMorePosts, updateLoadingMorePosts] = useState(false)
  const [noMoreNewPosts, updateNoMoreNewPosts] = useState(false)

  const [newPostOpened, updateNewPostOpened] = useState(false)
  const [resharePost, updateResharePost] = useState<PostModel | ResharedPost | null>(null)

  const [isFollowing, updateIsFollowing] = useState(false)
  const [followLoading, updateFollowLoading] = useState(true)
  const [isBlocking, updateIsBlocking] = useState(false)
  const [blockLoading, updateBlockLoading] = useState(true)

  const history = useHistory()

  useEffect(() => {
    (async () => {
      if (!me) {
        return
      }
      updatePostsLoading(true)
      if (!userId) {
        updateUser(me)
        updatePosts(await api.getProfile(me.id))
        updatePostsLoading(false)
        updateFollowLoading(false)
      } else {
        let user
        try {
          user = await api.getUser(userId)
          updateUser(user)
          updateIsFollowing(user.is_following)
          updateIsBlocking(user.is_blocking)
          updatePosts(await api.getProfile(userId))
          updatePostsLoading(false)
          updateFollowLoading(false)
          updateBlockLoading(false)
        } catch (e) {
          if (e instanceof ApiError && e.statusCode === 404) {
            updateUserNotFound(true)
          } else {
            throw e
          }
        }
      }
    })()
  }, [me, userId])

  const loadMorePosts = async () => {
    if (loadingMorePosts || user === null) {
      return
    }
    updateLoadingMorePosts(true)
    const lastPost = posts[posts.length - 1]
    const newPosts = await api.getProfile(user.id, lastPost['id'])
    if (newPosts.length !== 0) {
      updatePosts(posts.concat(newPosts))
    } else {
      updateNoMoreNewPosts(true)
    }
    updateLoadingMorePosts(false)
  }

  const { observe } = useInView({
    rootMargin: "50px 0px",
    onEnter: async ({ unobserve, observe }) => {
      unobserve()
      await loadMorePosts()
      observe()
    }
  })

  const profilePosts = () => {
    if (userNotFound) {
      return (<div className="profile-status">User not found</div>)
    } else if (postsLoading || !me) {
      return (<div className="profile-status">Loading...</div>)
    } else if (isBlocking) {
      return (<div className="profile-status">User is blocked</div>)
    } else if (posts.length === 0) {
      return (<div className="profile-status">No posts here</div>)
    } else {
      let postElements = []
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        let isInfiniteScrollTrigger = false
        if (posts.length > InfiniteScrollBefore) {
          isInfiniteScrollTrigger = i === posts.length - InfiniteScrollBefore
        } else {
          isInfiniteScrollTrigger = i === posts.length - 1
        }
        postElements.push(
          <div
            // need to use post ID instead of index as key
            // otherwise comments and reactions will be shifted after a new post is prepended
            key={post.id}
            ref={isInfiniteScrollTrigger ? observe : null}
          >
            <PostComponent
              post={post}
              me={me}
              updateResharedPost={updateResharePost}
              hasNewPostModal={true}
              updateNewPostOpened={updateNewPostOpened}
              detail={false}
            />
          </div>
        )
      }
      let endElem
      if (noMoreNewPosts) {
        endElem = (
          <div
            key={posts.length}
            className='profile-load-more profile-load-more-disable'
          >No more new posts</div>
        )
      } else if (loadingMorePosts) {
        endElem = (
          <div
            key={posts.length}
            className='profile-load-more'
            onClick={loadMorePosts}
          >Load more</div>
        )
      } else {
        endElem = (
          <div
            key={posts.length}
            className='profile-load-more profile-load-more-disable'
          >Loading...</div>
        )
      }
      postElements.push(endElem)
      return postElements
    }
  }

  const followOnClick = async () => {
    if (followLoading) {
      return
    }
    updateFollowLoading(true)
    if (isFollowing) {
      await api.unfollow(userId)
    } else {
      await api.follow(userId)
    }
    updateIsFollowing(!isFollowing)
    updateFollowLoading(false)
  }

  const unfollowAndBlock = async () => {
    if (followLoading || blockLoading) {
      return
    }
    if (!window.confirm("The blocked user is still able to see and interact with your posts, but you won't see them in your home feed or notifications")) {
      return
    }
    updateFollowLoading(true)
    updateBlockLoading(true)
    await api.unfollow(userId)
    await api.block(userId)
    updateIsFollowing(false)
    updateIsBlocking(true)
    updateFollowLoading(false)
    updateBlockLoading(false)
  }

  const unblock = async () => {
    if (blockLoading) {
      return
    }
    updateBlockLoading(true)
    await api.unblock(userId)
    updateIsBlocking(false)
    updateBlockLoading(false)
  }

  const block = async () => {
    if (blockLoading) {
      return
    }
    if (!window.confirm("The blocked user is still able to see and interact with your posts, but you won't see them in your home feed or notifications")) {
      return
    }
    updateBlockLoading(true)
    await api.block(userId)
    updateIsBlocking(true)
    updateBlockLoading(false)
  }

  const userInfoButton = () => {
    if (!me) {
      return null
    }
    if (!userId || userId === me.id) {
      return (
        <div className='profile-info-buttons'>
          <div
            className="profile-info-button"
            onClick={() => {
              history.push(`/settings`)
            }}
          >
            Update profile & settings
          </div>
        </div>
      )
    } else {
      return (
        <div className='profile-info-buttons'>
          {!isBlocking && <div
            className={!followLoading ? "profile-info-button" : "profile-info-button profile-info-button-disabled"}
            onClick={followOnClick}
          >{isFollowing ? 'Unfollow' : 'Follow'}</div>}
          {isFollowing &&
            <PillDropdownMenu
              items={[
                {
                  text: 'Unfollow and block',
                  onClick: unfollowAndBlock
                }
              ]}
            >
              <div className="profile-more-actions-trigger">
                <DotsVerticalIcon />
              </div>
            </PillDropdownMenu>
          }
          {isBlocking && <div
            className={!blockLoading ? "profile-info-button" : "profile-info-button profile-info-button-disabled"}
            onClick={unblock}
          >Unblock</div>}
          {!isFollowing && !isBlocking &&
            <PillDropdownMenu
              items={[
                {
                  text: 'Block',
                  onClick: block
                }
              ]}
            >
              <div className="profile-more-actions-trigger">
                <DotsVerticalIcon />
              </div>
            </PillDropdownMenu>
          }
        </div>
      )
    }
  }

  let { name, subName } = getNameAndSubName(userId ? user : me)
  if (isBlocking) {
    name = `@${userId}`
    subName = undefined
  }

  const [followingCounts, updateFollowingCounts] = useState<{following_count: number, follower_count: number} | null>(null)
  useEffect(() => {
    (async () => {
      if (!me) {
        return
      }
      if (!userId || userId === me.id) {
        updateFollowingCounts(await api.getFollowingCounts())
      }
    })()
  }, [me, userId])

  const userFollowingCounts = () => {
    if (!me) {
      return null
    }
    if (!userId || userId === me.id) {
      if (followingCounts === null) {
        return null
      }
      const data = followingCounts as {following_count: number, follower_count: number}
      return (
        <div className='profile-user-following-counts'>
          <b>{data.following_count}</b> Following, <b>{data.follower_count}</b> Followers
        </div>
      )
    } else {
      return null
    }
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-user-info">
        <div className="profile-banner-wrapper" style={{
          backgroundColor: "#9dd0ff",
          backgroundImage: user ? `url(${getProfilePicUrl(user)})` : undefined
        }}/>
        <div className="profile-avatar-wrapper">
          {/* Not using RoundAvatar here because it doesn't need to be clicked + it has extra styles*/}
          <AvatarV2
            className="profile-avatar-img"
            user={!isBlocking ? user : null}
          />
        </div>
        <span className="profile-user-name">{name}</span>
        {' '}
        {subName && <span className='profile-user-id'>{`@${subName}`}</span>}
        {userFollowingCounts()}
        {userInfoButton()}
      </div>
      <div className="profile-posts">
        {profilePosts()}
      </div>
      <PillModal
        isOpen={newPostOpened}
        onClose={() => {updateNewPostOpened(false)}}
        title="New post"
      >
        <NewPost
          resharedPost={resharePost}
          updateResharedPost={updateResharePost}
          beforePosting={() => {
            updateNewPostOpened(false)
          }}
          afterPosting={(post) => {
            if (!me) {
              return
            }
            if (!userId || userId === me.id) {
              updatePosts([post, ...posts])
            }
          }}
        />
      </PillModal>
    </div>
  )
}

export default Profile
