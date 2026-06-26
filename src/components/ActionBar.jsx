import { useState } from 'react'
import { useInspection } from '../context/InspectionContext'
import { useAuth } from '../context/AuthContext'
import { saveInspectionToDrive, TokenExpiredError } from '../lib/driveService'
import OpenInspectionModal from './OpenInspectionModal'
import { ArrowLeft, ArrowRight, RotateCcw, Save, Upload, CheckCircle, AlertCircle, FolderOpen } from 'lucide-react'

const TOTAL_TABS = 6

export default function ActionBar() {
  const { activeTab, setActiveTab, resetAll, data, driveSaveStatus, setDriveSaveStatus, loadInspection } = useInspection()
  const { accessToken, user, setTokenExpired } = useAuth()
  const [driveStatus, setDriveStatus] = useState('idle') // idle | saving | done | error
  const [showOpen, setShowOpen] = useState(false)
  const canGoBack = activeTab > 0
  const canGoNext = activeTab < TOTAL_TABS - 1

  function scrollToSectionTop() {
    requestAnimationFrame(() => {
      document.getElementById('section-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function goToSection(nextTab) {
    setActiveTab(nextTab)
    scrollToSectionTop()
  }

  async function handleSaveToDrive() {
    if (!accessToken) {
      setTokenExpired(true)
      return
    }
    setDriveStatus('saving')
    setDriveSaveStatus('saving')
    try {
      const { folderName, photoCount } = await saveInspectionToDrive(accessToken, data, user?.fullName)
      setDriveStatus('done')
      setDriveSaveStatus('saved')
      setTimeout(() => setDriveStatus('idle'), 3000)
      console.info(`Saved to Drive: ${folderName} (${photoCount} photos)`)
    } catch (err) {
      console.error('Drive save failed:', err)
      if (err instanceof TokenExpiredError) {
        setDriveStatus('idle')
        setDriveSaveStatus('unsaved')
        setTokenExpired(true)
      } else {
        setDriveStatus('error')
        setDriveSaveStatus('error')
        setTimeout(() => setDriveStatus('idle'), 4000)
      }
    }
  }

  function handleOpenInspection() {
    if (!accessToken) {
      setTokenExpired(true)
      return
    }
    setShowOpen(true)
  }

  function handleLoad(inspectionData) {
    loadInspection(inspectionData)
    setShowOpen(false)
    window.scrollTo(0, 0)
  }

  const saveLabel =
    driveStatus === 'saving' ? 'Saving…' :
    driveStatus === 'done'   ? 'Saved!' :
    driveStatus === 'error'  ? 'Failed' : 'Save'

  const SaveIcon =
    driveStatus === 'done'  ? CheckCircle :
    driveStatus === 'error' ? AlertCircle : Save

  return (
    <>
      <div className="action-bar">
        <button className={`app-button app-button--secondary ${canGoBack ? 'app-button--active-nav' : ''}`} aria-label="Back" title="Back" onClick={() => goToSection(Math.max(0, activeTab - 1))} disabled={!canGoBack}>
          <ArrowLeft className="app-button__icon" aria-hidden="true" />
          <span className="app-button__label">Back</span>
        </button>
        <button className="app-button app-button--primary" aria-label="Next section" title="Next section" onClick={() => goToSection(Math.min(TOTAL_TABS - 1, activeTab + 1))} disabled={!canGoNext}>
          <ArrowRight className="app-button__icon" aria-hidden="true" />
          <span className="app-button__label">Next Section</span>
        </button>
        <button
          className={`app-button app-button--save${driveStatus === 'done' ? ' app-button--export-done' : ''}${driveStatus === 'error' ? ' app-button--export-error' : ''}`}
          aria-label="Save to Google Drive"
          title="Save to Google Drive"
          onClick={handleSaveToDrive}
          disabled={driveStatus === 'saving'}
        >
          <SaveIcon className="app-button__icon" aria-hidden="true" />
          <span className="app-button__label">{saveLabel}</span>
        </button>
        <button
          className="app-button app-button--open"
          aria-label="Open inspection"
          title="Open inspection"
          onClick={handleOpenInspection}
        >
          <FolderOpen className="app-button__icon" aria-hidden="true" />
          <span className="app-button__label">Open</span>
        </button>
        <button className="app-button app-button--export" aria-label="Export" title="Export" disabled>
          <Upload className="app-button__icon" aria-hidden="true" />
          <span className="app-button__label">Export</span>
        </button>
        <button className="app-button app-button--reset" aria-label="Reset" title="Reset" onClick={resetAll}>
          <RotateCcw className="app-button__icon" aria-hidden="true" />
          <span className="app-button__label">Reset</span>
        </button>
      </div>

      {showOpen && accessToken && (
        <OpenInspectionModal
          token={accessToken}
          saveStatus={driveSaveStatus}
          onLoad={handleLoad}
          onClose={() => setShowOpen(false)}
        />
      )}
    </>
  )
}
