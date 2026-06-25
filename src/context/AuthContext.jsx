import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const ALLOWED_DOMAIN = 'tcroofingexperts.com'

function parseJwt(token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(window.atob(base64))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tc_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  function login(credentialResponse) {
    const payload = parseJwt(credentialResponse.credential)
    if (!payload.email.endsWith('@' + ALLOWED_DOMAIN)) {
      return { error: 'This Google account is not authorized. Contact your administrator.' }
    }
    const userData = {
      name: payload.given_name,
      fullName: payload.name,
      email: payload.email,
      picture: payload.picture,
    }
    localStorage.setItem('tc_user', JSON.stringify(userData))
    setUser(userData)
    return { success: true }
  }

  function logout() {
    localStorage.removeItem('tc_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
