import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Smoothly dismiss preloader when React mounts
const preloader = document.querySelector('.sm-preloader, .cinematic-preloader')
if (preloader) {
  preloader.classList.add('fade-out')
  setTimeout(() => preloader.remove(), 100)
}

createRoot(document.getElementById('root')).render(<App />)

