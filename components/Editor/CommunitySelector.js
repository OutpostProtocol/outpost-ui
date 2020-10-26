import React from 'react'
import { styled } from '@material-ui/core/styles'
import {
  Select,
  MenuItem
} from '@material-ui/core'

import { capitalize } from '../../utils'

const CommunitySelect = styled(Select)({
  float: 'left',
  'min-width': '150px'
})

const CommunitySelector = ({ setActiveCommunity, communities, activeCommunity, placeHolder, disabled }) => {
  const switchActiveCommunity = (event) => {
    if (event && event.target.value && !disabled) {
      setActiveCommunity(event.target.value)
    }
  }

  return (
    <CommunitySelect
      labelId='input-label'
      value={activeCommunity}
      onChange={switchActiveCommunity}
    >
      <MenuItem value={placeHolder} >
        <em>
          {capitalize(placeHolder.name)}
        </em>
      </MenuItem>
      {communities && communities.map((c, i) => {
        if (!c) return null
        return (
          <MenuItem
            key={i}
            value={c}>
            {capitalize(c.name)}
          </MenuItem>
        )
      })}
    </CommunitySelect>
  )
}

export default CommunitySelector
