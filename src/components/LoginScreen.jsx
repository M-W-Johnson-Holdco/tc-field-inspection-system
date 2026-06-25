import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const [error, setError] = useState(null)

  function handleSuccess(credentialResponse) {
    const result = login(credentialResponse)
    if (result?.error) setError(result.error)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>TC</div>
        <h1 style={styles.title}>TC Roofing & Restorations</h1>
        <p style={styles.subtitle}>Field Inspection System</p>
        <div style={styles.divider} />
        <p style={styles.prompt}>Sign in to continue</p>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('Sign-in failed. Please try again.')}
          useOneTap
          shape="rectangular"
          theme="outline"
          size="large"
        />
        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.footer}>Authorized personnel only</p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#EAEEF5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'rgb(45,110,181)',
    color: '#fff',
    fontSize: '24px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '-1px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'rgb(45,110,181)',
    margin: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  divider: {
    width: '100%',
    height: '1px',
    background: '#EAEEF5',
    margin: '4px 0',
  },
  prompt: {
    fontSize: '14px',
    color: '#555',
    margin: 0,
  },
  error: {
    fontSize: '13px',
    color: '#B71C1C',
    background: '#FFEBEE',
    padding: '10px 14px',
    borderRadius: '6px',
    width: '100%',
    textAlign: 'center',
    margin: 0,
    boxSizing: 'border-box',
  },
  footer: {
    fontSize: '11px',
    color: '#bbb',
    margin: '8px 0 0',
  },
}
