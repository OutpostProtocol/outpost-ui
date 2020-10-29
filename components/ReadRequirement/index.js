import React from 'react'
import { Input } from '@material-ui/core'
import { styled } from '@material-ui/core/styles'

const FormTextField = styled(Input)({
  borderRadius: '4px',
  marginLeft: '3px',
  width: '55px'
})

const Symbol = styled('p')({
  marginLeft: '3px'
})

const Container = styled('div')({
  display: 'inline-flex',
  alignItems: 'baseline'
})

const ReadRequirement = ({ activeCommunity, readRequirement, setReadRequirement }) => {
  const { tokenSymbol } = activeCommunity
  let displaySymbol
  if (tokenSymbol == null) displaySymbol = ' $'
  else displaySymbol = ' $'.concat(tokenSymbol)

  return (
    <Container>
      <p>
        Token Requirement:
      </p>
      <FormTextField
        value={readRequirement}
        fullWidth={false}
        placeholder = '0'
        disableUnderline={true}
        onChange = {(event) => {
          let value = event?.target?.value
          if (value || value === '') {
            value = value.replace(/\D/g, '')
            setReadRequirement(value)
          }
        }}
        inputProps={{ style: { textAlign: 'right' } }}
      />
      <Symbol>
        { displaySymbol }
      </Symbol>
    </ Container>
  )
}

export default ReadRequirement
