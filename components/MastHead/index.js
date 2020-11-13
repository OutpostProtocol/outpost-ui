import React, { useState } from 'react'
import { styled } from '@material-ui/core/styles'
import { Button, Dialog } from '@material-ui/core'
import Iframe from 'react-iframe'

import SubscriptionContainer from '../SubscriptionContainer'
import { useCommunity } from '../../context/Community'
import { useSubscription } from '../../context/Subscription'

const Container = styled('div')({
  'background-color': '#F2F2F2',
  width: '100%',
  margin: '80px auto 0',
  'min-height': '220px',
  '@media only screen and (min-width: 800px)': {
    width: '70vw'
  },
  'max-width': '1000px'
})

const PaddingContainer = styled('div')({
  padding: '25px',
  display: 'flex',
  'justify-content': 'space-between',
  'flex-direction': 'column',
  'align-items': 'center',
  '@media only screen and (min-width: 800px)': {
    'flex-direction': 'row',
    'align-items': 'stretch'
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

const TokenActions = styled('div')({
  display: 'flex',
  'flex-direction': 'column',
  'justify-content': 'space-around',
  'align-items': 'center'
})

const ApproveIdaContainer = styled('div')({})

const BuySubscriptionContainer = styled('div')({})

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
  'padding-top': '20px',
  '&:hover': {
    cursor: 'pointer'
  },
  '@media screen and (min-width: 440px)': {
    'padding-top': 0
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

// break into token holders and non token holders

const MastHead = () => {
  const { approveIda, hasSubscription } = useSubscription()
  const { community, userTokenBalance } = useCommunity()
  const [showUniModal, toggleUniModal] = useState(false)
  const [showSubModal, toggleSubModal] = useState(false)
  const [hasApproved, setHasApproved] = useState(false)

  const handleApproveIda = async () => {
    console.log('approve ida called')
    await approveIda()
    setHasApproved(true)
  }

  /* TODO: Check whether they've created an approval already to update the ui
  useEffect(() => {
    const checkApproval = async () => {
      const hasApproval = sub...
    }

    if (account && userTokenBalance > 0) {
      checkApproval()
    }
  }, [account])
  */

  const { imageTxId, name, description, tokenSymbol, tokenAddress, owner, showOwner } = community
  return (
    <Container>
      <PaddingContainer>
        {showUniModal && (
          <FrameWrapper
            onClick={() => {
              toggleUniModal(false)
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
        <Dialog
          open={showSubModal}
          onClose={() => toggleSubModal(false)}
        >
          <SubscriptionContainer />
        </Dialog>
        <Header>
          <HeaderImages>
            <CommunityImage src={`https://arweave.net/${imageTxId}`} alt={name} />
            {showOwner && owner.image &&
              <ProfileImage src={owner.image} alt={`${name} Creator`} />
            }
          </HeaderImages>
          <CommunityInfo>
            <Name>
              {name}
            </Name>
            <Author>
              {showOwner &&
                `By ${owner.name}`
              }
            </Author>
            <Description>
              {description}
            </Description>
          </CommunityInfo>
        </Header>
        {tokenSymbol &&
          <TokenActions>
            <BuyContainer>
              <Button
                variant='contained'
                color='secondary'
                disableElevation
                onClick={() => toggleUniModal(true)}
              >
                BUY ${tokenSymbol}
              </Button>
            </BuyContainer>
            {userTokenBalance > 0 &&
               <ApproveIdaContainer>
                 {hasApproved
                   ? <Button
                     disableElevation
                     color='secondary'
                     variant='contained'
                     disabled
                   >
                    REWARDS APPROVED &#x2713;
                   </Button>
                   : <Button
                     variant='contained'
                     color='secondary'
                     disableElevation
                     onClick={() => handleApproveIda()}
                   >
                    APPROVE REWARDS
                   </Button>
                 }
               </ApproveIdaContainer>
            }
            <BuySubscriptionContainer>
              <Button
                disableElevation
                color='secondary'
                variant='contained'
                onClick={() => toggleSubModal(true)}
              >
                {hasSubscription ? 'MANAGE SUBSCRIPTION' : 'BUY SUBSCRIPTION'}
              </Button>
            </BuySubscriptionContainer>
          </TokenActions>
        }
      </PaddingContainer>
    </Container>
  )
}

export default MastHead
