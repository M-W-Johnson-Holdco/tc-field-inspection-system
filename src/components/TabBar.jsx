import { useInspection } from '../context/InspectionContext'

const TABS = ['1. Roof', '2. Elevations', '3. Interior', '4. Exterior', '5. Notes', '6. AI Parse']

export default function TabBar() {
  const { activeTab, setActiveTab } = useInspection()

  return (
    <nav className="tab-bar" aria-label="Inspection sections">
      {TABS.map((label, i) => (
        <button
          key={i}
          className={`tab-button ${activeTab === i ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab(i)}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
