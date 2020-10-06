/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Head from 'next/head'

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
    <Head>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="theme-color" content="#ffffff" />
      <title>{metaData.title}</title>
      <link ref="canonical" key='canonical' href={canonical} />
      <meta name='description' content={metaData.description} />
      <meta name='og:title' content={metaData.title} />
      <meta name='og:image' content={metaData.image} />
      <meta name='og:description' content={metaData.description} />
      <meta name='og:type' content='website' />
      <meta name='twitter:card' content='summary' />
      <meta name='twitter:title' content={metaData.title} />
      <meta name='twitter:description' content={metaData.description} />
    </Head>
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
