import React, {useEffect, useState} from 'react';
import Post from "../../components/Post/Post";
import "./Home.css"
import NewPost from "../../components/NewPost/NewPost";
import NotificationDropdown from "../../components/NotificationDropdown/NotificationDropdown";
import {useMediaQuery} from "react-responsive";
import MobileNewPost from "../../components/MobileNewPost/MobileNewPost";
import About from "../../components/About/About";
import PostModel from "../../models/Post"
import User from "../../models/User";
import useInView from 'react-cool-inview'
import withApi from "../../hoc/withApi";
import withAuthRedirect from "../../hoc/withAuthRedirect";
import withNavBar from "../../hoc/withNavBar/withNavBar";
import api from "../../api/Api";

const InfiniteScrollFactor = 0.8

interface Props {
  api: any
  postsLoading: boolean,
  posts: PostModel[],
  postsLoadingMore: boolean
  postsPolling: boolean,
  postsNoMore: boolean,
  pollPosts: () => Promise<void>,
  loadMorePosts: () => Promise<void>
}

const Home = (props: Props) => {
  const { posts } = props

  const [me, updateMe] = useState<User | null>(null)
  const [meLoading, updateMeLoading] = useState(true)
  const [resharePostData, updateResharePostData] = useState<PostModel | null>(null)
  const [mobileNewPostOpened, updateMobileNewPostOpened] = useState(false)

  const isTabletOrMobile = useMediaQuery({query: '(max-width: 750px)'})
  const { observe } = useInView({
    rootMargin: "50px 0px",
    onEnter: async ({ unobserve, observe }) => {
      unobserve()
      await props.loadMorePosts()
      observe()
    }
  })

  useEffect(() => {
    (async () => {
      updateMe(await props.api.getMe())
      updateMeLoading(false)
    })()
  }, [])

  let homePostElement = () => {
    if (props.postsLoading || meLoading) {
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
              me={me}
              api={props.api}
              detail={false}
              hasNewPostModal={isTabletOrMobile}
              updateResharePostData={updateResharePostData}
              newPostOpened={mobileNewPostOpened}
              updateNewPostOpened={updateMobileNewPostOpened}
            />
          </div>
        )
      }
      let endElem;
      if (props.postsNoMore) {
        endElem = (
          <div
            key={posts.length}
            className='home-load-more home-load-more-disabled'
          >No more new posts</div>
        )
      }
      else if (props.postsLoadingMore) {
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
            onClick={props.loadMorePosts}
          >Load more</div>
        )
      }
      postElements.push(endElem)
      return postElements
    }
  }

  return (
    <div className="home-wrapper">
      <div className="home-posts-wrapper">
        {homePostElement()}
      </div>
      {isTabletOrMobile &&
        <MobileNewPost
          api={props.api}
          resharePostData={resharePostData}
          updateResharePostData={updateResharePostData}
          newPostOpened={mobileNewPostOpened}
          updateNewPostOpened={updateMobileNewPostOpened}
          beforePosting={() => {
            updateMobileNewPostOpened(false)
          }}
          afterPosting={props.pollPosts}
        />
      }
      {!isTabletOrMobile &&
        <div className="home-right-column-container">
          <NewPost
            api={props.api}
            resharePostData={resharePostData}
            updateResharePostData={updateResharePostData}
            beforePosting={() => {}}
            afterPosting={props.pollPosts}
          />
          <NotificationDropdown api={props.api}/>
          <About api={props.api}/>
        </div>
      }
    </div>
  )
}

export default withApi(withAuthRedirect(withNavBar(Home, '/')), api)