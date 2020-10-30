import { useCallback, useContext } from 'react'
import axios from 'axios'
import store from 'store'
import { ERROR_TYPES, LOGIN_TOKEN } from '../constants'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { AuthContext } from '../context/Auth'

const OUTPOST_API = process.env.NEXT_PUBLIC_OUTPOST_API

const useAuth = () => {
  const { setAuthToken, authToken, setGettingToken, isGettingToken } = useContext(AuthContext)
  const { account, library } = useWeb3React()

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
      const validationRes = await axios.post(
        `${OUTPOST_API}/relay/verify-challenge`,
        { token }
      )

      console.log(validationRes, 'THE RESULT')

      if (validationRes.data) {
        return true
      } else {
        return false
      }
    },
    []
  )

  const fetchToken = async () => {
    if (!account) return false
    setGettingToken(true)
    const challengeRes = await axios.post(
      `${OUTPOST_API}/relay/get-challenge`,
      { address: account }
    )

    checkError(challengeRes)
    let token = challengeRes.data

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

    const verifyRes = await axios.post(
      `${OUTPOST_API}/relay/verify-challenge`,
      {
        signature: sig,
        address: account
      }
    )

    checkError(verifyRes)
    store.set(`${LOGIN_TOKEN}.${account}`, verifyRes.data)
    setAuthToken(verifyRes.data)
    setGettingToken(false)
    return verifyRes.data
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
