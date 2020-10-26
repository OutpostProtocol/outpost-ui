import React from 'react'
import { styled } from '@material-ui/core/styles'
import { TwitterIcon } from 'outpost-react-share'

import DiscordIcon from '../public/social-icons/discord-logo.svg'

const StyledDiscord = styled(DiscordIcon)({
  height: '31px',
  width: '31px'
})

export const icons = [{
  href: 'https://discord.gg/GZzSddx',
  component: (<StyledDiscord/>)
},
{
  href: 'https://twitter.com/OutpostProtocol',
  component: (<TwitterIcon
    size={30}
    round={true}
    bgStyle={{
      fill: '#1a1a1a'
    }}
  />)
}]
