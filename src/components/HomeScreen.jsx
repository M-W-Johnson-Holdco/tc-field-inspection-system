import { useAuth } from '../context/AuthContext'

export default function HomeScreen() {
  const { user, logout } = useAuth()

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>TC Roofing & Restorations</h1>
          <p style={styles.subtitle}>Field Inspection System</p>
        </div>
        <div style={styles.userRow}>
          {user.picture && (
            <img src={user.picture} style={styles.avatar} alt={user.fullName} referrerPolicy="no-referrer" />
          )}
          <div>
            <p style={styles.userName}>{user.fullName}</p>
            <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>
      <div style={styles.body}>
        <h2 style={styles.greeting}>Hello, {user.name}.</h2>
        <p style={styles.sub}>The inspection form is coming soon.</p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#EAEEF5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    background: 'rgb(45,110,181)',
    color: '#fff',
    padding: '14px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: '17px', fontWeight: '700', margin: 0 },
  subtitle: { fontSize: '11px', opacity: 0.7, margin: '2px 0 0' },
  userRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  userName: { fontSize: '13px', margin: 0, textAlign: 'right' },
  logoutBtn: {
    fontSize: '11px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.4)',
    color: '#fff',
    borderRadius: '4px',
    padding: '3px 8px',
    cursor: 'pointer',
    display: 'block',
    marginTop: '3px',
    marginLeft: 'auto',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 68px)',
    gap: '8px',
  },
  greeting: { fontSize: '28px', color: 'rgb(45,110,181)', fontWeight: '700', margin: 0 },
  sub: { fontSize: '15px', color: '#888', margin: 0 },
}
