import React, { useState, useEffect } from 'react'
import { styled } from '@material-ui/core/styles'
import { CircularProgress } from '@material-ui/core'
import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/router'
import axios from 'axios'

import { CommunityProvider } from '../../../context/Community'
import { SubscriptionProvider } from '../../../context/Subscription'
import SubscriptionContainer from '../../../components/SubscriptionContainer'
import useAuth from '../../../hooks/useAuth'
import { useOnePost } from '../../../hooks/usePosts'
import Post from '../../../components/Post'
import Toolbar from '../../../components/Toolbar'
import SEO from '../../../components/seo'

import { queries } from '../../../graphql'

const PostContainer = styled('div')({
  margin: '5em 0',
  padding: '0 20px',
  '@media only screen and (min-width: 700px)': {
    padding: '0 20vw 10vh',
    margin: '10vh auto',
    'max-width': '1000px'
  }
})

const IframeContainer = styled('div')({
  margin: '3em auto',
  'flex-direction': 'column',
  width: '95%',
  display: 'flex',
  'justify-content': 'space-between',
  'align-items': 'center',
  'font-size': '30px',
  'text-align': 'center',
  '@media only screen and (min-width: 800px)': {
    'flex-direction': 'row',
    width: '80%'
  }
})

const MessageContainer = styled('div')({
  padding: '0.5em',
  'max-width': '100vw',
  '@media only screen and (min-width: 800px)': {
    'max-width': '30%'
  }
})

const Message = styled('div')({
  'margin-bottom': '30px'
})

const SignInMessage = styled('div')({
  height: '100vh',
  'text-align': 'center',
  'font-size': '30px',
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'center'
})

const LoginProgressContainer = styled('div')({
  margin: '15vh 15vw',
  display: 'flex',
  'align-items': 'center',
  height: '70vh',
  'justify-content': 'center'
})

const PostPage = ({ postPreview, community }) => {
  const router = useRouter()
  const { txId } = router.query
  const { account } = useWeb3React()
  const { authToken } = useAuth()

  if ((!account || !authToken) && postPreview.readRequirement) {
    return (
      <PostLayout
        context={postPreview}
        community={community}
      >
        <SignInMessage>
          <div>
            You must sign in to view this post ➚
          </div>
        </SignInMessage>
      </PostLayout>
    )
  }

  return (
    <PostLayout
      context={postPreview}
      community={community}
    >
      <LoggedInPost
        txId={txId}
        community={community}
      />
    </PostLayout>
  )
}

const PostLayout = ({ children, context, community }) => {
  const router = useRouter()
  const { title, subtitle, featuredImg } = context || {}

  return (
    <CommunityProvider
      community={community}
    >
      <SubscriptionProvider>
        <SEO
          title={title}
          description={subtitle}
          image={featuredImg}
        />
        <Toolbar
          prevUrl={router.query.comSlug}
        />
        <>
          {children}
        </>
      </SubscriptionProvider>
    </CommunityProvider>
  )
}

const LoggedInPost = ({ backPath, txId }) => {
  const { authToken, fetchToken } = useAuth()
  const [refetchedCalled, setRefetchCalled] = useState(false)
  const { postData, loading, error, refetch } = useOnePost(txId, authToken)
  const { account } = useWeb3React()

  useEffect(() => {
    const handleRefetch = async () => {
      await fetchToken()
      await refetch()
      setRefetchCalled(false)
    }

    if (error && !refetchedCalled && error.message.includes('User not authenticated')) {
      setRefetchCalled(true)
      handleRefetch()
    }
  }, [error, fetchToken, refetchedCalled, refetch])

  if (loading) {
    return (
      <LoginProgressContainer>
        <CircularProgress />
      </LoginProgressContainer>
    )
  }

  const { post, comments, hasSubscription } = postData
  const isAuthor = post.user.address.toLowerCase() === account?.toLowerCase()

  if (!hasSubscription && !isAuthor) {
    return (
      <IframeContainer>
        <SubscriptionContainer />
      </ IframeContainer>
    )
  }

  return (
    <PostContainer>
      <Post
        post={post}
        comments={comments}
      />
    </PostContainer>
  )
}

export async function getServerSideProps (context) {
  const OUTPOST_API = process.env.NEXT_PUBLIC_OUTPOST_API
  const { txId, comSlug } = context.params

  const query = queries.postPage

  const res = await axios.post(`${OUTPOST_API}/graphql`, {
    query,
    variables: {
      txId,
      slug: comSlug
    }
  })

  const { postPreview, community } = res.data.data

  return {
    props: {
      postPreview,
      community
    }
  }
}

export default PostPage
