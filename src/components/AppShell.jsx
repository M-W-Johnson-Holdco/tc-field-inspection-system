import { useInspection, InspectionProvider } from '../context/InspectionContext'
import Header from './Header'
import TabBar from './TabBar'
import ActionBar from './ActionBar'
import ReAuthModal from './ReAuthModal'
import JobInfo from './sections/JobInfo'
import RoofSection from './sections/RoofSection'
import ElevationsSection from './sections/ElevationsSection'
import InteriorSection from './sections/InteriorSection'

const COMING_SOON_LABELS = ['', '', '', 'Exterior Property', 'Notes', 'AI Parse']

function PanelContent() {
  const { activeTab } = useInspection()
  let content
  if (activeTab === 0) content = <RoofSection />
  else if (activeTab === 1) content = <ElevationsSection />
  else if (activeTab === 2) content = <InteriorSection />
  else content = (
    <div className="coming-soon app-card">
      <p className="section-eyebrow">Inspection Workspace</p>
      <p className="coming-soon__title">Section {activeTab + 1} — {COMING_SOON_LABELS[activeTab]}</p>
      <p className="coming-soon__sub">Coming soon</p>
    </div>
  )

  return <section id="section-panel" className="section-panel">{content}</section>
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
      <ReAuthModal />
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
