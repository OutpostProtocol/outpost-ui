import React from 'react'
import { styled } from '@material-ui/core/styles'
import moment from 'moment'

import { use3boxProf } from '../../hooks/use3boxProf'
import ProfileImage from '../Profile/ProfileImage'
import { shortenAddress } from '../../utils'

const Container = styled('div')({
  display: 'inline-flex',
  'align-items': 'center'
})

const Time = styled('div')({
  color: '#999'
})

const MinWidthDiv = styled('div')({
  'min-width': '150px'
})

const DATE_FORMAT = 'D MMMM YYYY'

const PostContext = ({ user, communityName, timestamp, dateFormat }) => {
  const format = dateFormat || DATE_FORMAT
  const time = moment.unix(timestamp).format(format)

  const { name, image, address } = user

  return (
    <Container>
      <ProfileImage
        imgSrc={image}
      />
      <MinWidthDiv>
        <div>
          { communityName
            ? (<>{name || shortenAddress(address) } · {communityName} </>)
            : (<>{name || shortenAddress(address) }</>)
          }
        </div>
        <Time>
          {time}
        </Time>
      </MinWidthDiv>
    </Container>
  )
}

export default PostContext
