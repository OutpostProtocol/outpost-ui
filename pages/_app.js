import React from 'react'
import {
  ThemeProvider,
  StylesProvider,
  createMuiTheme
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
import { MixpanelProvider } from '../context/Mixpanel'

import '../styles/global.css'

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

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1a1a1a'
    },
    secondary: {
      main: '#7000FF',
      contrastText: '#f1f1f1'
    },
    info: {
      main: '#c4c4c4'
    },
    background: {
      default: '#f1f1f1'
    }
  },
  typography: {
    fontFamily: 'Roboto',
    button: {
      textTransform: 'none'
    }
  },
  zIndex: {
    snackbar: 2300,
    modal: 0
  }
})

const getLibrary = (provider, connector) => {
  window.web3 = new ethers.providers.Web3Provider(provider)
  return window.web3
}

function OutpostApp ({ Component, pageProps }) {
  return (
    <ApolloProvider client={client} >
      <StylesProvider injectFirst >
        <ThemeProvider theme={theme}>
          <Web3ReactProvider getLibrary={getLibrary}>
            <AuthProvider >
              <MixpanelProvider>
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
              </MixpanelProvider>
            </AuthProvider>
          </Web3ReactProvider>
        </ThemeProvider>
      </StylesProvider>
    </ApolloProvider>
  )
}

export default OutpostApp
