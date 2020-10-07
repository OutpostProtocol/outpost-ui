import React from 'react'
import { styled } from '@material-ui/core/styles'
import axios from 'axios'

import { CommunityProvider } from '../../context/Community'
import SEO from '../../components/seo'
import Feed from '../../components/Feed'
import Toolbar from '../../components/Toolbar'
import MastHead from '../../components/MastHead'

const OUTPOST_API = process.env.NEXT_PUBLIC_OUTPOST_API

const FeedContainer = styled('div')({
  '@media only screen and (min-width: 800px)': {
    width: '70vw'
  },
  width: '95vw',
  margin: '0 auto 15vh',
  'padding-top': '5vh'
})

const FeedHeader = styled('div')({
  color: '#6C6C6C',
  'margin-bottom': '10px'
})

const Container = styled('div')({
  'overflow-x': 'hidden'
})

const CommunityPage = ({ community }) => {
  return (
    <Container>
      <CommunityProvider
        community={community}
      >
        <SEO
          image={`https://arweave.net/${community.imageTxId}`}
        />
        <Toolbar />
        <MastHead />
        <FeedContainer>
          <FeedHeader>
          READ THE LATEST
          </FeedHeader>
          <Feed/>
        </FeedContainer>
      </CommunityProvider>
    </ Container>
  )
}

export async function getServerSideProps (context) {
  const slug = context.params.comSlug

  const query = `
    query ComPage($slug: String) {
      community(slug: $slug) {
        id
        name
        txId
        tokenAddress
        tokenSymbol
        description
        imageTxId
        readRequirement
        owner {
          name
          image
        }
      }
    }
  `

  const res = await axios.post(OUTPOST_API, {
    query,
    variables: {
      slug
    }
  })

  const community = res.data.data.community[0]

  return {
    props: {
      community
    }
  }
}

export default CommunityPage
