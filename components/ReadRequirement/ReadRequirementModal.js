import React, { useState } from 'react'
import { styled } from '@material-ui/core/styles'
import {
  Dialog, IconButton, Button
} from '@material-ui/core'
import { Close } from '@material-ui/icons'

import { useCommunity } from '../../context/Community'
import ReadRequirement from '.'

const Confirm = styled(Button)({
  margin: 'auto',
  display: 'block'
})

const ModalContainer = styled(Dialog)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

const ExitButton = styled(IconButton)({
  width: '40px',
  height: '40px',
  padding: 0,
  position: 'absolute',
  top: '5px',
  right: '5px'
})

const ContentContainer = styled('div')({
  padding: '15px',
  marginTop: '25px',
  'text-align': 'center'
})

const ReadRequirementModal = ({ isOpen, handleClose, handleUpdate, initialReadRequirement }) => {
  const [readRequirement, setReadRequirement] = useState(initialReadRequirement)
  const { community } = useCommunity()

  return (
    <ModalContainer
      open={isOpen}
      onClose={handleClose}
    >
      <ContentContainer>
        <ExitButton
          onClick={handleClose}
        >
          <Close />
        </ExitButton>
        <ReadRequirement
          activeCommunity={community}
          setReadRequirement={setReadRequirement}
          tokenSymbol={community.tokenSymbol}
        />
        <Confirm
          disableElevation
          color='primary'
          variant='contained'
          onClick={() => handleUpdate(readRequirement)}
        >
          UPDATE
        </Confirm>
      </ContentContainer>
    </ ModalContainer >
  )
}

export default ReadRequirementModal
