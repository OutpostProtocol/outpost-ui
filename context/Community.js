import React, { createContext, useContext } from 'react'

const CommunityContext = createContext(null)

export const CommunityProvider = ({ children, community }) => (
  <CommunityContext.Provider value={community}>
    {children}
  </CommunityContext.Provider>
)

export const useCommunity = () => useContext(CommunityContext)
