import React, { useEffect } from 'react'
import {
  ThemeProvider,
  StylesProvider
} from '@material-ui/core/styles'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink
} from '@apollo/client'
import { Web3ReactProvider } from '@web3-react/core'
import { ethers } from 'ethers'
import fetch from 'isomorphic-fetch'
import { AuthProvider } from '../context/Auth'
import { RoleProvider } from '../context/Role'
import theme from '../styles/theme'

import '../styles/global.css'
import 'react-quill/dist/quill.bubble.css'

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_OUTPOST_API,
  fetch
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  onError: ({ networkError, graphQLErrors }) => {
    console.log('graphQLErrors', graphQLErrors)
    console.log('networkError', networkError)
  }
})

const getLibrary = (provider, connector) => {
  window.web3 = new ethers.providers.Web3Provider(provider)
  return window.web3
}

function OutpostApp ({ Component, pageProps }) {
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, [])

  return (
    <ApolloProvider client={client} >
      <StylesProvider injectFirst >
        <ThemeProvider theme={theme}>
          <Web3ReactProvider getLibrary={getLibrary}>
            <AuthProvider >
              <RoleProvider>
                <main
                  style={{
                    height: '100%',
                    width: '100%',
                    top: '0',
                    left: '0'
                  }}
                >
                  <Component {...pageProps} />
                </main>
              </RoleProvider>
            </AuthProvider>
          </Web3ReactProvider>
        </ThemeProvider>
      </StylesProvider>
    </ApolloProvider>
  )
}

export default OutpostApp
