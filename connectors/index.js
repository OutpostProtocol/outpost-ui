import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { MagicConnector } from './magicConnector'

const POLLING_INTERVAL = 10000
const NETWORK_URL = process.env.NEXT_PUBLIC_ETH_GATEWAY

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42]
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { 1: NETWORK_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
})

export const magic = new MagicConnector({ apiKey: process.env.NEXT_PUBLIC_MAGIC_KEY, chainId: 1 })
