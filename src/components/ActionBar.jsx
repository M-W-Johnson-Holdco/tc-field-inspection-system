import { useInspection } from '../context/InspectionContext'
import { ArrowLeft, ArrowRight, RotateCcw, Save, Upload } from 'lucide-react'

const TOTAL_TABS = 6

export default function ActionBar() {
  const { activeTab, setActiveTab, manualSave, resetAll } = useInspection()
  const canGoBack = activeTab > 0
  const canGoNext = activeTab < TOTAL_TABS - 1

  return (
    <div className="action-bar">
      <button className={`app-button app-button--secondary ${canGoBack ? 'app-button--active-nav' : ''}`} aria-label="Back" title="Back" onClick={() => setActiveTab(t => Math.max(0, t - 1))} disabled={!canGoBack}>
        <ArrowLeft className="app-button__icon" aria-hidden="true" />
        <span className="app-button__label">Back</span>
      </button>
      <button className="app-button app-button--primary" aria-label="Next section" title="Next section" onClick={() => setActiveTab(t => Math.min(TOTAL_TABS - 1, t + 1))} disabled={!canGoNext}>
        <ArrowRight className="app-button__icon" aria-hidden="true" />
        <span className="app-button__label">Next Section</span>
      </button>
      <button className="app-button app-button--save" aria-label="Save draft" title="Save draft" onClick={manualSave}>
        <Save className="app-button__icon" aria-hidden="true" />
        <span className="app-button__label">Save Draft</span>
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
  )
}
