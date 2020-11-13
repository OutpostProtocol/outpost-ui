import React, { useState } from 'react'
import { styled } from '@material-ui/core/styles'
import {
  Slider, Input, Button
} from '@material-ui/core'

import { useCommunity } from '../../context/Community'
import { useSubscription } from '../../context/Subscription'

const Container = styled('div')({
  padding: '50px'
})

const Info = styled('p')({})

const DaysContainer = styled('div')({})

const DaysMessage = styled('div')({})

const LengthInputContainer = styled('div')({})

const BuyContainer = styled('div')({
  display: 'flex',
  'justify-content': 'center',
  'margin-top': '30px'
})

const Finances = styled('div')({})

const Header = styled('div')({
  margin: '40px',
  display: 'flex',
  'align-items': 'center'
})

const HeaderText = styled('div')({})

const ManageActionsContainer = styled('div')({
  margin: '40px',
  display: 'flex',
  'justify-content': 'space-between'
})

const ActionButton = styled(Button)({
  margin: '0 20px'
})

const SubscriptionContainer = () => {
  const { community: { tokenSymbol } } = useCommunity()
  const { subscribe, flowRate, hasSubscription, extendSubscription, terminateSubscription } = useSubscription()
  const [lengthInDays, setDays] = useState(0)

  const handleSubscribe = async () => {
    const length = flowRate.mul(3600).mul(24).mul(lengthInDays)
    await subscribe(length)
  }

  const handleExtend = async () => {
    const length = flowRate.mul(3600).mul(24).mul(lengthInDays)
    await extendSubscription(length)
  }

  if (hasSubscription) {
    return (
      <Container>
        <Header>
          <HeaderText>MANAGE SUBSCRIPTION</HeaderText>
        </Header>
        <DaysInput
          setDays={setDays}
          lengthInDays={lengthInDays}
        />
        <ManageActionsContainer>
          <ActionButton
            color='secondary'
            variant='contained'
            disableElevation
            onClick={() => handleExtend()}
          >
            EXTEND
          </ActionButton>
          <ActionButton
            color='secondary'
            variant='contained'
            disableElevation
            onClick={() => terminateSubscription()}
          >
            END
          </ActionButton>
        </ManageActionsContainer>
      </Container>
    )
  }

  return (
    <Container>
      <Info>
        Subscribe to access the newsletter. Buy some ${tokenSymbol} below and then
        <em>stream</em> it. Get access for however long you want and cancel at any time.
      </Info>
      <DaysInput
        setDays={setDays}
        lengthInDays={lengthInDays}
      />
      <Finances>
      </Finances>
      <BuyContainer>
        <Button
          color='secondary'
          disableElevation
          onClick={() => handleSubscribe()}
          variant='contained'
        >
          SUBSCRIBE
        </Button>
      </BuyContainer>
    </Container>
  )
}

const DaysInput = ({ setDays, lengthInDays }) => {
  const handleInputChange = (event) => {
    setDays(event.target.value === '' ? '' : Number(event.target.value))
  }

  return (
    <DaysContainer>
      <DaysMessage>
        How many days do you want to subscribe?
      </DaysMessage >
      <LengthInputContainer>
        <div>
          <Slider
            value={typeof lengthInDays === 'number' ? lengthInDays : 0}
            onChange={(_, newValue) => setDays(newValue)}
            min={0}
            step={7}
            max={90}
          />
        </div>
        <div>
          <Input
            value={lengthInDays}
            onChange={handleInputChange}
          />
        </div>
      </LengthInputContainer>
    </DaysContainer>
  )
}

export default SubscriptionContainer
