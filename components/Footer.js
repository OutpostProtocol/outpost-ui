import React from 'react'
import { styled } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'

import { icons } from '../constants/outpost-share'

const Container = styled('div')({
  height: '10vh',
  width: '100%',
  margin: '10vh 0',
  display: 'flex',
  'justify-content': 'center',
  'align-items': 'center'
})

const CreateOutpost = styled(Button)({
  height: '2.6em',
  'border-radius': '4px',
  display: 'none',
  '@media only screen and (min-width: 420px)': {
    display: 'block'
  }
})

const DiscordLink = styled('a')({
  'text-decoration': 'none',
  'margin-right': '10px',
  padding: '10px'
})

const IconContainer = styled('a')({
  margin: '10px 30px'
})

const Footer = () => {
  return (
    <Container>
      <DiscordLink href='https://discord.gg/GZzSddx' target='_blank'>
        <CreateOutpost variant='outlined' >
          CREATE AN OUTPOST
        </CreateOutpost>
      </DiscordLink>
      {icons.map((icon, i) => (
        <SocialIcon
          key={i}
          href={icon.href}
        >
          {icon.component}
        </SocialIcon>
      ))
      }
    </Container>
  )
}

const SocialIcon = ({ href, children }) => {
  return (
    <IconContainer href={href} target='_blank'>
      {children}
    </IconContainer>
  )
}

export default Footer
