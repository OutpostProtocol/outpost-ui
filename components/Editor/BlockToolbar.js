import React, {
  useState,
  useRef
} from 'react'
import { styled } from '@material-ui/core/styles'
import {
  IconButton,
  Popover,
  Input,
  Button,
  Zoom
} from '@material-ui/core'
import {
  Add,
  Twitter,
  YouTube,
  Image
} from '@material-ui/icons'

import { sanitizeYoutubeLink } from './CustomBlocks'

const OpenToolbar = styled('div')({
  visibility: 'visible'
})

const ClosedToolbar = styled('div')({
  visibility: 'hidden'
})

const ToggleButtonVisbile = styled(IconButton)({
  visibility: 'visible'
})

const ToggleButtonHidden = styled(IconButton)({
  visibility: 'hidden'
})

const EmbedContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
})

const Option = styled(IconButton)({
  width: '8px',
  height: '8px',
  margin: '8px',
  color: '#c4c4c4',
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#1a1a1a'
  }
})

const PopoverContainer = styled(Popover)({
})

const URLField = styled(Input)({
  width: '60%',
  margin: '8px'
})

const EmbedButton = styled(Button)({
  marginRight: '7px',
  margin: '8px'
})

const intents = {
  TWITTER: 'twitter',
  YOUTUBE: 'youtube'
}

const BlockToolbar = ({ handleImage, location }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isURLOpen, setIsURLOpen] = useState(false)
  const [url, setURL] = useState('')
  const [intent, setIntent] = useState(undefined)
  const [anchor, setAnchor] = useState(undefined)
  const divRef = useRef()
  const ToolbarContainer = isOpen ? OpenToolbar : ClosedToolbar

  const toggle = () => {
    setAnchor(divRef.current)
    setIsOpen(!isOpen)
  }

  const close = () => {
    setURL('')
    setIsURLOpen(false)
    setIsOpen(false)
    if (window.editor) window.editor.focus()
  }

  const isVisible = () => {
    // Visible if editor has focus, line lenght is 0, no highlighted selection
    if (window.editor) {
      const range = window.editor.getSelection()
      const lineLength = window.editor.getLine(range?.index || 0)[1]
      return window.editor.hasFocus() && lineLength === 0 && range?.length === 0
    }
    return false
  }

  const getIndex = () => {
    const range = window?.editor.getSelection()
    return range?.index || 0
  }

  const handleTwitter = (url) => {
    if (window.editor) {
      window.editor.focus()
      window.editor.insertEmbed(getIndex(), 'twitter', { url }, 'Silent')
    }
  }

  const handleYoutube = (url) => {
    if (window.editor) {
      window.editor.focus()
      const sanitizedURL = sanitizeYoutubeLink(url)
      if (sanitizedURL !== undefined) {
        window.editor.insertEmbed(getIndex(), 'video', sanitizedURL, 'Silent')
      }
    }
  }

  const openURLWithIntent = (newIntent) => {
    switch (newIntent) {
      case intents.YOUTUBE:
        setIntent(newIntent)
        setIsURLOpen(true)
        break
      case intents.TWITTER:
        setIntent(newIntent)
        setIsURLOpen(true)
        break
      default:
        setIntent(undefined)
        console.error('INVALID INTENT')
    }
  }

  const handleEmbed = () => {
    switch (intent) {
      case intents.YOUTUBE:
        handleYoutube(url)
        close()
        break
      case intents.TWITTER:
        handleTwitter(url)
        close()
        break
      default:
        setIntent(undefined)
        console.error('INVALID INTENT')
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        left: location.left,
        top: location.top
      }}
    >
      <div
        ref={divRef}
        style={{
          display: 'inline',
          paddingRight: '17px'
        }}
      >
        { isVisible() ? (
          <ToggleButtonVisbile
            onClick={toggle}
          >
            <Add />
          </ToggleButtonVisbile>
        ) : (
          <ToggleButtonHidden>
            <Add />
          </ToggleButtonHidden>
        )
        }
      </div>
      <PopoverContainer
        elevation={0}
        anchorEl={anchor}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left'
        }}
        PaperProps={{
          style: {
            backgroundColor: '#f1f1f1',
            borderRadius: '4px'
          }
        }}
        TransitionComponent={Zoom}
        open={isOpen}
        onClose={close}
        color='primary'
      >
        <ToolbarContainer>
          { isURLOpen ? (
            <EmbedContainer>
              <URLField
                placeholder='URL'
                value={url}
                onChange={(event) => setURL(event?.target?.value)}
                disableUnderline={true}
                onKeyUp={(event) => {
                  if (event.key === 'Enter') {
                    handleEmbed()
                  }
                }}
              />
              <EmbedButton
                disableElevation
                color='secondary'
                onClick={handleEmbed}
                variant='contained'
              >
                EMBED
              </EmbedButton>
            </ EmbedContainer>
          ) : (
            <>
              <Option
                onClick={() => {
                  handleImage()
                  setIsOpen(false)
                }}
              >
                <Image />
              </Option>
              <Option
                onClick={() => openURLWithIntent(intents.TWITTER)}
              >
                <Twitter />
              </Option>
              <Option
                onClick={() => openURLWithIntent(intents.YOUTUBE)}
              >
                <YouTube />
              </Option>
            </>
          )
          }
        </ ToolbarContainer>
      </PopoverContainer>
    </ div>
  )
}

export default BlockToolbar
