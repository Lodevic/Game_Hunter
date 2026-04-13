// api.js — semua komunikasi ke Flask backend
const BASE = '/api'

async function req(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  }
  if (body) opts.body = JSON.stringify(body)
  const res  = await fetch(BASE + path, opts)
  const data = await res.json()

  // Kalau backend return error, throw supaya catch bisa tangkap
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Terjadi kesalahan.')
  }

  return data
}

// ── AUTH ──
export const authAPI = {
  me:       ()     => req('GET',  '/me'),
  login:    (form) => req('POST', '/login',    form),
  register: (form) => req('POST', '/register', form),
  logout:   ()     => req('POST', '/logout'),
}

// ── DASHBOARD ──
export const dashboardAPI = {
  get: () => req('GET', '/dashboard'),
}

// ── REKOMENDASI ──
export const rekomendasiAPI = {
  get: () => req('GET', '/rekomendasi'),
}

// ── SEARCH ──
export const searchAPI = {
  search: (keyword) => req('GET', `/search?q=${encodeURIComponent(keyword)}`),
}

// ── FAVORIT ──
export const favoritAPI = {
  getAll: ()        => req('GET',  '/favorit'),
  getIds: ()        => req('GET',  '/favorit/list'),
  toggle: (game_id) => req('POST', '/favorit/toggle', { game_id }),
}

// ── PROFILE ──
export const profileAPI = {
  get:    ()     => req('GET',  '/profile'),
  getMe:  ()     => req('GET',  '/profile/me'),
  update: (data) => req('POST', '/profile/update', data),
}