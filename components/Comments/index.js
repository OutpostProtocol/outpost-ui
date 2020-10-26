import React, { useState } from 'react'
import { styled } from '@material-ui/styles'
import {
  Button,
  TextField
} from '@material-ui/core'
import {
  gql,
  useMutation
} from '@apollo/client'
import { useWeb3React } from '@web3-react/core'

import { GET_POST } from '../../hooks/usePosts'
import useAuth from '../../hooks/useAuth'
import { useErrorReporting } from '../../hooks'
import LoadingBackdrop from '../LoadingBackdrop'
import Comment from './comment'
import { ERROR_TYPES } from '../../constants'

const PostComment = styled(Button)({
  float: 'right',
  'margin-top': '10px'
})

const CommentsContainer = styled('div')({
  'margin-top': '30px',
  'margin-bottom': '50px'
})

const CommentContainer = styled('div')({
  'margin-top': '20px'
})

const NewCommnet = styled(TextField)({
  width: '100%'
})

const UPLOAD_COMMENT = gql`
  mutation uploadComment($commentText: String!, $postTxId: String!, $communityTxId: String!, $timestamp: Int!) {
    uploadComment(commentText: $commentText, postTxId: $postTxId, communityTxId: $communityTxId, timestamp: $timestamp) {
      postText
      timestamp
      user {
        address
      }
    }
  }
`

const Comments = ({ comments, communityTxId, postTxId }) => {
  const [newComment, setNewComment] = useState('')
  const { active, account } = useWeb3React()
  const { authToken } = useAuth()
  const [uploadCommentToDb, { error }] = useMutation(UPLOAD_COMMENT)
  const [isUploadLoading, setIsLoading] = useState(false)
  useErrorReporting(ERROR_TYPES.mutation, error, 'UPLOAD_COMMENT')

  comments = comments || []

  const handlePostComment = async () => {
    if (!newComment || newComment === '') {
      alert('You can\'t post an empty comment!')
      return
    }

    setIsLoading(true)

    const timestamp = Math.floor(Date.now() / 1000)
    const options = {
      variables: {
        postTxId: postTxId,
        communityTxId: communityTxId,
        timestamp: timestamp,
        commentText: newComment
      },
      context: {
        headers: {
          authorization: authToken
        }
      },
      refetchQueries: [{
        query: GET_POST,
        variables: {
          txId: postTxId,
          userToken: authToken
        },
        fetchPolicy: 'network-only',
        context: {
          headers: {
            authorization: authToken
          }
        }
      }]
    }
    await uploadCommentToDb(options)

    setNewComment('')
    setIsLoading(false)
  }

  return (
    <>
      <LoadingBackdrop isLoading={isUploadLoading} />
      <CommentsContainer>
        {comments.map((comment, i) =>
          <CommentContainer key={i} >
            <Comment
              comment={comment}
            />
          </ CommentContainer>
        )
        }
      </CommentsContainer>
      { active &&
        <>
          <NewCommnet
            variant='outlined'
            multiline={true}
            rows={3}
            rowsMax={3}
            value={newComment}
            onChange={(event) => setNewComment(event?.target?.value)}
            placeholder='Enter a comment'
          />
          <PostComment
            disableElevation
            color='secondary'
            variant='contained'
            onClick={handlePostComment}
          >
            POST
          </PostComment>
        </>
      }
    </>
  )
}

export default Comments
