import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../App'
import { authAPI } from '../services/api'

export default function Login() {
  const { setUser }   = useAuth()
  const navigate      = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [bgImages, setBgImages] = useState([])
  // shuffled disimpan di ref agar tidak diacak ulang saat re-render
  const shuffledRef = useRef([])

  useEffect(() => {
    fetch('/api/bg-images')
      .then(r => r.json())
      .then(d => {
        const imgs = d.images || []
        shuffledRef.current = [...imgs].sort(() => Math.random() - 0.5)
        setBgImages(imgs)
      })
      .catch(() => {})
  }, []) // hanya jalan sekali saat mount

  async function handleSubmit(e) {
  e.preventDefault()
  setLoading(true); setError('')
  try {
    const data = await authAPI.login(form)
    
    // Tambah pengecekan ini ↓
    if (data.error) {
      setError(data.error)
      setLoading(false)
      return  // ← stop di sini, jangan navigate
    }

    setUser({ name: data.user_name })
    navigate('/dashboard')
  } catch(err) { 
    setError('Email atau password salah.')  // ← pesan lebih jelas
  }
  setLoading(false)
}

  const rows = [0,1,2,3,4]
  const shuffled = shuffledRef.current

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'flex-end', overflow:'hidden', background:'#0a0a0a', position:'relative' }}>

      <style>{`
        @keyframes slideRight { 0% { transform:translateX(-50%); } 100% { transform:translateX(0%); } }
        @keyframes slideLeft  { 0% { transform:translateX(0%);   } 100% { transform:translateX(-50%); } }
        @keyframes slideIn    { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      {/* ANIMATED BACKGROUND */}
      {bgImages.length > 0 && (
        <div style={{ position:'fixed', inset:0, zIndex:0, display:'flex', flexDirection:'column', gap:4, transform:'rotate(-5deg) scale(1.25)', opacity:0.5, pointerEvents:'none' }}>
          {rows.map(r => {
            const rowImgs = shuffled.slice(r*10, (r+1)*10)
            const pool = []
            while(pool.length < 32) pool.push(...(rowImgs.length ? rowImgs : ['#1a1a2e']))
            return (
              <div key={r} style={{ display:'flex', gap:4, flex:1, width:'200%', animation: r%2===0 ? 'slideRight 35s linear infinite' : 'slideLeft 35s linear infinite' }}>
                {pool.slice(0,32).map((img,i) => (
                  <div key={i} style={{ flexShrink:0, width:200, borderRadius:6, backgroundSize:'cover', backgroundPosition:'center', backgroundImage:`url('${img}')`, backgroundColor:'#1a1a2e' }}/>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* OVERLAY */}
      <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1, pointerEvents:'none'}}/>

      {/* LOGIN CARD */}
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:1100, padding:'0 60px', display:'flex', justifyContent:'flex-end' }}>
        <div className="auth-card" style={{animation:'slideIn 0.5s ease forwards'}}>
          
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px'}}>
            <img src="/Logo.png" alt="logo" style={{width:'36px', height:'36px', objectFit:'contain'}}/>
            <span style={{fontFamily:'Orbitron,sans-serif', fontSize:'1rem', fontWeight:900, color:'#fff', letterSpacing:'2px'}}>GAME HUNTER</span>
          </div>

          <h2>LOGIN</h2>
          <div className="subtitle">Masuk ke akunmu</div>
          {error && <div className="error-msg">⚠ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="email" placeholder="Email" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
            </div>
            <div className="form-group">
              <input type="password" placeholder="Password" required
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}/>
            </div>
            <button type="submit" onClick={handleSubmit} className="btn-login" disabled={loading}>
              {loading ? 'Loading...' : 'Masuk'}
            </button>
          </form>
          <div className="divider">atau</div>
          <Link to="/register" className="signup-link">Belum punya akun? <span>SIGN UP</span></Link>
        </div>
      </div>
    </div>
  )
}