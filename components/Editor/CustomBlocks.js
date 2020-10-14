import { Quill } from 'react-quill'
const BaseBlock = Quill.import('blots/block/embed')
const CodeBlock = Quill.import('formats/code-block')
const Blockquote = Quill.import('formats/blockquote')

export const registerCustomBlocks = () => {
  class InlineStyleCodeBlock extends CodeBlock {
    static create (value) {
      const node = super.create()
      node.setAttribute('style', 'background-color: #23241f; color: #f8f8f2;' +
        ' margin: 0px; padding: 0px;' +
        ' border-radius: 3px; overflow: visible; white-space: pre-wrap;' +
        ' counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7;')
      return node
    }
  }
  InlineStyleCodeBlock.blotName = 'code-block'
  InlineStyleCodeBlock.tagName = 'pre'
  Quill.register(InlineStyleCodeBlock, true)

  class InlineStyleBlockquote extends Blockquote {
    static create (value) {
      const node = super.create()
      node.setAttribute('style', 'background: #f9f9f9; border-left: 5px solid #1a1a1a;' +
        'margin: 1.5em 10px; padding: 0.5em 10px;')
      return node
    }
  }
  InlineStyleBlockquote.blotName = 'blockquote'
  InlineStyleBlockquote.tagName = 'blockquote'
  Quill.register(InlineStyleBlockquote, true)

  class TwitterBlot extends BaseBlock {
    static create (data) {
      const node = super.create(data)
      function buildInnerHtml (data) {
        window.twitter = function () {
          const loadScript = function (url) {
            return new Promise((resolve, reject) => {
              const script = document.createElement('script')
              script.src = url
              script.onload = function () {
                resolve(true)
              }
              script.onerror = function () {
                reject(new Error('Unable to load script'))
              }
              document.head.appendChild(script)
            })
          }
          if (!window.twttr) {
            loadScript('//platform.twitter.com/widgets.js').then(() => {
              setTimeout(() => {
                window.twttr.widgets.load()
              }, 100)
            })
          } else {
            setTimeout(() => {
              window.twttr.widgets.load()
            }, 100)
          }
        }
        return `
          <div style="display: flex; margin: auto; width: 90%; max-width: 100%">
            <blockquote class="twitter-tweet blank-quote">
              <div id="temporary-loader" class="loader" />
              <a tabindex="-1" href="${data.url}"></a>
            </blockquote>
            <img src="*" onError="event.stopPropagation(); event.preventDefault(); window.twitter();" style="display: none;"/>
          </div>
        `
      }

      const innerHTML = buildInnerHtml(data)
      node.innerHTML = innerHTML
      node.setAttribute('data-url', data.url)
      return node
    }

    static value (domNode) {
      const { url } = domNode.dataset
      return { url }
    }

    index () {
      return 1
    }
  }

  TwitterBlot.blotName = 'twitter'
  TwitterBlot.className = 'ql-twitter'
  TwitterBlot.tagName = 'div'

  Quill.register({
    'formats/twitter': TwitterBlot
  })
}

const getYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  return (match && match[2].length === 11)
    ? match[2]
    : null
}

export const sanitizeYoutubeLink = (url) => {
  const id = getYoutubeId(url)
  if (!id) return undefined
  return 'https://www.youtube.com/embed/' + id
}

export const getTweet = (url) => {
  const matches = url.match(/(^|[^'"])(https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)[?]?(s=\d+)?)/)
  if (matches) return matches[0]
  return undefined
}

export const getYoutubeVideo = (url) => {
  const matches = url.match(/(http:|https:)?(\/\/)?(www\.)?(youtube.com|youtu.be)\/(watch|embed)?(\?v=|\/)?(\S+)?/)
  if (matches) return sanitizeYoutubeLink(matches[0])
  return undefined
}
