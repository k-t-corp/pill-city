import React, {useEffect, useState} from 'react'
import {useLocation, useParams} from "react-router-dom";
import PostComponent from "../../components/Post/Post";
import NewPost from "../../components/NewPost/NewPost";
import api from "../../api/Api";
import {useAppSelector} from "../../store/hooks";
import PillModal from "../../components/PillModal/PillModal";
import Post, {ResharedPost} from "../../models/Post";
import './Post.css'

const PostPage = () => {
  const { id: postId } = useParams<{ id: string }>()
  const me = useAppSelector(state => state.me.me)

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
    if (loading || !me) {
      return (<div className="post-status">Loading...</div>)
    }
    if (!post) {
      return (<div className="post-status">Errored loading post</div>)
    }
    return (
      <>
        <PostComponent
          post={post}
          highlightCommentId={highlightCommentId}
          me={me}
          detail={true}
          hasNewPostModal={true}
          updateNewPostOpened={updateMobileNewPostOpened}
          updateResharedPost={updateResharePostData}
          disableNavigateToPostPage={true}
        />
        <PillModal
          isOpen={newPostOpened}
          onClose={() => {updateNewPostOpened(false)}}
          title="New post"
        >
          <NewPost
            resharedPost={resharePost}
            updateResharedPost={updateResharePostData}
            beforePosting={() => {
              updateMobileNewPostOpened(false)
            }}
            afterPosting={() => {}}
          />
        </PillModal>
      </>
    )
  }

  const updateResharePostData = (resharedPost: any) => {
    updateResharePost(resharedPost)
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

export default PostPage
