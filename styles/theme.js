import { createMuiTheme } from '@material-ui/core/styles'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1a1a1a'
    },
    secondary: {
      main: '#7000FF',
      contrastText: '#f1f1f1'
    },
    info: {
      main: '#c4c4c4'
    },
    background: {
      default: '#f1f1f1'
    }
  },
  typography: {
    fontFamily: 'Inter',
    button: {
      textTransform: 'none'
    }
  },
  zIndex: {
    snackbar: 2300,
    modal: 0
  }
})

export default theme
