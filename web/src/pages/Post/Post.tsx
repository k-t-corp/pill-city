import React, {useEffect, useState} from 'react'
import {useLocation, useParams} from "react-router-dom";
import PostComponent from "../../components/Post/Post";
import NewPost from "../../components/NewPost/NewPost";
import withAuthRedirect from "../../hoc/withAuthRedirect";
import api from "../../api/Api";
import {useAppSelector} from "../../store/hooks";
import MyModal from "../../components/MyModal/MyModal";
import User from "../../models/User";
import Post, {ResharedPost} from "../../models/Post";
import './Post.css'

const PostPage = () => {
  const { id: postId } = useParams<{ id: string }>()
  const me = useAppSelector(state => state.me.me)
  const meLoading = useAppSelector(state => state.me.loading)

  const [loading, updateLoading] = useState(true)
  const [post, updatePost] = useState<Post | null>(null)
  const [resharePost, updateResharePost] = useState<Post | ResharedPost | null>(null)
  const [newPostOpened, updateNewPostOpened] = useState(false)

  useEffect(() => {
    (async () => {
        updatePost(await api.getPost(postId))
        updateLoading(false)
      }
    )()
  }, [])

  let highlightCommentId: string | undefined
  const location = useLocation()
  if (location.hash) {
    highlightCommentId = location.hash.split('#comment-')[1]
  }

  const renderPost = () => {
    if (loading || meLoading) {
      return (<div className="post-status">Loading...</div>)
    }
    if (!post) {
      return (<div className="post-status">Errored loading post</div>)
    }
    return (
      <>
        <PostComponent
          data={post}
          highlightCommentId={highlightCommentId}
          me={me as User}
          detail={true}
          hasNewPostModal={true}
          updateNewPostOpened={updateMobileNewPostOpened}
          updateResharePostData={updateResharePostData}
          disableNavigateToPostPage={true}
        />
        <MyModal
          isOpen={newPostOpened}
          onClose={() => {updateNewPostOpened(false)}}
        >
          <NewPost
            resharePostData={resharePost}
            updateResharePostData={updateResharePostData}
            beforePosting={() => {
              updateMobileNewPostOpened(false)
            }}
            afterPosting={() => {}}
          />
        </MyModal>
      </>
    )
  }

  const updateResharePostData = (data: any) => {
    updateResharePost(data)
  }

  const updateMobileNewPostOpened = (opened: boolean) => {
    updateNewPostOpened(opened)
  }

  return (
    <div className='post-wrapper-page'>
      {renderPost()}
    </div>
  )
}

export default withAuthRedirect(PostPage)
