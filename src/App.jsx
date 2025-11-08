import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/home.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<h1>About Page</h1>} />
      </Routes>
  )
}

export default App
