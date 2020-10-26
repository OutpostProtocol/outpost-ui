import React from 'react'
import { styled } from '@material-ui/core/styles'
import axios from 'axios'
import { useRouter } from 'next/router'

import SEO from '../components/seo'
import Footer from '../components/Footer'
import Toolbar from '../components/Toolbar'

import { queries } from '../graphql'

const OUTPOST_API = process.env.NEXT_PUBLIC_OUTPOST_API

const Container = styled('div')({
  'overflow-x': 'hidden',
  height: '100vh'
})

const Body = styled('div')({
  margin: '10vh',
  '@media only screen and (max-width: 800px)': {
    margin: '10vh 10px'
  }
})

const HeaderContainer = styled('div')({
  display: 'flex',
  'justify-content': 'center'
})

const Header = styled('div')({
  display: 'flex',
  'align-items': 'center'
})

const OutpostImg = styled('img')({
  height: '100px',
  width: '100px'
})

const OutpostTitle = styled('div')({
  'font-size': '2em'
})

const DiscoverContainer = styled('div')({
  display: 'flex',
  'justify-content': 'center',
  'margin-top': '40px'
})

const Discover = styled('div')({
  '@media only screen and (min-width: 1400px)': {
    display: 'grid',
    'grid-template-columns': '1fr 1fr'
  }
})

const ComContainer = styled('div')({
  display: 'flex',
  padding: '10px 100px',
  'border-radius': '4px',
  margin: '10px',
  '&:hover': {
    'background-color': '#fafafa',
    cursor: 'pointer'
  },
  '@media only screen and (max-width: 800px)': {
    'flex-direction': 'column',
    padding: '20px'
  }
})

const ComImgContainer = styled('div')({
  '@media only screen and (max-width: 800px)': {
    display: 'flex',
    'justify-content': 'center'
  }
})

const ComImg = styled('img')({
  height: '125px',
  width: '125px',
  'border-radius': '10px'
})

const ComInfo = styled('div')({
  'margin-left': '20px',
  display: 'flex',
  'flex-direction': 'column',
  'justify-content': 'space-around',
  '@media only screen and (max-width: 800px)': {
    'margin-left': 0,
    'margin-top': '10px'
  }
})

const ComName = styled('div')({
  'font-size': '1.5em'
})

const ComAuthor = styled('div')({})

const ComDescription = styled('div')({
  color: '#6c6c6c'
})

const Home = ({ communities }) => {
  const router = useRouter()

  return (
    <Container>
      <SEO />
      <Toolbar />
      <Body>
        <HeaderContainer>
          <Header>
            <OutpostImg src='/logo/Outpost_black.png' />
            <OutpostTitle>
              OUTPOST
            </OutpostTitle>
          </Header>
        </HeaderContainer>
        <DiscoverContainer>
          <Discover>
            {communities.map((com, i) => {
              return (
                <ComContainer
                  key={i}
                  onClick={() => router.push(`/${com.slug}`)}
                >
                  <ComImgContainer>
                    <ComImg src={`https://arweave.net/${com.imageTxId}`} />
                  </ComImgContainer>
                  <ComInfo>
                    <ComName>
                      {com.name}
                    </ComName>
                    <ComDescription>
                      {com.description}
                    </ComDescription>
                    {com.showOwner &&
                      <ComAuthor>
                        By {com.owner.name}
                      </ComAuthor>
                    }
                  </ComInfo>
                </ComContainer>
              )
            })}
          </Discover>
        </DiscoverContainer>
      </Body>
      <Footer />
    </Container>
  )
}

export async function getStaticProps () {
  const res = await axios.post(OUTPOST_API, { query: queries.getAllCommunities })

  const communities = res.data.data.allCommunities

  return {
    props: {
      communities
    },
    // keeps community data up to date
    revalidate: 1
  }
}

export default Home
