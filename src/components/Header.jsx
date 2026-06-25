import { useAuth } from '../context/AuthContext'
import { useInspection } from '../context/InspectionContext'

export default function Header() {
  const { user, logout } = useAuth()
  const { saveStatus } = useInspection()

  const saveLabel = {
    saved: 'All changes saved',
    saving: 'Saving...',
    unsaved: 'Unsaved changes',
  }[saveStatus]

  return (
    <div className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo">TC</div>
        <div className="app-header__title-group">
          <p className="section-eyebrow">Field Operations</p>
          <h1 className="app-header__title">TC Roofing Field Inspection</h1>
          <p className="app-header__subtitle">Pre-Adjuster Inspection &bull; Texas Hail &amp; Wind</p>
        </div>
      </div>
      <div className="app-header__meta">
        <span className={`status-pill ${saveStatus === 'unsaved' ? 'status-pill--unsaved' : ''}`}>
          {saveLabel}
        </span>
      </div>
      <div className="app-header__user">
        {user?.picture && (
          <img className="app-header__avatar" src={user.picture} alt="" referrerPolicy="no-referrer" />
        )}
        <div>
          <p className="app-header__user-name">{user?.name}</p>
          <button className="link-button" onClick={logout}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
