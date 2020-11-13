import React, {
  createContext, useContext, useEffect, useState
} from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers, BigNumber } from 'ethers'

import { TOKEN_ABI } from '../constants'

const CommunityContext = createContext({
  community: null,
  userTokenBalance: 0
})

export const CommunityProvider = ({ children, community }) => {
  const [userTokenBalance, setUserTokenBalance] = useState(0)
  const { account, library } = useWeb3React()

  useEffect(() => {
    const setBalance = async () => {
      const token = new ethers.Contract(tokenAddress, TOKEN_ABI, library)
      const [balance, decimals] = await Promise.all([
        token.balanceOf(account),
        token.decimals()
      ])

      const divisor = BigNumber.from(10).pow(decimals)
      setUserTokenBalance(balance.div(divisor).toNumber())
    }

    const { tokenAddress } = community

    if (account && tokenAddress) {
      setBalance()
    }
  }, [account, community, library])

  return (
    <CommunityContext.Provider
      value={{ userTokenBalance, community }}
    >
      {children}
    </CommunityContext.Provider>
  )
}

export const useCommunity = () => useContext(CommunityContext)
