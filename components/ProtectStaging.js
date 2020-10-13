import React from 'react'
import Toolbar from './Toolbar'
import useAuth from '../hooks/useAuth'
import { useWeb3React } from '@web3-react/core'

const NODE_ENV = process.env.NODE_ENV

const ProtectStaging = ({ children }) => {
  if (NODE_ENV !== 'staging') {
    return (
      <>
        {children}
      </>
    )
  }

  return (
    <StagingProtector>
      {children}
    </StagingProtector>
  )
}

const StagingProtector = ({ children }) => {
  const { account } = useWeb3React()
  const { authToken } = useAuth()
}

export default ProtectStaging
