import { useState, useEffect } from 'react'
import {
  gql,
  useQuery
} from '@apollo/client'
import { useErrorReporting } from './index'
import { ERROR_TYPES } from '../constants'
import { useRouter } from 'next/router'

export const GET_POSTS = gql`
  query posts($slug: String) {
    posts (communitySlug: $slug) {
      id
      title
      subtitle
      timestamp
      txId
      featuredImg
      community {
        name
        readRequirement
        tokenSymbol
      }
      user {
        name
      }
    }
  }
  `

export const GET_POST = gql`
  query getPost($txId: String!, $userToken: String!) {
    getPost(txId: $txId, userToken: $userToken) {
      post {
        id
        title
        postText
        subtitle
        timestamp
        canonicalLink
        txId
        community {
          name
          txId
        }
        user {
          address
          name
          image
        }
      }
      comments {
        postText
        timestamp
        user {
          address
          name
          image
        }
      }
      userBalance
      readRequirement
      tokenSymbol
      tokenAddress
    }
  }
`

const GET_PREVIEW = gql`
  query posts($txId: String!) {
    postPreview (txId: $txId) {
      id
      title
      subtitle
      timestamp
      txId
      featuredImg
      canonicalLink
    }
  }
`

export const usePostPreview = (txId) => {
  const [title, setTitle] = useState(null)
  const [description, setDescription] = useState(null)
  const [image, setImage] = useState(null)
  const [canonicalLink, setCanonicalLink] = useState(null)

  const { data, error, loading } = useQuery(GET_PREVIEW, {
    variables: { txId }
  })
  useErrorReporting(ERROR_TYPES.query, data?.error, 'GET_PREVIEW')
  useEffect(() => {
    if (!loading && !error) {
      const preview = data.postPreview
      setCanonicalLink(preview?.canonicalLink)
      setTitle(preview?.title)
      setDescription(preview?.subtitle)
      setImage(preview?.featuredImg)
    }
  }, [data, loading, error])

  return {
    title,
    description,
    image,
    canonicalLink
  }
}

const usePosts = (communityTxId) => {
  const router = useRouter()
  const slug = router.query.comSlug

  const result = useQuery(GET_POSTS, {
    variables: { slug }
  })

  useErrorReporting(ERROR_TYPES.query, result?.error, 'GET_POSTS')
  return result
}

export const useOnePost = (txId, userToken) => {
  const [postData, setPostData] = useState()
  const [loading, setLoading] = useState(true)
  const { data, error, refetch } = useQuery(GET_POST, {
    variables: {
      txId,
      userToken
    },
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (data) {
      setPostData(data.getPost)
      setLoading(false)
    }
  }, [data])

  useErrorReporting(ERROR_TYPES.query, error, 'GET_ONE_POST')
  return { postData, loading, error, refetch }
}

export default usePosts
