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

const InfiniteScrollBefore = 5

const Profile = () => {
  const { id: userId } = useParams<{id?: string}>()
  const me = useAppSelector(state => state.me.me)
  const meLoading = useAppSelector(state => state.me.loading)

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

  const history = useHistory()

  useEffect(() => {
    (async () => {
      if (meLoading) {
        return
      }
      if (!userId) {
        updateUser(me)
        updatePosts(await api.getProfile((me as User).id))
        updatePostsLoading(false)
        updateFollowLoading(false)
      } else {
        let user
        try {
          user = await api.getUser(userId)
          updateUser(user)
          updateIsFollowing(user.is_following)
          updatePosts(await api.getProfile(userId))
          updatePostsLoading(false)
          updateFollowLoading(false)
        } catch (e) {
          if (e instanceof ApiError && e.statusCode === 404) {
            updateUserNotFound(true)
          } else {
            throw e
          }
        }
      }
    })()
  }, [meLoading])

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
    } else if (postsLoading) {
      return (<div className="profile-status">Loading...</div>)
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
              data={post}
              me={me as User}
              updateResharePostData={updateResharePost}
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

  const userInfoButton = () => {
    if (meLoading) {
      return null
    }
    if (!userId || userId === (me as User).id) {
      return (
        <div
          className="profile-info-button"
          onClick={() => {
            history.push(`/settings`)
          }}
        >
          Update profile & settings
        </div>
      )
    } else {
      return (
        <div
          className={!followLoading ? "profile-info-button" : "profile-info-button profile-info-button-disabled"}
          onClick={followOnClick}
        >{isFollowing ? 'Unfollow' : 'Follow'}</div>
      )
    }
  }

  const { name, subName } = getNameAndSubName(userId ? user : me)

  const [followingCounts, updateFollowingCounts] = useState<{following_count: number, follower_count: number} | null>(null)
  useEffect(() => {
    (async () => {
      if (meLoading) {
        return
      }
      if (!userId || userId === (me as User).id) {
        updateFollowingCounts(await api.getFollowingCounts())
      }
    })()
  }, [meLoading])

  const userFollowingCounts = () => {
    if (meLoading) {
      return null
    }
    if (!userId || userId === (me as User).id) {
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
            user={user}
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
          resharePostData={resharePost}
          updateResharePostData={updateResharePost}
          beforePosting={() => {
            updateNewPostOpened(false)
          }}
          afterPosting={(post) => {
            if (!userId || userId === (me as User).id) {
              updatePosts([post, ...posts])
            }
          }}
        />
      </PillModal>
    </div>
  )
}

export default Profile
