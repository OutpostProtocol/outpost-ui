import React, {
  useRef,
  useState
} from 'react'
import { styled } from '@material-ui/core/styles'
import ReactQuill from 'react-quill'
import { Input } from '@material-ui/core'
import { useWeb3React } from '@web3-react/core'
import {
  gql,
  useMutation
} from '@apollo/client'

import LoadingBackdrop from '../LoadingBackdrop'
import FormattingToolbar, {
  modules,
  formats
} from './FormattingToolbar'
import BlockToolbar from './BlockToolbar'
import {
  registerCustomBlocks,
  sanitizeYoutubeLink
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
  'text-align': 'center'
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
  'object-fit': 'cover',
  '&:hover': {
    opacity: 0.7
  }
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
  const [isLoading, setIsLoading] = useState(false)
  const [blockToolbarLocation, setBlockToolbarLocation] = useState({ top: 0, left: 0 })
  const loadingImgSrc = 'editor/loading.gif'

  document.querySelectorAll('.ql-picker').forEach(tool => {
    tool.addEventListener('mousedown', function (event) {
      event.preventDefault()
      event.stopPropagation()
    })
  })

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
        if (isFeaturedImage) setFeaturedImage(loadingImgSrc)
        const imgSrc = await imageUpload(file)
        if (isFeaturedImage) {
          setFeaturedImage(imgSrc)
          resolve(undefined)
        }
        resolve(imgSrc)
      }
    })
  }

  const restoreFocus = () => {
    window.editor.focus()
    if (window?.getSelection?.focusNode?.parentElement) {
      const selectionEl = window.getSelection().focusNode.parentElement
      selectionEl.scrollIntoView({ block: 'center', inline: 'center' })
    }
  }

  const handleEditorChange = async (value, delta, source, editor) => {
    if (source === 'user' && window.editor) {
      restoreFocus()
      // auto replace twitter
      let matches = editor.getText().match(/(^|[^'"])(https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)[?]?(s=\d+)?)/)
      if (matches != null && window.editor) {
        const range = window.editor.getSelection()
        const index = range?.index || 0
        window.editor.deleteText(index, matches[0].length)
        window.editor.insertEmbed(index, 'twitter', { url: matches[0] }, 'Silent')
        window.editor.insertText(index + 1, '\u00a0', 'Silent')
        return
      }
      // auto replace youtube
      matches = editor.getText().match(/(http:|https:)?(\/\/)?(www\.)?(youtube.com|youtu.be)\/(watch|embed)?(\?v=|\/)?(\S+)?/)
      if (matches != null && window.editor) {
        const range = window.editor.getSelection()
        const index = range?.index || 0
        const url = sanitizeYoutubeLink(matches[0])
        if (url !== undefined) {
          window.editor.deleteText(index, matches[0].length)
          window.editor.insertEmbed(index, 'video', url, 'Silent')
        }
        return
      }
    }
    setPostText(value)
  }

  const handleSelectionChange = (range, source, editor) => {
    if (!window.editor || window.editor.hasFocus()) {
      const bounds = editor.getBounds(range?.index)
      bounds.left = -60 // keep toolbar positioned to left of editor
      bounds.top = bounds.top - 13
      setBlockToolbarLocation(bounds)
    }
  }

  modules.toolbar.handlers.image = async () => {
    const range = window.editor.getSelection(true)
    setIsLoading(true)
    const imgSrc = await handleImage(false)
    setIsLoading(false)
    restoreFocus()
    window.editor.insertEmbed(range?.index || 0, 'image', imgSrc)
  }

  return (
    <>
      <LoadingBackdrop isLoading={isLoading} />
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
        <ImageContainer
          onClick={() => handleImage(true)}
        >
          { featuredImg ? (
            <FeaturedImage src={featuredImg} alt='Placeholder ft img' />
          ) : (
            <>
              <FeaturedImage src='/editor/placeholder.png' alt='Placeholder ft img' />
              <CenteredText>FEATURE AN IMAGE</CenteredText>
            </>
          )
          }
        </ImageContainer>
      </TitleContainer>
      <div>
        <FormattingToolbar />
        <BlockToolbar
          handleImage={() => handleImage(false)}
          location={blockToolbarLocation}
        />
        <EditorContainer
          id='editor-container'
          placeholder='Begin writing your post'
          theme='bubble'
          ref={editorRef}
          value={postText}
          onChange={handleEditorChange}
          onChangeSelection={handleSelectionChange}
          modules={modules}
          formats={formats}
        />
      </div>
    </>
  )
}

export default ContentEditor
