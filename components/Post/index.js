import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'
import htmlparse from 'html-react-parser'
import {
  gql,
  useMutation
} from '@apollo/client'
import { useWeb3React } from '@web3-react/core'

import { mutations, getRefetchPostsQuery } from '../../graphql'
import Share from '../Share'
import useAuth from '../../hooks/useAuth'
import LoadingBackdrop from '../LoadingBackdrop'
import Comments from '../Comments'
import { useErrorReporting } from '../../hooks'
import { ERROR_TYPES } from '../../constants'
import PostContext from '../PostContext'
import ConfirmDelete from './ConfirmDelete'
import ReadRequirementModal from '../ReadRequirement/ReadRequirementModal'

const DELETE_POST = gql(mutations.deletePost)

const UPDATE_READ_REQUIREMENT = gql(mutations.updateReadRequirement)

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
  'font-size': '1.2em'
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
  'border-radius': '4px'
})

const StyledHr = styled('hr')({
  width: '100%',
  border: 'none',
  height: '1px',
  'margin-top': '20px',
  'background-color': '#c4c4c4'
})

const ButtonContainer = styled('div')({})

const Post = ({ post, comments }) => {
  const { account } = useWeb3React()
  const { title, subtitle, postText, user, txId, community, readRequirement } = post
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [isUpdateRequirementOpen, setIsUpdateRequirementOpen] = useState(false)
  const [deletePostFromDb, { error }] = useMutation(DELETE_POST)
  const [updateReadRequirement] = useMutation(UPDATE_READ_REQUIREMENT)
  const { authToken } = useAuth()
  const router = useRouter()

  useErrorReporting(ERROR_TYPES.mutation, error, 'DELETE_POST')

  const isAuthor = () => {
    return account?.toLowerCase() === user.address
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
      refetchQueries: getRefetchPostsQuery(community.slug)
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
      context: {
        headers: {
          authorization: authToken
        }
      },
      refetchQueries: getRefetchPostsQuery(community.slug)
    })

    const comSlug = router.query.comSlug
    if (comSlug) router.push(`/${comSlug}`)
    else router.push('/')

    setIsLoading(false)
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
          <ButtonContainer>
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
            {community.tokenAddress &&
              <ActionButton
                onClick={() => setIsUpdateRequirementOpen(true)}
              >
                CHANGE TOKEN REQUIREMENT
              </ActionButton>
            }
          </ButtonContainer>
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
          <Share
            url={window.location.href}
            title={title}
            description={subtitle}
          />
        </SubHeader>
      </PostHeader>
      <PostContent id='blog-text'>
        {postText &&
          htmlparse(postText)
        }
      </PostContent>
      <StyledHr />
      {false &&
        <Comments
          comments={comments}
          communityTxId={community.txId}
          postTxId={txId}
        />
      }
    </PostContainer>
  )
}

export default Post
