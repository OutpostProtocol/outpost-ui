import React, {
  useState,
  useEffect
} from 'react'
import { useRouter } from 'next/router'
import { styled } from '@material-ui/core/styles'
import showdown from 'showdown'
import {
  gql,
  useMutation
} from '@apollo/client'
import dynamic from 'next/dynamic'

import { mutations } from '../graphql'
import { useAccountRoles } from '../context/Role'
import useAuth from '../hooks/useAuth'
import Toolbar from '../components/Toolbar'
import {
  useOnePost,
  GET_POSTS
} from '../hooks/usePosts'
import LoadingBackdrop from '../components/LoadingBackdrop'
import SEO from '../components/seo'
import { PLACEHOLDER_COMMUNITY } from '../constants'
import CommunitySelector from '../components/Editor/CommunitySelector'
import PostActions from '../components/Editor/PostActions'
import EditorPreview from '../components/Editor/EditorPreview'

const ContentEditor = dynamic(import('../components/Editor/ContentEditor'), { ssr: false, loading: () => <LoadingBackdrop isLoading={true} /> })

const converter = new showdown.Converter()

const EditorContainer = styled('div')({
  width: '50vw',
  margin: '0 auto 10vh'
})

const PreviewContainer = styled('div')({
  height: '3em',
  'margin-top': '30px'
})

const UPLOAD_POST = gql(mutations.uploadPost)

const EditorPage = () => {
  const { authToken, fetchToken } = useAuth()
  const router = useRouter()
  const { postData, loading } = useOnePost(router.query?.txId, authToken)
  const isEditingMode = router.query?.txId !== undefined
  const roles = useAccountRoles()
  const [activeCommunity, setActiveCommunity] = useState(PLACEHOLDER_COMMUNITY)
  const [communities, setCommunities] = useState([])
  const [title, setTitle] = useState('')
  const [featuredImage, setFeaturedImage] = useState(undefined)
  const [subtitle, setSubtitle] = useState('')
  const [postText, setPostText] = useState('')
  const [isWaitingForUpload, setIsWaiting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [uploadPostToDb] = useMutation(UPLOAD_POST, {
    context: {
      headers: {
        authorization: authToken
      }
    },
    onError: async (e) => {
      if (e.message.includes('User not authenticated')) {
        await fetchToken()
        await handlePost()
      }
    },
    onCompleted: (res) => {
      const slug = activeCommunity.slug
      if (slug && res?.uploadPost?.txId) router.push(`/${slug}/post/${res.uploadPost.txId}`)
      else router.push('/')
    }
  })

  useEffect(() => { // Load post and populate fields
    const post = postData?.post
    if (post && !loading) {
      setTitle(post.title)
      setSubtitle(post.subtitle)
      setFeaturedImage(post.featuredImg)
      setPostText(post.postText)
      setActiveCommunity(post.community)
    } else if (Array.isArray(communities) && communities.length === 1) {
      const [community] = communities
      setActiveCommunity(community)
    }
  }, [postData, loading, communities, setActiveCommunity])

  useEffect(() => {
    const coms = {}
    roles.forEach(r => {
      coms[r.community.name] = r.community
    })

    setCommunities(Object.values(coms))
  }, [roles])

  const handlePost = async () => {
    if (!isValidPost) return
    setIsWaiting(true)
    const parsedPost = converter.makeHtml(postText.replace(/\\/g, '<br/>'))
    const timestamp = postData?.timestamp || Math.floor(Date.now() / 1000)
    const postUpload = {
      title: title,
      subtitle: subtitle,
      postText: parsedPost,
      canonicalLink: null,
      parentTxId: router.query?.txId,
      timestamp: timestamp,
      featuredImg: featuredImage
    }

    await handleUpload(postUpload)

    setIsWaiting(false)
  }

  const handleUpload = async (postUpload) => {
    const comTxId = postData?.post?.community?.txId || activeCommunity.txId

    const options = {
      variables: {
        postUpload: postUpload,
        communityTxId: comTxId
      },
      refetchQueries: [{ query: GET_POSTS }]
    }

    await uploadPostToDb(options)
  }

  const isValidPost = () => {
    if (postText === '') {
      alert('This post has no text.')
      return false
    } else if (title === '') {
      alert('You must create a title for your post')
      return false
    } else if (activeCommunity.txId === PLACEHOLDER_COMMUNITY.txId) {
      alert('Select a publication')
      return false
    } else if (subtitle === '') {
      alert('This post has no subtitle')
      return false
    }

    return true
  }

  return (
    <>
      <Toolbar />
      <SEO
        title="Post Editor"
      />
      <LoadingBackdrop isLoading={isWaitingForUpload} />
      <EditorContainer>
        {showPreview
          ? <EditorPreview
            title={title}
            subtitle={subtitle}
            postText={postText}
          />
          : <ContentEditor
            title={title}
            subtitle={subtitle}
            postText={postText}
            featuredImg={featuredImage}
            setTitle={setTitle}
            setSubtitle={setSubtitle}
            setPostText={setPostText}
            setFeaturedImage={setFeaturedImage}
            isEditing={isEditingMode}
          />
        }
        <PreviewContainer>
          { !(postData?.post?.community?.txId) &&
          <CommunitySelector
            setActiveCommunity={setActiveCommunity}
            activeCommunity={activeCommunity}
            communities={communities}
            placeHolder={PLACEHOLDER_COMMUNITY}
            disabled={isEditingMode}
          />
          }
          <PostActions
            setShowPreview={setShowPreview}
            showPreview={showPreview}
            handlePost={handlePost}
          />
        </PreviewContainer>
      </EditorContainer>
    </>
  )
}

export default EditorPage
