import React from 'react'
import { useRouter } from 'next/router'
import { styled } from '@material-ui/core/styles'
import moment from 'moment'
import {
  LockOpen,
  Lock
} from '@material-ui/icons'

const PostContainer = styled('div')({
  padding: '10px',
  'border-radius': '4px',
  '&:hover': {
    cursor: 'pointer',
    'background-color': '#fafafa'
  },
  display: 'flex',
  border: '1px solid #F0F0F0',
  position: 'relative',
  margin: '10px 0',
  'min-height': '140px',
  '@media only screen and (max-width: 800px)': {
    'flex-direction': 'column'
  }
})

const FeaturedImage = styled('img')({
  height: '120px',
  'border-radius': '10px'
})

const ImgContainer = styled('div')({
  height: '120px',
  'max-width': '250px',
  overflow: 'hidden',
  'border-radius': '10px'
})

const FixedImgWidth = styled('div')({
  width: '250px'
})

const PostInfo = styled('div')({
  position: 'relative',
  'margin-left': '20px'
})

const Title = styled('h3')({
  'margin-block-end': '0.5em'
})

const Subtitle = styled('div')({})

const Context = styled('div')({
  position: 'absolute',
  bottom: '0',
  display: 'flex',
  alignItems: 'center',
  '@media only screen and (max-width: 800px)': {
    position: 'static',
    'padding-top': '15px'
  }
})

const Author = styled('div')({
  'margin-right': '20px',
  'min-width': '125px'
})

const Date = styled('div')({
  'min-width': '250px'
})

const Requirement = styled('div')({
  position: 'absolute',
  top: '0',
  right: '10px',
  color: '#9A9A99',
  'font-size': '0.75em'
})

const StyledLockClosed = styled(Lock)({
  position: 'relative',
  top: '5px',
  'margin-right': '10px'
})

const StyledLockOpen = styled(LockOpen)({
  position: 'relative',
  top: '5px',
  'margin-right': '10px'
})

const LikesAndComments = styled('div')({
  display: 'flex',
  alignItems: 'center'
})

const CommentCount = styled('img')({
  width: '40px',
  height: '40px',
  objectFit: 'contain'
})

const FavoriteCount = styled('img')({
  width: '30px',
  height: '30px',
  objectFit: 'contain'
})

const FavoriteCountContainer = styled('div')({
  textAlign: 'center',
  width: '40px',
  position: 'absolute',
  right: 15,
  transform: 'translateX(-50%)'
})

const CommentCountContainer = styled('div')({
  textAlign: 'center',
  width: '40px',
  position: 'absolute',
  right: -20,
  transform: 'translateX(-50%)'
})

const SmallText = styled('p')({
  fontSize: '12px',
  fontWeight: '90'
})

const DATE_FORMAT = 'MMMM D YYYY'

const PostPreview = ({ post, userBalance }) => {
  const { title, subtitle, user, featuredImg, timestamp, community, commentCount, favoriteCount, readRequirement: postReadRequirement } = post
  const router = useRouter()
  const readRequirement = postReadRequirement || community.readRequirement

  const handleRedirect = () => {
    const url = `/${router.query.comSlug}/post/${post.txId}`
    router.push(url)
  }

  return (
    <PostContainer
      onClick={handleRedirect}
    >
      {featuredImg &&
        <FixedImgWidth>
          <ImgContainer>
            <FeaturedImage src={featuredImg} alt={`featured image for ${title}`} />
          </ImgContainer>
        </FixedImgWidth>
      }
      <PostInfo>
        <Title>
          {title}
        </Title>
        <Subtitle>
          {subtitle}
        </Subtitle>
        <Context>
          <Author>
            {user.name}
          </Author>
          <Date>
            {moment.unix(timestamp).format(DATE_FORMAT)}
          </Date>
          <LikesAndComments>
            <FavoriteCount src='posts/heart.svg' /> <FavoriteCountContainer> <SmallText> { favoriteCount } </SmallText> </FavoriteCountContainer>
            <CommentCount src='posts/chatBubble.svg' /> <CommentCountContainer> <SmallText> { commentCount } </SmallText> </CommentCountContainer>
          </LikesAndComments>
        </Context>
      </PostInfo>
      <Requirement>
        { readRequirement > userBalance
          ? <StyledLockClosed /> : <StyledLockOpen />
        }
        REQUIRES {readRequirement} ${community.tokenSymbol}
      </Requirement>
    </PostContainer>
  )
}

export default PostPreview
