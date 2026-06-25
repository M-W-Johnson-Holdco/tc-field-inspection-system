import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginScreen from './components/LoginScreen'
import AppShell from './components/AppShell'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginScreen />}
      />
      <Route
        path="/"
        element={<ProtectedRoute><AppShell /></ProtectedRoute>}
      />
    </Routes>
  )
}

export default function App() {
  return (
    <>
      <div className="orientation-lock" role="alert" aria-live="polite">
        <div className="orientation-lock__card">
          <div className="orientation-lock__mark">TC</div>
          <h2>Rotate Back to Portrait</h2>
          <p>This field app is designed for portrait mode on phones.</p>
        </div>
      </div>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </>
  )
}
