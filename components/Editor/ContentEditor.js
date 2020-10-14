import React, {
  useRef,
  useState
} from 'react'
import { styled } from '@material-ui/core/styles'
import ReactQuill from 'react-quill'
import {
  Input,
  CircularProgress
} from '@material-ui/core'
import { useWeb3React } from '@web3-react/core'
import {
  gql,
  useMutation
} from '@apollo/client'

import BlockToolbar from './BlockToolbar'
import FormattingToolbar, {
  modules,
  formats
} from './FormattingToolbar'
import {
  registerCustomBlocks,
  getTweet,
  getYoutubeVideo
} from './CustomBlocks'

registerCustomBlocks()

const FormTextField = styled(Input)({
  width: '100%',
  'border-radius': '4px',
  margin: '1vh 0'
})

const TitleField = styled(FormTextField)({
  'font-size': '40px',
  'font-weight': 'bold'
})

const SubtitleField = styled(FormTextField)({
  'font-size': '20px',
  'font-weight': 'bolder'
})

const TitleContainer = styled('div')({
  padding: '7vh 0 0 0',
  'text-align': 'center'
})

const Editor = styled(ReactQuill)({
  'margin-left': '-12px',
  'margin-right': '-12px'
})

const ImageContainer = styled('div')({
  position: 'relative',
  color: '#a6a6a6',
  'text-align': 'center',
  '&:hover': {
    opacity: 0.9,
    cursor: 'pointer'
  }
})

const CenteredText = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  'font-family': 'Spectral, serif',
  'font-style': 'italic'
})

const FeaturedImage = styled('img')({
  width: '100%',
  height: 'auto',
  maxHeight: '200px',
  marginTop: '10px',
  'object-fit': 'cover'
})

const EditorContainer = styled(Editor)({
  position: 'relative',
  top: '-50px'
})

const UPLOAD_IMAGE = gql`
  mutation uploadImage($image: Image!, $address: String!) {
    uploadImage(image: $image, address: $address) {
      txId
    }
  }
`

const ContentEditor = ({ title, subtitle, postText, featuredImg, setTitle, setSubtitle, setPostText, setFeaturedImage, isEditing }) => {
  const { account } = useWeb3React()
  const editorRef = useRef(undefined)
  const [uploadImageToAR] = useMutation(UPLOAD_IMAGE)
  const [blockToolbarLocation, setBlockToolbarLocation] = useState({ top: 0, left: 0 })
  const [isFeaturedImageLoading, setIsFeaturedImageLoading] = useState(false)
  const loadingImg = '/editor/loading.gif'

  if (editorRef.current?.getEditor && !window.editor) {
    window.editor = editorRef.current.getEditor()
  }

  if (window.editor) {
    const tooltip = window.editor.theme.tooltip
    const input = tooltip.root.querySelector('input[data-link]')
    input.dataset.link = 'https://www.outpost-protocol.com'
  }

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        let encoded = reader.result.toString().replace(/^data:(.*,)?/, '')
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4))
        }
        resolve(encoded)
      }
      reader.onerror = error => reject(error)
    })
  }

  const imageUpload = async (photoFile) => {
    const rawImage = await getBase64(photoFile)

    const image = {
      data: rawImage,
      mimeType: photoFile.type
    }
    const options = {
      variables: {
        image: image,
        address: account
      }
    }
    const res = await uploadImageToAR(options)

    const featuredImgSrc = `https://arweave.dev/${res.data.uploadImage.txId}`
    return featuredImgSrc
  }

  const handleImage = (isFeaturedImage) => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()
    return new Promise((resolve, reject) => {
      input.onchange = async () => {
        const file = input.files[0]
        const index = window.editor.getSelection(true).index
        if (isFeaturedImage) setIsFeaturedImageLoading(true)
        else {
          window.editor.insertEmbed(index, 'image', loadingImg)
        }
        const imgSrc = await imageUpload(file)
        if (isFeaturedImage) {
          setIsFeaturedImageLoading(false)
          setFeaturedImage(imgSrc)
          resolve(undefined)
        } else {
          window.editor.deleteText(index, 3)
          resolve(imgSrc)
        }
      }
    })
  }

  const getLineText = (index) => {
    const [blot] = window.editor.getLine(index)
    return blot.domNode?.innerText
  }

  const autoEmbed = () => {
    const range = window.editor.getSelection(true)
    if (range?.index > 0 && window.editor) {
      const line = getLineText(range?.index - 1)
      const youtubeUrl = getYoutubeVideo(line)
      const twitterUrl = getTweet(line)
      if (youtubeUrl) window.editor.formatLine(range?.index - 1, 0, 'video', youtubeUrl)
      else if (twitterUrl) window.editor.formatLine(range?.index - 1, 'twitter', { url: twitterUrl })
    }
  }

  const handleSelectionChange = (range, source, editor) => {
    const bounds = editor.getBounds(range?.index || 0)
    bounds.left = -60 // keep toolbar positioned to left of editor
    bounds.top = bounds.top - 13
    setBlockToolbarLocation(bounds)
  }

  const uploadImage = async () => {
    const range = window.editor.getSelection(true)
    const imgSrc = await handleImage(false)
    if (imgSrc) window.editor.insertEmbed(range?.index || 0, 'image', imgSrc)
  }

  return (
    <>
      <TitleContainer>
        { isEditing &&
          <h3>
            Edit Post
          </h3>
        }
        <TitleField
          onChange={(event) => setTitle(event.target.value)}
          value={title}
          placeholder='Title'
          disableUnderline={true}
        />
        <SubtitleField
          onChange={(event) => setSubtitle(event.target.value)}
          value={subtitle}
          placeholder='Subtitle'
          disableUnderline={true}
        />
        {false &&
          <ImageContainer onClick={() => handleImage(true) }>
            { featuredImg ? (
              <>
                <FeaturedImage src={featuredImg} alt='Placeholder ft img' />
                { isFeaturedImageLoading &&
                  <CenteredText><CircularProgress /></CenteredText>
                }
              </>
            ) : (
              <>
                <FeaturedImage src='/editor/placeholder.png' alt='Placeholder ft img' />
                { isFeaturedImageLoading
                  ? <CenteredText><CircularProgress /></CenteredText>
                  : <CenteredText>FEATURE AN IMAGE</CenteredText>
                }
              </>
            )
            }
          </ImageContainer>
        }
      </TitleContainer>
      <div>
        <FormattingToolbar />
        <BlockToolbar
          handleImage={() => uploadImage()}
          location={blockToolbarLocation}
        />
        <EditorContainer
          id='editor-container'
          theme='bubble'
          ref={editorRef}
          value={postText}
          onChange={(value) => setPostText(value)}
          onChangeSelection={handleSelectionChange}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              autoEmbed()
            }
          }}
          modules={modules}
          formats={formats}
          scrollingContainer='html'
        />
      </div>
    </>
  )
}

export default ContentEditor
