import { createContext, useContext, useState, useCallback } from 'react'
import { useGoogleLogin } from '@react-oauth/google'

const AuthContext = createContext(null)

const ALLOWED_DOMAIN = 'tcroofingexperts.com'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tc_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  // Access token is kept in memory only — it expires and must not persist
  const [accessToken, setAccessToken] = useState(null)
  const [tokenExpired, setTokenExpired] = useState(false)

  async function handleTokenResponse(tokenResponse) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
    })
    if (!res.ok) throw new Error('Failed to fetch user info')
    const userInfo = await res.json()
    if (!userInfo.email.endsWith('@' + ALLOWED_DOMAIN)) {
      return { error: 'This Google account is not authorized. Contact your administrator.' }
    }
    const userData = {
      name: userInfo.given_name,
      fullName: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
    }
    localStorage.setItem('tc_user', JSON.stringify(userData))
    setUser(userData)
    setAccessToken(tokenResponse.access_token)
    setTokenExpired(false)
    return { success: true }
  }

  function login(userInfo, token) {
    if (!userInfo.email.endsWith('@' + ALLOWED_DOMAIN)) {
      return { error: 'This Google account is not authorized. Contact your administrator.' }
    }
    const userData = {
      name: userInfo.given_name,
      fullName: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
    }
    localStorage.setItem('tc_user', JSON.stringify(userData))
    setUser(userData)
    setAccessToken(token)
    setTokenExpired(false)
    return { success: true }
  }

  const reLogin = useGoogleLogin({
    scope: `openid email profile ${DRIVE_SCOPE}`,
    onSuccess: (tokenResponse) => {
      handleTokenResponse(tokenResponse).catch(console.error)
    },
    onError: () => console.error('Re-authentication failed'),
  })

  function logout() {
    localStorage.removeItem('tc_user')
    setUser(null)
    setAccessToken(null)
    setTokenExpired(false)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, tokenExpired, setTokenExpired, login, reLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
