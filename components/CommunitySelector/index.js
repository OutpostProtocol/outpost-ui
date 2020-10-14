import React, { useState } from 'react'
import { styled } from '@material-ui/core/styles'
import {
  Select,
  MenuItem
} from '@material-ui/core'

import { capitalize } from '../../utils'
import { useAccountRoles } from '../../context/Role'

const CommunitySelect = styled(Select)({
  float: 'left',
  'min-width': '150px'
})

const CommunitySelector = ({ handleSelection, placeHolder, disabled }) => {
  const roles = useAccountRoles()
  const initialCommunity = roles && roles[0] && roles[0].community
  const [activeCommunity, setActiveCommunity] = useState(initialCommunity || placeHolder)

  const switchActiveCommunity = (event) => {
    if (event && event.target.value && !disabled) {
      setActiveCommunity(event.target.value)
      handleSelection(event)
    }
  }

  return (
    <CommunitySelect
      labelId='input-label'
      value={activeCommunity}
      onChange={switchActiveCommunity}
    >
      {roles && roles.map((r, i) => {
        if (!r || !r.community) return
        const com = r.community
        return (
          <MenuItem
            key={i}
            value={com}>
            {capitalize(com.name)}
          </MenuItem>
        )
      })}
    </CommunitySelect>
  )
}

export default CommunitySelector
