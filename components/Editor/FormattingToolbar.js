import React from 'react'
import { Quill } from 'react-quill'
import {
  getTweet,
  getYoutubeVideo
} from './CustomBlocks'

// Register inline styling
const DirectionAttribute = Quill.import('attributors/attribute/direction')
Quill.register(DirectionAttribute, true)

const AlignClass = Quill.import('attributors/class/align')
Quill.register(AlignClass, true)

const BackgroundClass = Quill.import('attributors/class/background')
Quill.register(BackgroundClass, true)

const ColorClass = Quill.import('attributors/class/color')
Quill.register(ColorClass, true)

const DirectionClass = Quill.import('attributors/class/direction')
Quill.register(DirectionClass, true)

const FontClass = Quill.import('attributors/class/font')
Quill.register(FontClass, true)

const SizeClass = Quill.import('attributors/class/size')
Quill.register(SizeClass, true)

const AlignStyle = Quill.import('attributors/style/align')
Quill.register(AlignStyle, true)

const BackgroundStyle = Quill.import('attributors/style/background')
Quill.register(BackgroundStyle, true)

const ColorStyle = Quill.import('attributors/style/color')
Quill.register(ColorStyle, true)

const DirectionStyle = Quill.import('attributors/style/direction')
Quill.register(DirectionStyle, true)

const FontStyle = Quill.import('attributors/style/font')
Quill.register(FontStyle, true)

const SizeStyle = Quill.import('attributors/style/size')
Quill.register(SizeStyle, true)

// Custom matchers for clipboard
const ignoreEmptyParagraphs = (node, delta) => {
  return { ops: [] }
}

const embedTweet = (node) => {
  const tweetUrl = getTweet(node.textContent)
  if (tweetUrl) {
    return { ops: [{
      insert: {
        twitter: { url: tweetUrl }
      }
    }] }
  }
  return undefined
}

const embedYoutubeVideo = (node) => {
  const youtubeUrl = getYoutubeVideo(node.textContent)
  if (youtubeUrl) {
    return { ops: [{
      insert: {
        video: youtubeUrl
      }
    }] }
  }
  return undefined
}

const autoEmbed = (node, delta) => {
  let modifiedDelta = embedTweet(node)
  if (modifiedDelta) return modifiedDelta
  modifiedDelta = embedYoutubeVideo(node)
  if (modifiedDelta) return modifiedDelta
  return delta
}

// Modules object for setting up the Quill editor
export const modules = {
  toolbar: {
    container: '#toolbar',
    handlers: {
    }
  },
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true
  },
  clipboard: {
    matchVisual: true,
    matchers: [
      ['br', ignoreEmptyParagraphs],
      [Node.TEXT_NODE, autoEmbed]
    ]
  }
}

// Formats objects for setting up the Quill editor
export const formats = [
  'bold',
  'italic',
  'underline',
  'header',
  'align',
  'link',
  'code-block',
  'twitter',
  'video',
  'list',
  'blockquote',
  'image'
]

const FormattingToolbar = () => (
  <div id='toolbar'>
    <span className='ql-formats'>
      <button className='ql-header' value='1' />
      <button className='ql-header' value='2' />
      <button className='ql-bold' />
      <button className='ql-italic' />
      <button className='ql-underline' />
    </span>
    <span className='ql-formats'>
      <button className='ql-code-block' />
      <button className='ql-blockquote' />
      <button className='ql-link' />
    </span>
    <span className='ql-formats'>
      <button className='ql-list' value='ordered' />
      <button className='ql-list' value='bullet' />
      <select className='ql-align' />
    </span>
  </div>
)

export default FormattingToolbar
