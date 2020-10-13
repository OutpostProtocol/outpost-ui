import React, {
  createContext, useReducer, useCallback,
  useEffect, useState, useContext
} from 'react'
import { useWeb3React } from '@web3-react/core'
import { useLazyQuery, gql } from '@apollo/client'

export const RoleContext = createContext({
  roles: []
})

export const useAccountRoles = () => {
  return useContext(RoleContext)
}

export function RoleProvider ({ children }) {
  const [curAccount, setCurAccount] = useState(null)
  const { account } = useWeb3React()
  const [fetchRoles, { loading, data, called, refetch }] = useLazyQuery(ROLE_QUERY, { variables: { ethAddr: account } })
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
  }, [account, account, curAccount, called, refetch, fetchRoles])

  useEffect(() => {
    if (data) {
      setRoles(data.roles)
    }
  }, [data])

  return (
    <RoleContext.Provider value={roles}>
      {children}
    </RoleContext.Provider>
  )
}

const ROLE_QUERY = gql`
  query roles($ethAddr: String) {
    roles(ethAddr: $ethAddr) {
      title
      community {
        txId
        name
      }
    }
  }
`
