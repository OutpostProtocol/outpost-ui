import React from 'react'
import { styled } from '@material-ui/core/styles'
import {
  Dialog, IconButton, Button
} from '@material-ui/core'
import { Close } from '@material-ui/icons'

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

const Confirm = styled(Button)({
  margin: 'auto',
  display: 'block'
})

const ContentContainer = styled('div')({
  padding: '15px',
  marginTop: '25px',
  'text-align': 'center'
})

const ConfirmDelete = ({ isOpen, handleClose, handleDelete }) => {
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
        <p>
          Are you sure you want to delete this post?
        </p>
        <Confirm
          disableElevation
          color='primary'
          variant='contained'
          onClick={handleDelete}
        >
          DELETE
        </Confirm>
      </ContentContainer>
    </ ModalContainer >
  )
}

export default ConfirmDelete
