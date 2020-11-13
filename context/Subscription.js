import React, {
  createContext, useContext, useState, useEffect, useCallback
} from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import {
  SubscriptionABI, Framework, ISuperTokenABI, ERC20WithTokenInfoABI, SfABI
} from 'outpost-subscriptions'

import { SUBSCRIPTION_ADDRESS } from '../constants'

const SubscriptionContext = createContext({
  flowRate: null,
  hasSubscription: false,
  isInRewardSet: false,
  approveIda: () => { console.log('APPROVEIDA: FUNCTION DOES NOTHING') },
  subscribe: () => { console.log('SUBSCRIBE: FUNCTION DOES NOTHING') },
  terminateSubscription: () => { console.log('TERMINATE: FUNCTION DOES NOTHING') },
  extendSubscription: () => { console.log('EXTEND: FUNCTION DOES NOTHING') }
})

export const SubscriptionProvider = ({ children }) => {
  const { library, account } = useWeb3React()
  const [initialized, setInitialized] = useState(false)
  const [sf, setSf] = useState(null)
  const [subContract, setSubContract] = useState(null)
  const [flowRate, setFlowRate] = useState(0)
  const [acceptedToken, setERC20Token] = useState(null)
  const [superTokenAddress, setSuperToken] = useState(null)
  const [superTokenAllowance, setSuperTokenAllowance] = useState(0)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [idaIndex, setIdaIndex] = useState(0)

  const handleCheckSubscription = useCallback(
    async () => {
      if (!subContract || !account) {
        setHasSubscription(false)
      }

      const hasSub = await subContract.hasSubscription(account)
      setHasSubscription(hasSub)
    },
    [account, subContract]
  )

  const approveIda = async () => {
    await sf.host.callAgreement(
      sf.agreements.ida.address,
      sf.agreements.ida.interface.encodeFunctionData(
        'approveSubscription',
        [
          superTokenAddress,
          subContract.address,
          idaIndex,
          '0x'
        ]
      )
    )
  }

  const terminateSubscription = async () => {
    await sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.contract.methods.deleteFlow(
        superTokenAddress,
        account,
        subContract.address,
        '0x'
      )
        .encodeABI()
    )

    await handleCheckSubscription()
  }

  const checkApproval = useCallback(
    async (amount) => {
      if (superTokenAllowance.lt(amount)) {
        await acceptedToken.approve(
          superTokenAddress,
          amount.toString(),
          { from: account }
        )
      }
    },
    [acceptedToken, superTokenAllowance, account, superTokenAddress]
  )

  const extendSubscription = async (amount) => {
    // approve accepted token and upgrade to super token
    await checkApproval(amount)

    const xToken = new ethers.Contract(superTokenAddress, ISuperTokenABI, window.web3.getSigner())
    await xToken.upgrade(amount.toString(), { from: account })
  }

  const subscribe = async (amount) => {
    await checkApproval(amount)

    const call = [
      [
        2, // upgrade to super token
        superTokenAddress,
        sf.web3.eth.abi.encodeParameters(
          ['uint256'],
          [amount.toString()]
        )
      ],
      [
        4, // create constant flow (10/mo)
        sf.agreements.cfa.address,
        sf.agreements.cfa.contract.methods
          .createFlow(
            superTokenAddress,
            subContract.address,
            flowRate.toString(),
            '0x'
          )
          .encodeABI()
      ]
    ]

    await sf.host.batchCall(call, { from: account })
    await handleCheckSubscription()
  }

  useEffect(() => {
    const handleSubInfo = async () => {
      const [rate, tokenAddress, xToken] = await Promise.all([
        subContract.minFlowRate(),
        subContract.acceptedERC20Token(),
        subContract.acceptedSuperToken()
      ])

      setSuperToken(xToken)
      setFlowRate(rate)

      const token = new ethers.Contract(tokenAddress, ERC20WithTokenInfoABI, window.web3.getSigner())
      setERC20Token(token)
    }

    if (subContract) {
      handleSubInfo()
    }
  })

  useEffect(() => {
    const getAllowance = async () => {
      const allowance = await acceptedToken.allowance(account, superTokenAddress)
      setSuperTokenAllowance(allowance)
    }

    if (acceptedToken?.address && account && superTokenAddress) {
      getAllowance()
    }
  }, [acceptedToken, account, superTokenAddress])

  useEffect(() => {
    const handleInit = async () => {
      const superfluid = new Framework(window.web3)
      await superfluid.init()
      setSf(superfluid)

      const sub = new ethers.Contract(SUBSCRIPTION_ADDRESS, SubscriptionABI, window.web3.getSigner())
      setSubContract(sub)

      const [rate, tokenAddress, xToken, index] = await Promise.all([
        sub.minFlowRate(),
        sub.acceptedERC20Token(),
        sub.acceptedSuperToken(),
        sub.idaIndex()
      ])

      console.log(index, 'THE IDA INDEX set in use effect')
      setSuperToken(xToken)
      setFlowRate(rate)
      setIdaIndex(index)

      const token = new ethers.Contract(tokenAddress, ERC20WithTokenInfoABI, window.web3.getSigner())
      setERC20Token(token)
    }

    if (library && !initialized) {
      handleInit()
      setInitialized(true)
    }
  }, [library, initialized])

  useEffect(() => {
    if (subContract && account) {
      handleCheckSubscription()
    }
  }, [account, handleCheckSubscription, subContract])

  return (
    <SubscriptionContext.Provider
      value={{
        approveIda,
        subscribe,
        flowRate,
        hasSubscription,
        terminateSubscription,
        extendSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
