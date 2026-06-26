import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useInspection } from '../context/InspectionContext'
import { ChevronDown } from 'lucide-react'
import tcLogo from '../assets/tc_logo.png'

export default function Header() {
  const { user, logout } = useAuth()
  const { driveSaveStatus, completion } = useInspection()
  const [isOpen, setIsOpen] = useState(true)

  const saveLabel = {
    saved: 'Saved',
    saving: 'Saving',
    unsaved: 'Unsaved',
    error: 'Failed',
  }[driveSaveStatus]

  const isUnsaved = driveSaveStatus === 'unsaved' || driveSaveStatus === 'error'

  return (
    <details
      className="app-header"
      open={isOpen}
      onToggle={e => setIsOpen(e.currentTarget.open)}
    >
      <summary className="app-header__summary">
        <div className="app-header__progress app-header__progress--summary" aria-label={`Inspection ${completion.percent}% complete`}>
          <div className="app-header__progress-top">
            <span>Inspection Progress</span>
            <strong>{completion.percent}%</strong>
          </div>
          <div className="app-header__progress-row">
            <div className="app-header__progress-track">
              <div className="app-header__progress-fill" style={{ width: `${completion.percent}%` }} />
            </div>
            <span className={`status-pill status-pill--compact ${isUnsaved ? 'status-pill--unsaved' : ''}`}>
              {saveLabel}
            </span>
          </div>
        </div>
        <ChevronDown className="app-header__summary-icon" aria-hidden="true" />
      </summary>
      <div className="app-header__details">
        <div className="app-header__brand">
          <img src={tcLogo} alt="TC Roofing & Restorations" className="app-header__logo" />
          <div className="app-header__title-group">
            <h1 className="app-header__title">
              <span className="app-header__title-mobile">Field Inspection</span>
              <span className="app-header__title-desktop">TC Roofing Field Inspection</span>
            </h1>
            <p className="app-header__subtitle">Pre-Adjuster Inspection &bull; Texas Hail &amp; Wind</p>
          </div>
        </div>
        <div className="app-header__progress app-header__progress--details" aria-label={`Inspection ${completion.percent}% complete`}>
          <div className="app-header__progress-top">
            <span>Inspection Progress</span>
            <strong>{completion.percent}%</strong>
          </div>
          <div className="app-header__progress-row">
            <div className="app-header__progress-track">
              <div className="app-header__progress-fill" style={{ width: `${completion.percent}%` }} />
            </div>
            <span className={`status-pill status-pill--compact ${isUnsaved ? 'status-pill--unsaved' : ''}`}>
              {saveLabel}
            </span>
          </div>
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
    </details>
  )
}
