import React, {useState} from 'react';
import Post from "../../components/Post/Post";
import NewPost from "../../components/NewPost/NewPost";
import NotificationDropdown from "../../components/NotificationDropdown/NotificationDropdown";
import {useMediaQuery} from "react-responsive";
import About from "../../components/About/About";
import PostModel from "../../models/Post"
import useInView from 'react-cool-inview'
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {loadMorePosts, pollPosts} from "../../store/homeSlice";
import User from "../../models/User";
import {ResharedPost} from "../../models/Post";
import PillModal from "../../components/PillModal/PillModal";
import { PencilIcon } from '@heroicons/react/solid';
import Masonry from 'react-masonry-css'
import "./Home.css"
import {getUseMultiColumn} from "../../utils/SettingsStorage";

const InfiniteScrollFactor = 0.8

const Home = () => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(state => state.home.posts)
  const loading = useAppSelector(state => state.home.loading)
  const loadingMore = useAppSelector(state => state.home.loadingMore)
  const noMore = useAppSelector(state => state.home.noMore)
  const me = useAppSelector(state => state.me.me)
  const meLoading = useAppSelector(state => state.me.loading)

  const [resharePostData, updateResharePostData] = useState<PostModel | ResharedPost | null>(null)
  const [mobileNewPostOpened, updateMobileNewPostOpened] = useState(false)

  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})
  const { observe } = useInView({
    rootMargin: "50px 0px",
    onEnter: async ({ unobserve, observe }) => {
      unobserve()
      await dispatch(loadMorePosts())
      observe()
    }
  })

  if (loading || meLoading) {
    return (
      <div className="home-wrapper">
        <div className="home-status">Loading...</div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="home-wrapper">
        <div className="home-status">No posts here</div>
      </div>
    )
  }

  let postElements = []
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]
    postElements.push(
      <div
        // need to use post ID instead of index as key
        // otherwise comments and reactions will be shifted after a new post is prepended
        key={post.id}
        ref={i === Math.floor(posts.length * InfiniteScrollFactor) - 1 ? observe : null}
      >
        <Post
          data={post}
          me={me as User}
          detail={false}
          hasNewPostModal={isTabletOrMobile}
          updateResharePostData={updateResharePostData}
          updateNewPostOpened={updateMobileNewPostOpened}
        />
      </div>
    )
  }
  let endElem;
  if (noMore) {
    endElem = (
      <div
        key={posts.length}
        className='home-load-more home-load-more-disabled'
      >No more new posts</div>
    )
  }
  else if (loadingMore) {
    endElem = (
      <div
        key={posts.length}
        className='home-load-more home-load-more-disabled'
      >Loading...</div>
    )
  } else {
    endElem = (
      <div
        key={posts.length}
        className='home-load-more'
        onClick={async () => {
          await dispatch(loadMorePosts())
        }}
      >Load more</div>
    )
  }
  postElements.push(endElem)

  const newPostElem = (
    <NewPost
      resharePostData={resharePostData}
      updateResharePostData={updateResharePostData}
      beforePosting={() => {
        updateMobileNewPostOpened(false)
      }}
      afterPosting={async () => {
        await dispatch(pollPosts())
      }}
    />
  )

  return (
    <div className="home-wrapper">
      <div className="home-posts-wrapper">
        <Masonry
          breakpointCols={getUseMultiColumn() ? {
            default: 4,
            3350: 4,
            2450: 3,
            1650: 2,
            950: 1,
          } : 1}
          className="home-posts-masonry-grid"
          columnClassName="home-posts-masonry-grid_column"
        >
          {postElements}
        </Masonry>
      </div>
      {isTabletOrMobile ?
        <>
          <div
            className='mobile-new-post-button'
            onClick={() => updateMobileNewPostOpened(true)}
          >
            <PencilIcon />
          </div>
          <PillModal
            isOpen={mobileNewPostOpened}
            onClose={() => {updateMobileNewPostOpened(false)}}
          >
            {newPostElem}
          </PillModal>
        </> :
        <div className="home-right-column-container">
          <div className="home-right-column-new-post-wrapper">
            {newPostElem}
          </div>
          <NotificationDropdown />
          <About/>
        </div>
      }
    </div>
  )
}

export default Home
