import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@material-ui/core/styles'
import {
  Favorite,
  FavoriteBorder,
  ChatBubble,
  Close
} from '@material-ui/icons'
import {
  Button,
  Dialog,
  IconButton
} from '@material-ui/core'
import htmlparse from 'html-react-parser'
import {
  gql,
  useMutation
} from '@apollo/client'

import Share from '../Share'
import useAuth from '../../hooks/useAuth'
import LoadingBackdrop from '../LoadingBackdrop'
import Comments from '../Comments'
import { GET_POSTS, GET_POST } from '../../hooks/usePosts'
import { useErrorReporting } from '../../hooks'
import { ERROR_TYPES } from '../../constants'
import PostContext from '../PostContext'

const PostContainer = styled('div')({
  padding: '10px',
  marginTop: '5px',
  'border-radius': '4px'
})

const PostMetaData = styled('span')({
  display: 'block'
})

const PostContent = styled('div')({
  marginTop: '5vh',
  'margin-bottom': '17px',
  'line-height': '1.5em',
  'font-size': '1.1em'
})

const PostHeader = styled('div')({
  height: '100%',
  'align-items': 'center',
  'margin-top': '10px'
})

const Title = styled('h1')({
  margin: 0,
  'font-size': '40px'
})

const TitleContainer = styled('div')({
  display: 'flex',
  'margin-bottom': '10px'
})

const SubHeader = styled('div')({
  display: 'flex',
  'justify-content': 'space-between'
})

const ActionButton = styled(Button)({
  height: '40px',
  margin: '10px',
  'font-size': '1rem'
})

const EditMessage = styled('div')({
  'font-style': 'italic',
  margin: '10px 15px 0'
})

const AuthorActions = styled('div')({
  border: '1px solid #ccc',
  'border-radius': '4px',
  'margin-top': '20px'
})

const StyledHr = styled('hr')({
  width: '100%',
  border: 'none',
  height: '1px',
  'margin-top': '20px',
  'background-color': '#c4c4c4'
})

const LikesAndComments = styled('div')({
  display: 'flex',
  alignItems: 'center'
})

const CommentCount = styled(ChatBubble)({
  marginLeft: '10px',
  marginRight: '10px'
})

const Confirm = styled(Button)({
  marginRight: '10px'
})

const ModalContainer = styled(Dialog)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

const ExitButton = styled(IconButton)({
  width: '40px',
  height: '40px',
  padding: 0,
  position: 'absolute',
  top: '5px',
  right: '5px'
})

const DeleteContainer = styled('div')({
  padding: '15px',
  marginTop: '15px',
  'text-align': 'center'
})

const IncrLikesButton = styled(IconButton)({
  padding: '10px',
  margin: '0px',
  '&:hover': {
    background: 'none'
  }
})

const LikeCount = styled(Favorite)({
  padding: '10px'
})

const DELETE_POST = gql`
    mutation deletePost($txId: String!) {
      deletePost(txId: $txId)
    }
  `

const INCREMENT_FAVORITES = gql`
    mutation incrementFavorites($txId: String!) {
      incrementFavorites(txId: $txId)
    }
`

const ConfirmDelete = ({ isOpen, handleClose, handleDelete }) => {
  return (
    <ModalContainer
      open={isOpen}
      onClose={handleClose}
    >
      <DeleteContainer>
        <ExitButton
          onClick={handleClose}
        >
          <Close />
        </ExitButton>
        <p>
          Are you sure you want to delete this post?
        </p>
        <Confirm
          disableElevation
          color='primary'
          variant='contained'
          onClick={handleDelete}
        >
          DELETE
        </Confirm>
      </DeleteContainer>
    </ ModalContainer >
  )
}

const Post = ({ post, comments }) => {
  const { title, subtitle, postText, /* user, */ txId, community, favoriteCount, commentCount } = post
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [deletePostFromDb, { error }] = useMutation(DELETE_POST)
  const [incrementFavorites] = useMutation(INCREMENT_FAVORITES)
  const { authToken } = useAuth()
  const router = useRouter()

  useErrorReporting(ERROR_TYPES.mutation, error, 'DELETE_POST')
  const isAuthor = () => {
    return true
  }

  const handleEdit = () => {
    router.push({ pathname: '/editor', query: { txId } })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await deletePostFromDb({
      variables: {
        txId
      },
      refetchQueries: [{ query: GET_POSTS }]
    })

    const comSlug = router.query.comSlug
    if (comSlug) router.push(`/${comSlug}`)
    else router.push('/')

    setIsDeleting(false)
  }

  const incrFavorites = async () => {
    setHasLiked(true)
    await incrementFavorites({
      variables: {
        txId
      },
      context: {
        headers: {
          authorization: authToken
        }
      },
      refetchQueries: [{
        query: GET_POST,
        variables: {
          txId,
          userToken: authToken
        },
        fetchPolicy: 'network-only',
        context: {
          headers: {
            authorization: authToken
          }
        }
      }]
    })
  }

  return (
    <PostContainer>
      <ConfirmDelete
        isOpen={isConfirmDeleteOpen}
        handleClose={() => setIsConfirmDeleteOpen(false)}
        handleDelete={handleDelete}
      />
      <LoadingBackdrop isLoading={isDeleting} />
      { isAuthor() &&
        <AuthorActions>
          <EditMessage>Only you can see this message.</EditMessage>
          <ActionButton
            onClick={handleEdit}
          >
            EDIT POST
          </ActionButton>
          <ActionButton
            onClick={() => setIsConfirmDeleteOpen(true)}
          >
            DELETE POST
          </ActionButton>
        </AuthorActions>
      }
      <PostHeader>
        <PostMetaData>
          <TitleContainer>
            <Title color='primary'>
              {title}
            </Title>
          </TitleContainer>
        </PostMetaData>
        <SubHeader>
          <PostContext
            user={post.user}
            communityName={post.community.name}
            timestamp={post.timestamp}
          />
          <LikesAndComments>
            { hasLiked ? (
              <>
                <LikeCount /> { favoriteCount }
              </>
            ) : (
              <>
                <IncrLikesButton
                  onClick={incrFavorites}
                >
                  <FavoriteBorder />
                </IncrLikesButton> { favoriteCount }
              </>
            )}
            <CommentCount /> { commentCount }
          </LikesAndComments>
          <Share
            url={window.location.href}
            title={title}
            description={subtitle}
          />
        </SubHeader>
      </PostHeader>
      <PostContent id='blog-text'>
        {
          htmlparse(postText)
        }
      </PostContent>
      <StyledHr />
      <Comments
        comments={comments}
        communityTxId={community.txId}
        postTxId={txId}
      />
    </PostContainer>
  )
}

export default Post
