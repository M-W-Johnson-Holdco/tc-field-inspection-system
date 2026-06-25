import { useEffect, useRef, useState } from 'react'
import { useInspection } from '../context/InspectionContext'

const TABS = ['1. Roof', '2. Elevations', '3. Interior', '4. Exterior', '5. Notes', '6. AI Parse']

export default function TabBar() {
  const { activeTab, setActiveTab } = useInspection()
  const barRef = useRef(null)
  const tabRefs = useRef([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    function syncIndicator() {
      const activeEl = tabRefs.current[activeTab]
      if (!activeEl) return
      setIndicator({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      })
    }

    syncIndicator()
    window.addEventListener('resize', syncIndicator)
    return () => window.removeEventListener('resize', syncIndicator)
  }, [activeTab])

  return (
    <nav
      ref={barRef}
      className="tab-bar"
      aria-label="Inspection sections"
      style={{ '--active-tab': activeTab, '--tab-count': TABS.length }}
    >
      <span
        className="tab-indicator"
        style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
        aria-hidden="true"
      />
      {TABS.map((label, i) => (
        <button
          key={i}
          ref={el => { tabRefs.current[i] = el }}
          className={`tab-button ${activeTab === i ? 'tab-button--active' : ''}`}
          onClick={() => {
            setActiveTab(i)
            tabRefs.current[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
          }}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
