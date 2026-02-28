import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App'
import { authAPI } from '../services/api'

function compressImage(dataUrl, maxSize = 200, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.width, h = img.height
      if (w > h) { if (w > maxSize) { h = h * maxSize / w; w = maxSize } }
      else        { if (h > maxSize) { w = w * maxSize / h; h = maxSize } }
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}

export default function Navbar() {
  const { user, setUser } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const fileRef   = useRef(null)

  const [showLogout,  setShowLogout]  = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [editMode,    setEditMode]    = useState(false)
  const [bio,         setBio]         = useState('Game Hunter Member')
  const [editBio,     setEditBio]     = useState('')
  const [image,       setImage]       = useState(null)
  const [previewImg,  setPreviewImg]  = useState(null)

  useEffect(() => {
    setShowProfile(false)
    setShowLogout(false)
    setEditMode(false)
  }, [location.pathname])

  useEffect(() => {
    if (!user) return
    fetch('/api/profile/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setBio(d.bio || 'Game Hunter Member')
        setImage(d.image || null)
      }).catch(() => {})
  }, [user])

  // ✅ Dengerin event dari luar (misal refresh setelah save)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.image) setImage(e.detail.image)
      if (e.detail?.bio)   setBio(e.detail.bio)
    }
    window.addEventListener('profile-updated', handler)
    return () => window.removeEventListener('profile-updated', handler)
  }, [])

  async function handleLogout() {
    await authAPI.logout()
    setUser(null)
    navigate('/login')
  }

  function openProfile() {
    setEditBio(bio)
    setPreviewImg(image)
    setEditMode(false)
    setShowProfile(true)
  }

  async function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const compressed = await compressImage(ev.target.result, 200, 0.75)
      setPreviewImg(compressed)
    }
    reader.readAsDataURL(file)
  }

  async function saveEdit() {
    try {
      await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bio: editBio, image: previewImg })
      })
      setBio(editBio)
      setImage(previewImg)
      setEditMode(false)

      // ✅ Broadcast ke semua komponen (Dashboard, dll) bahwa profil berubah
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: { image: previewImg, bio: editBio }
      }))
    } catch(e) {}
  }

  const isValidImg = (src) => src && typeof src === 'string' && src.startsWith('data:image')
  const isActive = (path) => location.pathname === path

  return (
    <>
      <style>{`
        .navbar {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center;
          padding: 0 40px; height: 60px;
          background: #0a0a0a;
          border-bottom: 1px solid #1a1a1a;
        }
        .logo {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem; font-weight: 900;
          color: #fff; text-decoration: none;
          letter-spacing: 2px; margin-right: auto;
        }
        .nav-links { display: flex; gap: 32px; }
        .nav-link {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          color: #666; text-decoration: none;
          letter-spacing: 0.5px; transition: color 0.2s;
        }
        .nav-link:hover { color: #fff; }
        .nav-link.active { color: #e63946; }
        .nav-actions { display: flex; align-items: center; gap: 12px; margin-left: 32px; }
        .avatar-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: #1f1f1f; border: 1.5px solid #2a2a2a;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #666; transition: all 0.2s;
          overflow: hidden; padding: 0;
        }
        .avatar-btn:hover { border-color: #e63946; }
        .avatar-btn svg { width: 20px; height: 20px; }
        .btn-logout {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 16px; background: transparent;
          border: 1.5px solid #222; border-radius: 6px;
          color: #555; font-family: 'Rajdhani', sans-serif;
          font-size: 0.88rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-logout:hover { border-color: #e63946; color: #e63946; }
        .gh-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          animation: ghFade 0.15s ease;
        }
        @keyframes ghFade { from{opacity:0} to{opacity:1} }
        .profile-overlay {
          position: fixed; inset: 0; z-index: 500;
          display: flex; align-items: flex-start; justify-content: flex-end;
          padding-top: 68px; padding-right: 24px;
          animation: ghFade 0.15s ease;
        }
        .profile-popup {
          background: #141414; border: 1px solid #2a2a2a;
          border-radius: 16px; width: 300px; overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.9);
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from{opacity:0;transform:translateY(-10px)}
          to{opacity:1;transform:translateY(0)}
        }
        .profile-header {
          background: linear-gradient(135deg, #1a0808, #200e0e);
          padding: 28px 24px 20px; text-align: center;
          border-bottom: 1px solid #1f1f1f;
        }
        .avatar-large {
          width: 80px; height: 80px; border-radius: 50%;
          background: #2a2a2a; border: 3px solid #e63946;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px; overflow: hidden; position: relative;
          cursor: pointer;
        }
        .avatar-large img { width:100%; height:100%; object-fit:cover; }
        .avatar-large svg { width:44px; height:44px; }
        .avatar-edit-overlay {
          position:absolute; inset:0;
          background:rgba(0,0,0,0.55);
          display:flex; align-items:center; justify-content:center;
          opacity:0; transition:opacity 0.2s; font-size:1.2rem; color:#fff;
        }
        .avatar-large:hover .avatar-edit-overlay { opacity:1; }
        .profile-name-txt {
          font-family:'Orbitron',sans-serif; font-size:1rem;
          font-weight:900; color:#fff; letter-spacing:1px; margin-bottom:4px;
        }
        .profile-bio-txt { font-family:'Rajdhani',sans-serif; font-size:0.85rem; color:#555; font-weight:600; }
        .edit-field {
          width:100%; background:#0f0f0f; border:1px solid #2a2a2a;
          border-radius:6px; padding:8px 12px; color:#fff;
          font-family:'Rajdhani',sans-serif; font-size:0.9rem;
          outline:none; box-sizing:border-box; margin-top:8px;
        }
        .edit-field:focus { border-color:#e63946; }
        .profile-body { padding:16px 20px; }
        .profile-stat {
          display:flex; justify-content:space-between; align-items:center;
          padding:9px 0; border-bottom:1px solid #1a1a1a;
          font-family:'Rajdhani',sans-serif; font-size:0.88rem; color:#555; font-weight:600;
        }
        .profile-stat:last-child { border-bottom:none; }
        .profile-stat span:last-child { color:#888; }
        .profile-footer { display:flex; border-top:1px solid #1a1a1a; }
        .profile-footer button {
          flex:1; padding:12px; background:transparent; border:none;
          font-family:'Rajdhani',sans-serif; font-size:0.85rem;
          font-weight:700; cursor:pointer; transition:all 0.2s; letter-spacing:1px;
        }
        .pf-edit  { color:#e63946 !important; border-right:1px solid #1a1a1a !important; }
        .pf-edit:hover  { background:rgba(230,57,70,0.08) !important; }
        .pf-save  { color:#4ade80 !important; border-right:1px solid #1a1a1a !important; }
        .pf-save:hover  { background:rgba(74,222,128,0.08) !important; }
        .pf-close { color:#444 !important; }
        .pf-close:hover { background:#1a1a1a !important; color:#666 !important; }
        .logout-box {
          background:#141414; border:1px solid #2a2a2a;
          border-radius:14px; width:360px; padding:32px 28px;
          text-align:center; box-shadow:0 24px 80px rgba(0,0,0,0.9);
          animation:slideDown 0.2s ease;
        }
        .logout-icon { font-size:2.5rem; margin-bottom:16px; }
        .logout-title {
          font-family:'Orbitron',sans-serif; font-size:0.95rem;
          font-weight:900; color:#fff; letter-spacing:1px; margin-bottom:8px;
        }
        .logout-sub { font-family:'Rajdhani',sans-serif; font-size:0.9rem; color:#555; font-weight:600; margin-bottom:28px; }
        .logout-actions { display:flex; gap:12px; }
        .btn-cancel {
          flex:1; padding:12px; background:transparent;
          border:1.5px solid #222; border-radius:8px; color:#555;
          font-family:'Rajdhani',sans-serif; font-size:0.95rem; font-weight:700; cursor:pointer; transition:all 0.2s;
        }
        .btn-cancel:hover { border-color:#444; color:#888; }
        .btn-confirm {
          flex:1; padding:12px; background:#e63946; border:none;
          border-radius:8px; color:#fff; font-family:'Orbitron',sans-serif;
          font-size:0.78rem; font-weight:900; cursor:pointer; transition:all 0.2s; letter-spacing:1px;
        }
        .btn-confirm:hover { background:#c62d3a; }
      `}</style>

      <nav className="navbar">
        <Link to="/dashboard" className="logo" style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <img src="/Logo.png" alt="logo" style={{width:'28px',height:'28px',objectFit:'contain'}}/>
          GAME HUNTER
        </Link>
        <div className="nav-links">
          <Link to="/dashboard"   className={`nav-link ${isActive('/dashboard')   ? 'active':''}`}>Dashboard</Link>
          <Link to="/rekomendasi" className={`nav-link ${isActive('/rekomendasi') ? 'active':''}`}>Game Rekomendasi</Link>
          <Link to="/search"      className={`nav-link ${isActive('/search')      ? 'active':''}`}>Search Games</Link>
          <Link to="/favorit"     className={`nav-link ${isActive('/favorit')     ? 'active':''}`}>Favorit Game</Link>
        </div>
        <div className="nav-actions">
          <button className="avatar-btn" onClick={openProfile} title="Profil Saya">
            {isValidImg(image)
              ? <img src={image} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>
              : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            }
          </button>
          <button className="btn-logout" onClick={() => setShowLogout(true)}>⎋ Keluar</button>
        </div>
      </nav>

      {showProfile && (
        <div className="profile-overlay" onClick={() => {setShowProfile(false); setEditMode(false)}}>
          <div className="profile-popup" onClick={e => e.stopPropagation()}>
            <div className="profile-header">
              <div className="avatar-large" onClick={() => editMode && fileRef.current?.click()}>
                {isValidImg(editMode ? previewImg : image)
                  ? <img src={editMode ? previewImg : image} alt="pp"/>
                  : <svg viewBox="0 0 24 24" fill="#444"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                }
                {editMode && <div className="avatar-edit-overlay">📷</div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageChange}/>
              {editMode ? (
                <input className="edit-field" value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Tulis bio kamu..."/>
              ) : (
                <>
                  <div className="profile-name-txt">{user?.name?.toUpperCase()}</div>
                  <div className="profile-bio-txt">{bio}</div>
                </>
              )}
            </div>
            <div className="profile-body">
              <div className="profile-stat"><span>Status</span><span style={{color:'#4ade80'}}>● Active</span></div>
              <div className="profile-stat"><span>Platform</span><span>Steam / PC</span></div>
            </div>
            <div className="profile-footer">
              {editMode ? (
                <>
                  <button className="pf-save" onClick={saveEdit}>✓ Simpan</button>
                  <button className="pf-close" onClick={() => setEditMode(false)}>Batal</button>
                </>
              ) : (
                <>
                  <button className="pf-edit" onClick={() => setEditMode(true)}>✎ Edit Profil</button>
                  <button className="pf-close" onClick={() => setShowProfile(false)}>Tutup</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showLogout && (
        <div className="gh-overlay" onClick={() => setShowLogout(false)}>
          <div className="logout-box" onClick={e => e.stopPropagation()}>
            <div className="logout-icon">⎋</div>
            <div className="logout-title">KELUAR DARI AKUN?</div>
            <div className="logout-sub">Kamu akan diarahkan kembali ke halaman login.</div>
            <div className="logout-actions">
              <button className="btn-cancel" onClick={() => setShowLogout(false)}>Batal</button>
              <button className="btn-confirm" onClick={handleLogout}>YA, KELUAR</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}