import React from 'react'
import { CircularProgress } from '@material-ui/core'
import { styled } from '@material-ui/core/styles'

import PostPreview from '../PostPreview'
import usePosts from '../../hooks/usePosts'
import { useWeb3React } from '@web3-react/core'

const ProgressContainer = styled('div')({
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'center'
})

const Feed = () => {
  const { account } = useWeb3React()
  const { data, loading } = usePosts(account)

  if (loading) {
    return (
      <ProgressContainer>
        <CircularProgress />
      </ProgressContainer>
    )
  }

  const { posts, userBalance } = data?.posts || []

  return (
    <>
      {posts && posts.map((post, i) => {
        return (
          <PostPreview
            post={post}
            userBalance={userBalance}
            key={i}
          />
        )
      })
      }
    </>
  )
}

export default Feed
