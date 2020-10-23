import { useState, useEffect } from 'react'
import {
  gql,
  useQuery
} from '@apollo/client'
import { useErrorReporting } from './index'
import { ERROR_TYPES } from '../constants'
import { useRouter } from 'next/router'

import { queries } from '../graphql'

export const GET_POSTS = gql(queries.getPosts)

export const GET_POST = gql(queries.getPost)

const GET_PREVIEW = gql(queries.getPostPreview)

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
  if (!txId) return { postData: undefined, loading: undefined, error: undefined, refetch: undefined }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [postData, setPostData] = useState()
  const [loading, setLoading] = useState(true)
  const { data, error, refetch } = useQuery(GET_POST, {
    variables: {
      txId,
      userToken
    },
    fetchPolicy: 'network-only',
    context: {
      headers: {
        authorization: userToken
      }
    }
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
