import { gql } from '@apollo/client'
import { queries } from '.'

export const getRefetchPostsQuery = (slug) => {
  return {
    query: gql(queries.getPosts),
    variables: {
      slug
    }
  }
}
