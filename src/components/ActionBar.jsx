import { useState } from 'react'
import { useInspection } from '../context/InspectionContext'
import { useAuth } from '../context/AuthContext'
import { saveInspectionToDrive, TokenExpiredError } from '../lib/driveService'
import OpenInspectionModal from './OpenInspectionModal'
import { ArrowLeft, ArrowRight, RotateCcw, Save, ExternalLink, CheckCircle, AlertCircle, FolderOpen, FilePlus, CircleHelp, MoreHorizontal } from 'lucide-react'

const TOTAL_TABS = 6

function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function getJobInfoSaveError(jobInfo) {
  if (!String(jobInfo?.cust || '').trim()) {
    return { field: 'cust', message: 'Customer name is required before saving.' }
  }
  if (phoneDigits(jobInfo?.phone).length !== 10) {
    return { field: 'phone', message: 'Enter a 10-digit customer phone before saving.' }
  }
  if (!isValidEmail(jobInfo?.email)) {
    return { field: 'email', message: 'Enter a valid customer email before saving.' }
  }
  return null
}

export default function ActionBar() {
  const { activeTab, setActiveTab, resetAll, startNewInspection, data, driveSaveStatus, setDriveSaveStatus, loadInspection } = useInspection()
  const { accessToken, user, setTokenExpired } = useAuth()
  const [driveStatus, setDriveStatus] = useState('idle') // idle | saving | done | error
  const [showOpen, setShowOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showMore, setShowMore] = useState(false)
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
    const saveError = getJobInfoSaveError(data.jobInfo)
    if (saveError) {
      window.alert(saveError.message)
      goToSection(0)
      setTimeout(() => document.getElementById(saveError.field)?.focus(), 100)
      return
    }

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

  function handleNew() {
    setShowMore(false)
    if (!window.confirm('Start a new inspection? This will clear the current form.')) return
    startNewInspection()
    goToSection(0)
    window.scrollTo(0, 0)
  }

  function handleOpenInspection() {
    setShowMore(false)
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
        <button className="app-button app-button--primary" aria-label="Next" title="Next" onClick={() => goToSection(Math.min(TOTAL_TABS - 1, activeTab + 1))} disabled={!canGoNext}>
          <ArrowRight className="app-button__icon" aria-hidden="true" />
          <span className="app-button__label">Next</span>
        </button>
        <div className="toolbar-more">
          <button
            className="app-button app-button--more"
            aria-label="More actions"
            title="More actions"
            aria-expanded={showMore}
            onClick={() => setShowMore(open => !open)}
          >
            <MoreHorizontal className="app-button__icon" aria-hidden="true" />
            <span className="app-button__label">More</span>
          </button>
          {showMore && (
            <div className="toolbar-more__menu" role="menu" aria-label="More toolbar actions">
              <button className="toolbar-more__item" type="button" role="menuitem" aria-label="Open inspection" title="Open inspection" onClick={handleOpenInspection}>
                <FolderOpen className="toolbar-more__icon" aria-hidden="true" />
              </button>
              <button
                className="toolbar-more__item"
                type="button"
                role="menuitem"
                aria-label="Save to Google Drive"
                title="Save to Google Drive"
                onClick={handleSaveToDrive}
                disabled={driveStatus === 'saving'}
              >
                <SaveIcon className="toolbar-more__icon" aria-hidden="true" />
              </button>
              <button className="toolbar-more__item" type="button" role="menuitem" aria-label="New inspection" title="New inspection" onClick={handleNew}>
                <FilePlus className="toolbar-more__icon" aria-hidden="true" />
              </button>
              <button
                className="toolbar-more__item toolbar-more__item--danger"
                type="button"
                role="menuitem"
                aria-label="Reset"
                title="Reset"
                onClick={() => {
                  setShowMore(false)
                  resetAll()
                }}
              >
                <RotateCcw className="toolbar-more__icon" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        <button
          className="app-button app-button--export"
          aria-label="Export"
          title="Export"
          disabled
        >
          <ExternalLink className="app-button__icon" aria-hidden="true" />
          <span className="app-button__label">Export</span>
        </button>
        <button className="app-button app-button--help" aria-label="Help" title="Help" onClick={() => {
          setShowMore(false)
          setShowHelp(true)
        }}>
          <CircleHelp className="app-button__icon" aria-hidden="true" />
          <span className="app-button__label">Help</span>
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

      {showHelp && (
        <>
          <div className="modal-backdrop modal-backdrop--top" onClick={() => setShowHelp(false)} />
          <div className="toolbar-help-modal" role="dialog" aria-modal="true" aria-labelledby="toolbar-help-title">
            <div className="toolbar-help-modal__header">
              <h2 id="toolbar-help-title">Toolbar Help</h2>
              <button className="toolbar-help-modal__close" type="button" onClick={() => setShowHelp(false)} aria-label="Close help">
                ×
              </button>
            </div>
            <div className="toolbar-help-modal__list">
              <p><ArrowLeft className="toolbar-help-modal__icon" aria-hidden="true" /><span><strong>Back:</strong> Go to the previous inspection section.</span></p>
              <p><ArrowRight className="toolbar-help-modal__icon" aria-hidden="true" /><span><strong>Next:</strong> Go to the next inspection section.</span></p>
              <p><Save className="toolbar-help-modal__icon" aria-hidden="true" /><span><strong>Save:</strong> Save the current inspection to Google Drive.</span></p>
              <p><CircleHelp className="toolbar-help-modal__icon" aria-hidden="true" /><span><strong>Help:</strong> Show this toolbar guide.</span></p>
              <p><FolderOpen className="toolbar-help-modal__icon" aria-hidden="true" /><span><strong>Open:</strong> Open a saved inspection from Google Drive.</span></p>
              <p><ExternalLink className="toolbar-help-modal__icon" aria-hidden="true" /><span><strong>Export:</strong> Reserved for exporting inspection reports.</span></p>
              <p><FilePlus className="toolbar-help-modal__icon" aria-hidden="true" /><span><strong>New:</strong> Start a new inspection form.</span></p>
              <p><RotateCcw className="toolbar-help-modal__icon" aria-hidden="true" /><span><strong>Reset:</strong> Clear all current inspection data.</span></p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
