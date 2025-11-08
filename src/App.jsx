import { Routes, Route } from 'react-router-dom'
import Home from './pages/home.jsx'
import './App.css'

function App() {

  return (
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<h1>About Page</h1>} />
      </Routes>
  )
}

export default App
