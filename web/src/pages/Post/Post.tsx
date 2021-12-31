import React, {useEffect, useState} from 'react'
import {useLocation, useParams} from "react-router-dom";
import PostComponent from "../../components/Post/Post";
import NewPost from "../../components/NewPost/NewPost";
import withApi from "../../hoc/withApi";
import withAuthRedirect from "../../hoc/withAuthRedirect";
import withNavBar from "../../hoc/withNavBar/withNavBar";
import api from "../../api/Api";
import {useAppSelector} from "../../store/hooks";
import MyModal from "../../components/MyModal/MyModal";
import User from "../../models/User";
import Post, {ResharedPost} from "../../models/Post";
import './Post.css'

interface Props {
  api: any
}

const PostPage = (props: Props) => {
  const { id: postId } = useParams<{ id: string }>()
  const me = useAppSelector(state => state.me.me)
  const meLoading = useAppSelector(state => state.me.loading)

  const [loading, updateLoading] = useState(true)
  const [post, updatePost] = useState<Post | null>(null)
  const [resharePost, updateResharePost] = useState<Post | ResharedPost | null>(null)
  const [newPostOpened, updateNewPostOpened] = useState(false)

  useEffect(() => {
    (async () => {
        updatePost(await props.api.getPost(postId))
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
          api={props.api}
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
            api={props.api}
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

export default withApi(withAuthRedirect(withNavBar(PostPage, '/post')), api)
