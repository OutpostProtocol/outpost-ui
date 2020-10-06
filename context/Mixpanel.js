import React, {
  createContext,
  cloneElement,
  useContext
} from 'react'

import mixpanel from 'mixpanel-browser'

const MixpanelContext = createContext(mixpanel)

export const MixpanelProvider = ({ children }) => (
  <MixpanelContext.Provider value={mixpanel}>
    {children}
  </MixpanelContext.Provider>
)

export const MixpanelConsumer = ({ children }) => (
  <MixpanelContext.Consumer>
    {mixpanel => cloneElement(children, { mixpanel })}
  </MixpanelContext.Consumer>
)

export const useMixpanel = () => useContext(MixpanelContext)

export { mixpanel }
