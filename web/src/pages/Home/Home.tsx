import React, {useState} from 'react';
import Post from "../../components/Post/Post";
import "./Home.css"
import NewPost from "../../components/NewPost/NewPost";
import NotificationDropdown from "../../components/NotificationDropdown/NotificationDropdown";
import {useMediaQuery} from "react-responsive";
import About from "../../components/About/About";
import PostModel from "../../models/Post"
import useInView from 'react-cool-inview'
import withApi from "../../hoc/withApi";
import withAuthRedirect from "../../hoc/withAuthRedirect";
import api from "../../api/Api";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {loadMorePosts, pollPosts} from "../../store/homeSlice";
import User from "../../models/User";
import {ResharedPost} from "../../models/Post";
import MyModal from "../../components/MyModal/MyModal";
import { PencilIcon } from '@heroicons/react/solid'

const InfiniteScrollFactor = 0.8

interface Props {
  api: any
}

const Home = (props: Props) => {
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

  let homePostElement = () => {
    if (loading || meLoading) {
      return (<div className="home-status">Loading...</div>)
    } else if (posts.length === 0) {
      return (<div className="home-status">No posts here</div>)
    } else {
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
              api={props.api}
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
      return postElements
    }
  }

  const newPostElem = (
    <NewPost
      api={props.api}
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
        {homePostElement()}
      </div>
      {isTabletOrMobile ?
        <>
          <PencilIcon
            className='mobile-new-post-button'
            onClick={() => updateMobileNewPostOpened(true)}
          />
          <MyModal
            isOpen={mobileNewPostOpened}
            onClose={() => {updateMobileNewPostOpened(false)}}
          >
            {newPostElem}
          </MyModal>
        </> :
        <div className="home-right-column-container">
          <div className="home-right-column-new-post-wrapper">
            {newPostElem}
          </div>
          <NotificationDropdown />
          <About api={props.api}/>
        </div>
      }
    </div>
  )
}

export default withApi(withAuthRedirect(Home), api)
