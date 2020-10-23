import React, { useState, useEffect } from 'react'
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
  const [activeCommunity, setActiveCommunity] = useState(placeHolder)
  const [communities, setCommunities] = useState([])

  const switchActiveCommunity = (event) => {
    if (event && event.target.value && !disabled) {
      setActiveCommunity(event.target.value)
      handleSelection(event.target.value)
    }
  }

  useEffect(() => {
    const coms = {}
    roles.forEach(r => {
      coms[r.community.name] = r.community
    })

    setCommunities(Object.values(coms))
  }, [roles])

  // Help the user. If there's only one community to select, pick it for them.
  useEffect(() => {
    if (Array.isArray(communities) && communities.length === 1) {
      const [community] = communities
      setActiveCommunity(community)
      handleSelection(community)
    }
  }, [communities, setCommunities])

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
        if (!c) return
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
