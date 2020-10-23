import {
  gql,
  useQuery
} from '@apollo/client'
import { ERROR_TYPES } from '../constants'

import { queries } from '../graphql'

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

// XXX: @Sam: This used to be:
// query {
//   allCommunities {
//     id
//     name
//     txId
//     slug
//   }
// }
// Hope it makes sense to reuse the existing query here. It'll return
// additional unnecessary data you're not interested in.
export const GET_ALL_COMMUNITIES = gql(queries.getAllCommunities)

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

export const useUser = (ethAddr) => {
  const GET_USER = gql(queries.getUser)
  const { data, loading, error } = useQuery(GET_USER, {
    variables: {
      ethAddr: ethAddr
    }
  })
  useErrorReporting(ERROR_TYPES.query, error, 'GET_USER')
  return { data, loading, error }
}

export const useIsNameAvailable = (name) => {
  const IS_NAME_AVAILABLE = gql(queries.isNameAvailable)

  const result = useQuery(IS_NAME_AVAILABLE, {
    variables: {
      name: name
    }
  })
  useErrorReporting(ERROR_TYPES.query, result?.error, 'IS_NAME_AVAILABLE')
  return result
}
