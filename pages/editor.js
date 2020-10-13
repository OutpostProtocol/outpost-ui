import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@material-ui/core/styles'
import { useWeb3React } from '@web3-react/core'
import showdown from 'showdown'
import {
  gql,
  useMutation
} from '@apollo/client'
import dynamic from 'next/dynamic'

import Toolbar from '../components/Toolbar'
import { GET_POSTS } from '../hooks/usePosts'
import { isValidURL } from '../utils'
import LoadingBackdrop from '../components/LoadingBackdrop'
import SEO from '../components/seo'
import CommunitySelector from '../components/CommunitySelector'
import {
  PLACEHOLDER_COMMUNITY,
  ERROR_TYPES
} from '../constants'
import PostActions from '../components/Editor/PostActions'
import EditorPreview from '../components/Editor/EditorPreview'
import CanonicalLinkOption from '../components/Editor/CanonicalLinkOption'

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

const WarningText = styled('div')({
  color: '#FF5252'
})

const UPLOAD_POST = gql`
  mutation UploadPost($postUpload: PostUpload!, $ethAddr: String!, $communityTxId: String!) {
    uploadPost(postUpload: $postUpload, ethAddr: $ethAddr, communityTxId: $communityTxId) {
      txId
      title
      postText
      subtitle
      timestamp
      canonicalLink
      community {
        name
      }
      user {
        address
      }
    }
  }
`

const EditorPage = () => {
  const router = useRouter()
  const isEditingMode = false
  const postTemplate = false
  const placeholderCommunity = PLACEHOLDER_COMMUNITY

  const { account } = useWeb3React()
  const [postText, setPostText] = useState(postTemplate?.postText || '')
  const [communityId, setCommunityId] = useState(placeholderCommunity.txId)
  const [title, setTitle] = useState(postTemplate?.title)
  const [subtitle, setSubtitle] = useState(postTemplate?.subtitle)
  const [featuredImage, setFeaturedImage] = useState(postTemplate?.featuredImage)
  const [isWaitingForUpload, setIsWaiting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [hasCanonicalLink, setHasLink] = useState(false)
  const [canonicalLink, setCanonicalLink] = useState('')
  const [slug, setSlug] = useState('')
  const [uploadPostToDb, { error }] = useMutation(UPLOAD_POST)

  const handleCommunitySelection = (event) => {
    if (event?.target?.value) {
      setSlug(event.target.value.slug)
      setCommunityId(event.target.value.txId)
    }
  }

  const handlePost = async () => {
    if (!isValidPost) return
    setIsWaiting(true)
    const parsedPost = converter.makeHtml(postText.replace(/\\/g, '<br/>'))
    const timestamp = Math.floor(Date.now() / 1000)
    const postUpload = {
      title: title,
      subtitle: subtitle,
      postText: parsedPost,
      canonicalLink: canonicalLink,
      // parentTxId: postTemplate?.transaction.txId,
      timestamp: timestamp,
      featuredImg: featuredImage
    }

    await handleUpload(postUpload)

    setIsWaiting(false)
  }

  const handleUpload = async (postUpload) => {
    const options = {
      variables: {
        postUpload: postUpload,
        ethAddr: account,
        communityTxId: communityId
      },
      refetchQueries: [{ query: GET_POSTS }]
    }

    const res = await uploadPostToDb(options)
    if (slug && res?.data?.uploadPost?.txId) router.push(`/${slug}/post/${res.data.uploadPost.txId}`)
    else router.push('/')
  }

  const isValidPost = () => {
    if (postText === '') {
      alert('This post has no text.')
      return false
    } else if (title === '') {
      alert('You must create a title for your post')
      return false
    } else if (hasCanonicalLink && !isValidURL(canonicalLink)) {
      alert('Either disable the canonical link or enter a valid URL [https://www.example.com]')
      return false
    } else if (communityId === '' || communityId === PLACEHOLDER_COMMUNITY.txId) {
      alert('Select a community')
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
          <CommunitySelector
            handleSelection={handleCommunitySelection}
            placeHolder={placeholderCommunity}
            disabled={isEditingMode}
          />
          <PostActions
            setShowPreview={setShowPreview}
            showPreview={showPreview}
            handlePost={handlePost}
          />
        </PreviewContainer>
        {showPreview
          ? <WarningText>
              WARNING: All posts are permanently added to a public blockchain.
          </WarningText>
          : null
        }
        <CanonicalLinkOption
          hasCanonicalLink={hasCanonicalLink}
          setHasLink={setHasLink}
          canonicalLink={canonicalLink}
          setCanonicalLink={setCanonicalLink}
        />
      </EditorContainer>
    </>
  )
}

export default EditorPage
