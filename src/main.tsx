import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BuyerConsole } from './buyer/BuyerConsole.tsx'

// The buyer console is a separate surface, not a tab. It mounts here rather than
// inside App so it sits outside StoreProvider — it cannot read a goal, a grant
// or the user's cap, because it is never inside the provider that holds them.
// See README, "Rules the UI is built to keep".
const isBuyer = window.location.pathname.startsWith('/buyer')

if (isBuyer) {
  document.documentElement.dataset.surface = 'buyer'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isBuyer ? <BuyerConsole /> : <App />}</StrictMode>,
)
