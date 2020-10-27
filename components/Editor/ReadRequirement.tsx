import React from 'react'
import { Input } from '@material-ui/core'
import { styled } from '@material-ui/core/styles'

const Text = styled('h4')({
  fontWeight: 300
})

const FormTextField = styled(Input)({
  width: '70px',
  'border-radius': '4px',
  fontWeight: 300
})

const Symbol = styled('h4')({
  marginRight: '3px',
  marginLeft: '10px',
  fontWeight: 300
})

const Container = styled('div')({
  display: 'inline-flex',
  alignItems: 'baseline',
  paddingLeft: '20px'
})

interface Props {
  tokenSymbol: string,
  readRequirement: string,
  setReadRequirement: Function
}

const ReadRequirement = ({ tokenSymbol, readRequirement, setReadRequirement }: Props) => {
  const symbol = '$'.concat(tokenSymbol) || '$'
  return (
    <Container>
      <Text>
        Read Requirement:
      </Text>
      <Symbol>
        { symbol }
      </Symbol>
      <FormTextField
        value={ '' + readRequirement }
        placeholder = '0'
        disableUnderline={true}
        onChange = {(event) => {
          let value = event?.target?.value
          if (value || value === '') {
            value = value.replace(/\D/g, '')
            setReadRequirement(value)
          }
        }}
      />
    </ Container>
  )
}

export default ReadRequirement
