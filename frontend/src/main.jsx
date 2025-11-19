import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import {store} from './stores/store.js'
import { Provider } from "react-redux"

// Initialize theme from localStorage 

const savedTheme = (() => {
	try {
		const t = localStorage.getItem('theme')
		return t === 'dark' ? 'dark' : 'light'
	} catch {
		return 'dark'
	}
})
if (typeof document !== 'undefined') {
	document.documentElement.setAttribute('data-theme', savedTheme)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider  store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

