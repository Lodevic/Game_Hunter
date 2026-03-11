import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { authAPI } from './services/api'
import LandingPage       from './pages/LandingPage'
import Dashboard         from './pages/Dashboard'
import Rekomendasi       from './pages/Rekomendasi'
import Search            from './pages/Search'
import Favorit           from './pages/Favorit'
import Login             from './pages/Login'
import Register          from './pages/Register'
import SistemRekomendasi from './pages/SistemRekomendasi'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0a0a',color:'#555',fontFamily:'Rajdhani,sans-serif',fontSize:'1rem',letterSpacing:'2px'}}>LOADING...</div>
  return user ? children : <Navigate to="/" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0a0a',color:'#555',fontFamily:'Rajdhani,sans-serif',fontSize:'1rem',letterSpacing:'2px'}}>LOADING...</div>
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authAPI.me()
      .then(data => {
        if (data.logged_in) setUser({ name: data.user_name, id: data.user_id })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/dashboard"          element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/rekomendasi"        element={<PrivateRoute><Rekomendasi /></PrivateRoute>} />
          <Route path="/search"             element={<PrivateRoute><Search /></PrivateRoute>} />
          <Route path="/favorit"            element={<PrivateRoute><Favorit /></PrivateRoute>} />
          <Route path="/sistem-rekomendasi" element={<PrivateRoute><SistemRekomendasi /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}