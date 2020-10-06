import {
  injected,
  magic,
  walletconnect
} from '../../connectors'

const magicPrepare = (connector, options) => {
  const { email } = options
  connector.setEmail(email)
}

export const WalletConnect = {
  name: 'WalletConnect',
  imgSrc: '/wallet-icons/walletConnectIcon.svg',
  connector: walletconnect
}

export const MetaMask = {
  name: 'MetaMask',
  imgSrc: '/wallet-icons/metamask.svg',
  prepare: undefined,
  setup: undefined,
  connector: injected
}

export const MagicData = {
  name: 'Magic',
  imgSrc: '/wallet-icons/fortmatic.svg',
  prepare: magicPrepare,
  setup: undefined,
  connector: magic
}
