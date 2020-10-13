import React from 'react'
import { styled } from '@material-ui/core/styles'
import Web3Status from './Web3Status'
import { useAccountRoles } from '../context/Role'
import { useWeb3React } from '@web3-react/core'

const NODE_ENV = process.env.NODE_ENV

const ProtectStaging = ({ children }) => {
  if (NODE_ENV !== 'staging') {
    return children
  }

  return (
    <StagingProtector>
      {children}
    </StagingProtector>
  )
}

const Container = styled('div')({
  height: '100vh',
  display: 'flex',
  'justify-content': 'center',
  'align-items': 'center',
  'flex-direction': 'column'
})

const Text = styled('div')({
  'font-size': '2em',
  'margin-bottom': '1em'
})

const StagingProtector = ({ children }) => {
  const { account } = useWeb3React()
  const roles = useAccountRoles()

  if (roles.length === 0) {
    return (
      <Container>
        <Text>
          You must be whitelisted to access this version of the site.
        </Text>
        <Web3Status />
      </Container>
    )
  }

  return children
}

export default ProtectStaging
