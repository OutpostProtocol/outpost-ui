import React, { useState } from 'react'
import { styled } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'
import Iframe from 'react-iframe'

import { useCommunity } from '../../context/Community'

const Container = styled('div')({
  'background-color': '#F2F2F2',
  width: '70vw',
  margin: '80px auto 0',
  'min-height': '220px',
  '@media only screen and (max-width: 800px)': {
    width: '100%'
  },
  'max-width': '1000px'
})

const PaddingContainer = styled('div')({
  padding: '25px',
  display: 'flex',
  'justify-content': 'space-between',
  '@media only screen and (max-width: 800px)': {
    'flex-direction': 'column',
    'align-items': 'center'
  }
})

const Header = styled('div')({
  display: 'flex'
})

const HeaderImages = styled('div')({
  width: '100px',
  'min-height': '165px'
})

const CommunityImage = styled('img')({
  'border-radius': '50%',
  width: '100px',
  height: '100px'
})

const ProfileImage = styled('img')({
  height: '40px',
  'border-radius': '50%',
  position: 'relative',
  bottom: '20px',
  left: '30px'
})

const Name = styled('h1')({
  'font-size': '2.5em'
})

const Author = styled('div')({
  'min-height': '20px'
})

const CommunityInfo = styled('div')({
  'margin-top': '20px',
  'margin-left': '20px'
})

const Description = styled('div')({
  margin: '30px 0'
})

const BuyContainer = styled('div')({})

const FrameWrapper = styled('div')({
  'min-width': '100vw',
  height: '100vh',
  left: 0,
  top: 0,
  'z-index': 9999,
  'background-color': 'rgba(0, 0, 0, 0.7)',
  position: 'fixed',
  display: 'flex',
  'justify-content': 'center',
  'align-items': 'center',
  '&:hover': {
    cursor: 'pointer'
  },
  '@media screen and (max-width: 440px)': {
    'padding-top': '20px'
  }
})

const CloseIcon = styled('div')({
  position: 'absolute',
  color: 'white',
  'font-size': '30px',
  top: '20px',
  right: '20px'
})

const FrameBorder = styled('div')({
  'border-radius': '26px',
  'margin-bottom': '20px',
  overflow: 'hidden'
})

const MastHead = () => {
  const community = useCommunity()
  const [showModal, toggleModal] = useState(false)

  const { imageTxId, name, description, tokenSymbol, tokenAddress, owner } = community
  return (
    <Container>
      <PaddingContainer>
        {showModal && (
          <FrameWrapper
            onClick={() => {
              toggleModal(false)
            }}
          >
            <CloseIcon>✕</CloseIcon>
            <FrameBorder>
              <Iframe
                url={`https://uniswap.exchange/?outputCurrency=${tokenAddress}`}
                height={'660px'}
                width={'400px'}
                id="myId"
                frameBorder="0"
                style={{ border: 'none', outline: 'none' }}
                display="initial"
                position="relative"
              />
            </FrameBorder>
          </FrameWrapper>
        )}
        <Header>
          <HeaderImages>
            <CommunityImage src={`https://arweave.net/${imageTxId}`} alt={name} />
            {owner.image &&
            <ProfileImage src={owner.image} alt={`${name} Creator`} />
            }
          </HeaderImages>
          <CommunityInfo>
            <Name>
              {name}
            </Name>
            <Author>
              {owner.name &&
                `By ${owner.name}`
              }
            </Author>
            <Description>
              {description}
            </Description>
          </CommunityInfo>
        </Header>
        <BuyContainer>
          <Button
            variant='contained'
            color='secondary'
            disableElevation
            onClick={() => toggleModal(true)}
          >
          BUY ${tokenSymbol}
          </Button>
        </BuyContainer>
      </PaddingContainer>
    </Container>
  )
}

export default MastHead
