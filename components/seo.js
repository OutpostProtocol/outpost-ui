/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

function SEO ({ canonical, description, lang, meta, title, image }) {
  const siteData = {
    title: 'Outpost',
    titleTemplate: '%s',
    description: 'Web3 newsletters owned by their creators.',
    author: 'https://www.outpost-protocol.com',
    url: 'https://www.outpost-protocol.com',
    image: '/Outpost_black.png',
    twitterUsername: '@OutpostProtocol'
  }

  const metaData = {
    description: description || siteData.description,
    title: title || siteData.title,
    image: image || siteData.image
  }

  return (
    <Helmet
      htmlAttributes={{
        lang
      }}
      title={metaData.title}
      titleTemplate={siteData.title === metaData.title ? siteData.title : `${metaData.title} - ${siteData.title}`}
      link={ canonical ? [{ rel: 'canonical', key: canonical, href: canonical }] : [] }
      meta={[
        {
          name: 'description',
          content: metaData.description
        },
        {
          property: 'og:title',
          content: metaData.title
        },
        {
          property: 'og:image',
          content: metaData.image
        },
        {
          property: 'og:description',
          content: metaData.description
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          name: 'twitter:card',
          content: 'summary'
        },
        {
          name: 'twitter:creator',
          content: siteData.twitterUsername
        },
        {
          name: 'twitter:title',
          content: metaData.title
        },
        {
          name: 'twitter:description',
          content: metaData.description
        }
      ].concat(meta)}
    />
  )
}

SEO.defaultProps = {
  lang: 'en',
  meta: [],
  description: ''
}

SEO.propTypes = {
  canonical: PropTypes.string,
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string
}

export default SEO
