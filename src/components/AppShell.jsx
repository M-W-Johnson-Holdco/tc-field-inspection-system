import { useInspection, InspectionProvider } from '../context/InspectionContext'
import Header from './Header'
import TabBar from './TabBar'
import ActionBar from './ActionBar'
import JobInfo from './sections/JobInfo'
import RoofSection from './sections/RoofSection'
import ElevationsSection from './sections/ElevationsSection'

const COMING_SOON_LABELS = ['', '', 'Interior Damage', 'Exterior Property', 'Notes', 'AI Parse']

function PanelContent() {
  const { activeTab } = useInspection()
  if (activeTab === 0) return <RoofSection />
  if (activeTab === 1) return <ElevationsSection />
  return (
    <div className="coming-soon app-card">
      <p className="section-eyebrow">Inspection Workspace</p>
      <p className="coming-soon__title">Section {activeTab + 1} — {COMING_SOON_LABELS[activeTab]}</p>
      <p className="coming-soon__sub">Coming soon</p>
    </div>
  )
}

function Shell() {
  return (
    <div className="app-page">
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <JobInfo />
          <TabBar />
          <PanelContent />
        </main>
      </div>
      <ActionBar />
    </div>
  )
}

export default function AppShell() {
  return (
    <InspectionProvider>
      <Shell />
    </InspectionProvider>
  )
}
