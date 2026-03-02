import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../App'
import { authAPI } from '../services/api'

export default function Register() {
  const { setUser } = useAuth()
  const navigate    = useNavigate()
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm_password:'' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [bgImages, setBgImages] = useState([])
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
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await authAPI.register(form)
      setUser({ name: data.user_name })
      navigate('/dashboard')
    } catch(err) { setError(err.message) }
    setLoading(false)
  }

  const set = field => e => setForm({...form, [field]: e.target.value})
  const rows = [0,1,2,3,4]
  const shuffled = shuffledRef.current

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'flex-end', overflow:'hidden', background:'#0a0a0a', position:'relative' }}>

      <style>{`
        @keyframes slideRight { 0% { transform:translateX(-50%); } 100% { transform:translateX(0%); } }
        @keyframes slideLeft  { 0% { transform:translateX(0%);   } 100% { transform:translateX(-50%); } }
      `}</style>

      {bgImages.length > 0 && (
        <div style={{ position:'fixed', inset:0, zIndex:0, display:'flex', flexDirection:'column', gap:4, transform:'rotate(-5deg) scale(1.25)', opacity:0.5, pointerEvents:'none' }}>
          {rows.map(r => {
            const rowImgs = shuffled.slice(r*10, (r+1)*10)
            const pool = []
            while(pool.length < 32) pool.push(...(rowImgs.length ? rowImgs : ['']))
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

      <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1, pointerEvents:'none'}}/>

      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:1100, padding:'0 60px', display:'flex', justifyContent:'flex-end' }}>
        <div className="auth-card">

          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px'}}>
            <img src="/Logo.png" alt="logo" style={{width:'36px', height:'36px', objectFit:'contain'}}/>
            <span style={{fontFamily:'Orbitron,sans-serif', fontSize:'1rem', fontWeight:900, color:'#fff', letterSpacing:'2px'}}>GAME HUNTER</span>
          </div>

          <h2>SIGN UP</h2>
          <div className="subtitle">Buat akun baru</div>
          {error && <div className="error-msg">⚠ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group"><input placeholder="Username" required value={form.name} onChange={set('name')}/></div>
            <div className="form-group"><input type="email" placeholder="Email" required value={form.email} onChange={set('email')}/></div>
            <div className="form-group"><input type="password" placeholder="Password" required value={form.password} onChange={set('password')}/></div>
            <div className="form-group"><input type="password" placeholder="Konfirmasi Password" required value={form.confirm_password} onChange={set('confirm_password')}/></div>
            <button type="submit" className="btn-login" disabled={loading}>{loading ? 'Loading...' : 'Daftar'}</button>
          </form>
          <div className="divider">atau</div>
          <Link to="/login" className="signup-link">Sudah punya akun? <span>LOGIN</span></Link>
        </div>
      </div>
    </div>
  )
}