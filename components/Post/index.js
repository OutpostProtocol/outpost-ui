import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@material-ui/core/styles'
import { Close } from '@material-ui/icons'
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
import { useCommunity } from '../../context/Community'
import ReadRequirement from '../ReadRequirement/index.tsx'

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
  alignItems: 'center',
  position: 'relative',
  marginLeft: 'auto',
  marginRight: '10px'
})

const CommentCount = styled('img')({
  width: '40px',
  height: '40px',
  objectFit: 'contain'
})

const Confirm = styled(Button)({
  margin: 'auto',
  display: 'block'
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

const ContentContainer = styled('div')({
  padding: '15px',
  marginTop: '25px',
  'text-align': 'center'
})

const IncrLikesButton = styled(IconButton)({
  margin: '0px',
  zIndex: 1000,
  '&:hover': {
    background: 'none'
  }
})

const Favorite = styled('img')({
  width: '30px',
  height: '30px',
  objectFit: 'contain'
})

const SmallText = styled('p')({
  fontSize: '12px',
  fontWeight: '90'
})

const FavoriteCountContainer = styled('div')({
  textAlign: 'center',
  width: '40px',
  position: 'absolute',
  right: 27,
  transform: 'translateX(-50%)'
})

const CommentCountContainer = styled('div')({
  textAlign: 'center',
  width: '40px',
  position: 'absolute',
  right: -20,
  transform: 'translateX(-50%)'
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

const UPDATE_READ_REQUIREMENT = gql`
    mutation updateReadRequirement($txId: String!, $readRequirement: Int!) {
      updateReadRequirement(txId: $txId, readRequirement: $readRequirement)
    }
`

const ReadRequirementModal = ({ isOpen, handleClose, handleUpdate, initialReadRequirement }) => {
  const [readRequirement, setReadRequirement] = useState(initialReadRequirement)
  const community = useCommunity()

  return (
    <ModalContainer
      open={isOpen}
      onClose={handleClose}
    >
      <ContentContainer>
        <ExitButton
          onClick={handleClose}
        >
          <Close />
        </ExitButton>
        <ReadRequirement
          readRequirement={readRequirement}
          setReadRequirement={setReadRequirement}
          tokenSymbol={community.tokenSymbol}
        />
        <Confirm
          disableElevation
          color='primary'
          variant='contained'
          onClick={() => handleUpdate(readRequirement)}
        >
          UPDATE
        </Confirm>
      </ContentContainer>
    </ ModalContainer >
  )
}

const ConfirmDelete = ({ isOpen, handleClose, handleDelete }) => {
  return (
    <ModalContainer
      open={isOpen}
      onClose={handleClose}
    >
      <ContentContainer>
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
      </ContentContainer>
    </ ModalContainer >
  )
}

const Post = ({ post, comments }) => {
  const { title, subtitle, postText, /* user, */ txId, community, favoriteCount, commentCount, readRequirement } = post
  const [isLoading, setIsLoading] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [isUpdateRequirementOpen, setIsUpdateRequirementOpen] = useState(false)
  const [deletePostFromDb, { error }] = useMutation(DELETE_POST)
  const [incrementFavorites] = useMutation(INCREMENT_FAVORITES)
  const [updateReadRequirement] = useMutation(UPDATE_READ_REQUIREMENT)
  const { authToken } = useAuth()
  const router = useRouter()

  useErrorReporting(ERROR_TYPES.mutation, error, 'DELETE_POST')
  const isAuthor = () => {
    return true
  }

  const handleEdit = () => {
    router.push({ pathname: '/editor', query: { txId } })
  }

  const handleUpdateReadRequirement = async (readRequirement) => {
    setIsLoading(true)

    let parsedReadRequirement = Number(readRequirement)
    if (Number.isNaN(parsedReadRequirement)) parsedReadRequirement = undefined

    await updateReadRequirement({
      variables: {
        txId,
        readRequirement: parsedReadRequirement
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
        context: {
          headers: {
            authorization: authToken
          }
        }
      }]
    })

    setIsUpdateRequirementOpen(false)
    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    await deletePostFromDb({
      variables: {
        txId
      },
      refetchQueries: [{ query: GET_POSTS }]
    })

    const comSlug = router.query.comSlug
    if (comSlug) router.push(`/${comSlug}`)
    else router.push('/')

    setIsLoading(false)
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
      <ReadRequirementModal
        isOpen={isUpdateRequirementOpen}
        handleClose={() => setIsUpdateRequirementOpen(false)}
        handleUpdate={handleUpdateReadRequirement}
        initialReadRequirement={readRequirement}
      />
      <LoadingBackdrop isLoading={isLoading} />
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
          <ActionButton
            onClick={() => setIsUpdateRequirementOpen(true)}
          >
            CHANGE READ REQUIREMENT
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
              <IncrLikesButton disabled={true}>
                <Favorite src='../../posts/heartFilled.svg' />
              </IncrLikesButton>
            ) : (
              <>
                <IncrLikesButton
                  onClick={incrFavorites}
                >
                  <Favorite src='../../posts/heart.svg' />
                </IncrLikesButton> <FavoriteCountContainer> <SmallText> { favoriteCount } </SmallText> </FavoriteCountContainer>
              </>
            )}
            <CommentCount src='../../posts/chatBubble.svg' /> <CommentCountContainer> <SmallText> { commentCount } </SmallText> </CommentCountContainer>
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
