import { useCallback, useContext } from 'react'
import store from 'store'
import { ERROR_TYPES, LOGIN_TOKEN } from '../constants'
import { useWeb3React } from '@web3-react/core'
import { useMutation, gql } from '@apollo/client'
import { ethers } from 'ethers'
import { AuthContext } from '../context/Auth'

import { mutations } from '../graphql'

const SIGN_IN_TOKEN = gql(mutations.getSignInToken)

const AUTHENTICATE = gql(mutations.authAccount)

// validate token isn't really a mutation but we want it to execute like one
const VALIDATE_TOKEN = gql(mutations.verifyToken)

const useAuth = () => {
  const { setAuthToken, authToken, setGettingToken, isGettingToken } = useContext(AuthContext)
  const { account, library } = useWeb3React()
  const [getAuthToken] = useMutation(SIGN_IN_TOKEN)
  const [authAccount] = useMutation(AUTHENTICATE)
  const [validateToken] = useMutation(VALIDATE_TOKEN)

  const checkError = useCallback(
    (loginRes) => {
      const { error } = loginRes
      if (error) {
        // TODO: ADD MIXPANEL
        const info = { // eslint-disable-line
          type: ERROR_TYPES.login,
          message: error.message
        }
        return true
      }
      return false
    },
    []
  )

  const validate = useCallback(
    async (token) => {
      const validation = await validateToken({
        variables: {
          token
        }
      })

      if (validation.data.verifyToken) {
        return true
      } else {
        return false
      }
    },
    [validateToken]
  )

  const fetchToken = async () => {
    setGettingToken(true)
    const tokenRes = await getAuthToken({
      variables: {
        addr: account
      }
    })

    checkError(tokenRes)
    let token = tokenRes.data.getSignInToken
    const signer = library.getSigner()

    let sig
    try {
      // signMessage with wc causes issues -.-
      if (library.provider.wc?.protocol === 'wc') {
        // convert token to hex to send
        token = ethers.utils.hexlify(Buffer.from(token, 'utf8'))
        sig = await library.provider.send('personal_sign', [token, account])
      } else {
        sig = await signer.signMessage(token)
      }
    } catch (e) {
      setGettingToken(false)
      return
    }

    const authRes = await authAccount({
      variables: {
        sig,
        addr: account
      }
    })

    checkError(authRes)
    store.set(`${LOGIN_TOKEN}.${account}`, authRes.data.authAccount)
    setAuthToken(authRes.data.authAccount)
    setGettingToken(false)
    return authRes.data.authAccount
  }

  return {
    fetchToken,
    isGettingToken,
    checkToken: validate,
    authToken,
    setAuthToken
  }
}

export default useAuth
