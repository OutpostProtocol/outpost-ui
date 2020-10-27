import React from 'react'
import { Input } from '@material-ui/core'
import { styled } from '@material-ui/core/styles'

const Text = styled('h4')({
  fontWeight: 300
})

const FormTextField = styled(Input)({
  borderRadius: '4px',
  marginLeft: '3px',
  fontWeight: 300,
  width: '55px'
})

const Symbol = styled('h4')({
  marginLeft: '3px',
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
  const symbol = ' $'.concat(tokenSymbol) || ' $'
  return (
    <Container>
      <Text>
        Read Requirement:
      </Text>
      <FormTextField
        value={ readRequirement }
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
        { symbol }
      </Symbol>
    </ Container>
  )
}

export default ReadRequirement
