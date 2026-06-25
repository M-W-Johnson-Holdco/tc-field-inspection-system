import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { idbSave, idbLoad } from '../lib/idb'
import { ROOF_ITEMS } from '../data/roofItems'
import { ELEV_ITEMS, DIRECTIONS } from '../data/elevItems'

const InspectionContext = createContext(null)

const INITIAL_ROOF_DATA = Object.fromEntries(
  ROOF_ITEMS.map(item => [item.id, { excluded: false, fields: {}, subItems: [], photos: [] }])
)

const INITIAL_ELEV_DATA = Object.fromEntries(
  ELEV_ITEMS.flatMap(item =>
    DIRECTIONS.map(dir => [`${item.id}_${dir}`, { excluded: false, fields: {}, photos: [] }])
  )
)

const INITIAL_INTERIOR_DATA = { rooms: [] }

const INITIAL_STATE = {
  jobInfo: {
    cust: '', phone: '', email: '', addr: '',
    pm: '', insp: '', ins: '', claim: '',
    date: new Date().toISOString().slice(0, 10),
    preferredContact: [],
    residenceType: 'Primary',
    tenantname: '', tenantphone: '',
  },
  roofData: INITIAL_ROOF_DATA,
  elevData: INITIAL_ELEV_DATA,
  interiorData: INITIAL_INTERIOR_DATA,
}

export function InspectionProvider({ children }) {
  const [data, setData] = useState(INITIAL_STATE)
  const [activeTab, setActiveTab] = useState(0)
  const [saveStatus, setSaveStatus] = useState('saved')
  const saveTimer = useRef(null)

  useEffect(() => {
    idbLoad('current').then(saved => {
      if (saved) {
        const jobInfo = { ...INITIAL_STATE.jobInfo, ...(saved.jobInfo || {}) }
        if (!jobInfo.residenceType) jobInfo.residenceType = 'Primary'
        setData({
          ...INITIAL_STATE,
          ...saved,
          jobInfo,
          roofData: { ...INITIAL_ROOF_DATA, ...(saved.roofData || {}) },
          elevData: { ...INITIAL_ELEV_DATA, ...(saved.elevData || {}) },
          interiorData: saved.interiorData || INITIAL_INTERIOR_DATA,
        })
      }
    }).catch(() => {})
  }, [])

  function scheduleSave(newData) {
    setSaveStatus('unsaved')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setSaveStatus('saving')
      idbSave('current', newData)
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('unsaved'))
    }, 3000)
  }

  function updateJobInfo(field, value) {
    setData(prev => {
      const next = { ...prev, jobInfo: { ...prev.jobInfo, [field]: value } }
      scheduleSave(next)
      return next
    })
  }

  // ── Roof ──────────────────────────────────────────────────────────

  function toggleRoofExclude(itemId) {
    setData(prev => {
      const item = prev.roofData[itemId]
      const next = { ...prev, roofData: { ...prev.roofData, [itemId]: { ...item, excluded: !item.excluded } } }
      scheduleSave(next)
      return next
    })
  }

  function updateRoofField(itemId, label, value) {
    setData(prev => {
      const item = prev.roofData[itemId]
      const next = { ...prev, roofData: { ...prev.roofData, [itemId]: { ...item, fields: { ...item.fields, [label]: value } } } }
      scheduleSave(next)
      return next
    })
  }

  function addRoofSubItem(itemId) {
    setData(prev => {
      const item = prev.roofData[itemId]
      const next = { ...prev, roofData: { ...prev.roofData, [itemId]: { ...item, subItems: [...item.subItems, { fields: {} }] } } }
      scheduleSave(next)
      return next
    })
  }

  function removeRoofSubItem(itemId, index) {
    setData(prev => {
      const item = prev.roofData[itemId]
      const next = { ...prev, roofData: { ...prev.roofData, [itemId]: { ...item, subItems: item.subItems.filter((_, i) => i !== index) } } }
      scheduleSave(next)
      return next
    })
  }

  function updateRoofSubField(itemId, index, label, value) {
    setData(prev => {
      const item = prev.roofData[itemId]
      const subItems = item.subItems.map((sub, i) =>
        i === index ? { ...sub, fields: { ...sub.fields, [label]: value } } : sub
      )
      const next = { ...prev, roofData: { ...prev.roofData, [itemId]: { ...item, subItems } } }
      scheduleSave(next)
      return next
    })
  }

  function addRoofPhoto(itemId, dataUrl) {
    setData(prev => {
      const item = prev.roofData[itemId]
      const next = { ...prev, roofData: { ...prev.roofData, [itemId]: { ...item, photos: [...item.photos, dataUrl] } } }
      scheduleSave(next)
      return next
    })
  }

  function removeRoofPhoto(itemId, index) {
    setData(prev => {
      const item = prev.roofData[itemId]
      const next = { ...prev, roofData: { ...prev.roofData, [itemId]: { ...item, photos: item.photos.filter((_, i) => i !== index) } } }
      scheduleSave(next)
      return next
    })
  }

  // ── Elevations ────────────────────────────────────────────────────

  function toggleElevExclude(cellKey) {
    setData(prev => {
      const cell = prev.elevData[cellKey]
      const next = { ...prev, elevData: { ...prev.elevData, [cellKey]: { ...cell, excluded: !cell.excluded } } }
      scheduleSave(next)
      return next
    })
  }

  function updateElevField(cellKey, label, value) {
    setData(prev => {
      const cell = prev.elevData[cellKey]
      const next = { ...prev, elevData: { ...prev.elevData, [cellKey]: { ...cell, fields: { ...cell.fields, [label]: value } } } }
      scheduleSave(next)
      return next
    })
  }

  function addElevPhoto(cellKey, dataUrl) {
    setData(prev => {
      const cell = prev.elevData[cellKey]
      const next = { ...prev, elevData: { ...prev.elevData, [cellKey]: { ...cell, photos: [...cell.photos, dataUrl] } } }
      scheduleSave(next)
      return next
    })
  }

  function removeElevPhoto(cellKey, index) {
    setData(prev => {
      const cell = prev.elevData[cellKey]
      const next = { ...prev, elevData: { ...prev.elevData, [cellKey]: { ...cell, photos: cell.photos.filter((_, i) => i !== index) } } }
      scheduleSave(next)
      return next
    })
  }

  // ── Interior ──────────────────────────────────────────────────────

  function addInteriorRoom() {
    setData(prev => {
      const room = {
        id: `room_${Date.now()}`,
        name: '',
        customName: '',
        photos: [],
        fields: {
          story: '', ceilingDamage: '', ceilingNotes: '',
          wallDamage: '', wallNotes: '', floorDamage: '', floorNotes: '',
          moldPresent: '', moldNotes: '', notes: '',
        },
      }
      const next = { ...prev, interiorData: { rooms: [...prev.interiorData.rooms, room] } }
      scheduleSave(next)
      return next
    })
  }

  function removeInteriorRoom(roomId) {
    setData(prev => {
      const next = { ...prev, interiorData: { rooms: prev.interiorData.rooms.filter(r => r.id !== roomId) } }
      scheduleSave(next)
      return next
    })
  }

  function updateInteriorRoom(roomId, field, value) {
    setData(prev => {
      const rooms = prev.interiorData.rooms.map(r => {
        if (r.id !== roomId) return r
        if (field === '_name') return { ...r, name: value }
        if (field === '_customName') return { ...r, customName: value }
        return { ...r, fields: { ...r.fields, [field]: value } }
      })
      const next = { ...prev, interiorData: { rooms } }
      scheduleSave(next)
      return next
    })
  }

  function addInteriorPhoto(roomId, dataUrl) {
    setData(prev => {
      const rooms = prev.interiorData.rooms.map(r =>
        r.id === roomId ? { ...r, photos: [...r.photos, dataUrl] } : r
      )
      const next = { ...prev, interiorData: { rooms } }
      scheduleSave(next)
      return next
    })
  }

  function removeInteriorPhoto(roomId, index) {
    setData(prev => {
      const rooms = prev.interiorData.rooms.map(r =>
        r.id === roomId ? { ...r, photos: r.photos.filter((_, i) => i !== index) } : r
      )
      const next = { ...prev, interiorData: { rooms } }
      scheduleSave(next)
      return next
    })
  }

  // ─────────────────────────────────────────────────────────────────

  function manualSave() {
    setSaveStatus('saving')
    idbSave('current', data)
      .then(() => setSaveStatus('saved'))
      .catch(() => setSaveStatus('unsaved'))
  }

  function resetAll() {
    if (!confirm('Reset all data? This cannot be undone.')) return
    setData(INITIAL_STATE)
    idbSave('current', INITIAL_STATE)
    setSaveStatus('saved')
  }

  return (
    <InspectionContext.Provider value={{
      data, activeTab, setActiveTab,
      saveStatus, updateJobInfo, manualSave, resetAll,
      toggleRoofExclude, updateRoofField,
      addRoofSubItem, removeRoofSubItem, updateRoofSubField,
      addRoofPhoto, removeRoofPhoto,
      toggleElevExclude, updateElevField,
      addElevPhoto, removeElevPhoto,
      addInteriorRoom, removeInteriorRoom, updateInteriorRoom,
      addInteriorPhoto, removeInteriorPhoto,
    }}>
      {children}
    </InspectionContext.Provider>
  )
}

export function useInspection() {
  return useContext(InspectionContext)
}
