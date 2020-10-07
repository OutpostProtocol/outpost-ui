import {
  gql,
  useQuery
} from '@apollo/client'
import { ERROR_TYPES } from '../constants'

export const useErrorReporting = (type, error, request) => {
  if (error?.message) {
    // TODO: add mixpanel so we can error report
    const info = { // eslint-disable-line
      type,
      message: error.message,
      request
    }
  }
}

export const GET_ALL_COMMUNITIES = gql`
  query {
    community {
      id
      name
      txId
      blockHash
    }
  }`

/**
 * Get all communities
 *
 * @returns {Object} All the communities
 */
export const useCommunities = () => {
  const result = useQuery(GET_ALL_COMMUNITIES)
  useErrorReporting(ERROR_TYPES.query, result?.error, 'GET_ALL_COMMUNITIES')
  return result
}

/**
 * Get a community
 *
 * @returns {Object} a community
 */
export const useCommunity = () => {
  const JAMM_SLUG = 'jammsession'

  const GET_COMMUNITY = gql`
    query community($slug: String) {
      community(slug: $slug) {
        id
        name
        txId
        tokenAddress
        tokenSymbol
        description
        imageTxId
        readRequirement
        owner {
          name
          image
        }
      }
    }
  `
  const { loading, error, data } = useQuery(
    GET_COMMUNITY,
    {
      variables: {
        slug: JAMM_SLUG
      }
    })
  useErrorReporting(ERROR_TYPES.query, error, 'GET_COMMUNITY')
  return { data, loading, error }
}

export const useUser = (ethAddr) => {
  const GET_USER = gql`
    query user($ethAddr: String) {
      user(ethAddr: $ethAddr) {
        name,
        id
      }
    }
    `
  const { data, loading, error } = useQuery(GET_USER, {
    variables: {
      ethAddr: ethAddr
    }
  })
  useErrorReporting(ERROR_TYPES.query, error, 'GET_USER')
  return { data, loading, error }
}

export const useIsNameAvailable = (name) => {
  const IS_NAME_AVAILABLE = gql`
    query isNameAvailable($name: String!) {
      isNameAvailable(name: $name)
    }
  `

  const result = useQuery(IS_NAME_AVAILABLE, {
    variables: {
      name: name
    }
  })
  useErrorReporting(ERROR_TYPES.query, result?.error, 'IS_NAME_AVAILABLE')
  return result
}
