import React, {
  createContext, useEffect, useState, useContext
} from 'react'
import { useWeb3React } from '@web3-react/core'
import { useLazyQuery, gql } from '@apollo/client'
import useAuth from '../hooks/useAuth'

import { queries } from '../graphql'

export const RoleContext = createContext({
  roles: []
})

export const useAccountRoles = () => {
  return useContext(RoleContext)
}

export function RoleProvider ({ children }) {
  const [curAccount, setCurAccount] = useState(null)
  const { account } = useWeb3React()
  const { authToken } = useAuth()
  const [fetchRoles, { data, called, refetch, error }] = useLazyQuery(ROLE_QUERY, {
    context: {
      headers: {
        authorization: authToken
      }
    }
  })
  const [roles, setRoles] = useState([])

  useEffect(() => {
    if (account && account !== curAccount) {
      if (called) {
        refetch()
      } else {
        fetchRoles()
      }
      setCurAccount(account)
    }
  }, [account, curAccount, called, refetch, fetchRoles])

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error, refetch])

  useEffect(() => {
    if (data) {
      setRoles(data.userRoles)
    }
  }, [data, setRoles])

  return (
    <RoleContext.Provider value={roles}>
      {children}
    </RoleContext.Provider>
  )
}

const ROLE_QUERY = gql(queries.getUserRoles)
