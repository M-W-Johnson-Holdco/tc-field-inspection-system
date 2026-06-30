import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { idbSave, idbLoad } from '../lib/idb'
import { ROOF_ITEMS } from '../data/roofItems'
import { ELEV_ITEMS, DIRECTIONS } from '../data/elevItems'
import { EXTERIOR_ITEMS } from '../data/exteriorItems'

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

const INITIAL_EXTERIOR_DATA = Object.fromEntries(
  EXTERIOR_ITEMS.map(item => [item.id, { excluded: false, fields: {}, photos: [] }])
)

const INITIAL_NOTES_DATA = {
  summary: '', concerns: '', homeage: '', crosssell: '',
  roof: '', roofage: '', defects: '', homeowner: '', misc: '',
}

const INITIAL_STATE = {
  jobInfo: {
    cust: '', phone: '', email: '', addr: '',
    pm: '', insp: '', ins: '', claim: '',
    date: new Date().toISOString().slice(0, 10),
    preferredContact: [],
    residenceType: 'Primary',
    addrParts: { address1: '', address2: '', city: '', state: '', zipcode: '' },
    tenantname: '', tenantphone: '',
    hasSeparateContact: 'No',
    contactName: '', contactPhone: '', contactEmail: '', contactPreferredContact: [],
  },
  roofData: INITIAL_ROOF_DATA,
  elevData: INITIAL_ELEV_DATA,
  interiorData: INITIAL_INTERIOR_DATA,
  exteriorData: INITIAL_EXTERIOR_DATA,
  notesData: INITIAL_NOTES_DATA,
}

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0
  if (value == null) return false
  const normalized = String(value).trim()
  return normalized !== '' && normalized !== 'Select...' && normalized !== 'Select…'
}

function isValidPhone(value) {
  return String(value || '').replace(/\D/g, '').length === 10
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function isValidAddressParts(parts) {
  return Boolean(
    parts &&
    String(parts.address1 || '').trim() &&
    String(parts.city || '').trim() &&
    /^[A-Z]{2}$/i.test(String(parts.state || '').trim()) &&
    /^\d{5}$/.test(String(parts.zipcode || '').trim())
  )
}

function countValue(value, totals, validator) {
  totals.total += 1
  if (validator ? validator(value) : isFilled(value)) totals.filled += 1
}

function calculateCompletion(data) {
  const totals = { filled: 0, total: 0 }
  const ji = data.jobInfo || {}

  ;['cust', 'preferredContact', 'residenceType', 'pm', 'insp', 'ins', 'claim', 'date'].forEach(key => {
    countValue(ji[key], totals)
  })
  countValue(ji.phone, totals, isValidPhone)
  countValue(ji.email, totals, isValidEmail)
  countValue(ji.addrParts, totals, isValidAddressParts)
  if (ji.residenceType === 'Rental') {
    countValue(ji.tenantname, totals)
    countValue(ji.tenantphone, totals, isValidPhone)
  }

  ROOF_ITEMS.forEach(itemDef => {
    const item = data.roofData?.[itemDef.id]
    if (!item || item.excluded) return

    ;(itemDef.fields || []).forEach(field => countValue(item.fields?.[field.l], totals))
    if (itemDef.flags?.includes('D')) countValue(item.fields?._damage, totals)
    ;(item.subItems || []).forEach(sub => {
      ;(itemDef.subFields || []).forEach(field => countValue(sub.fields?.[field.l], totals))
    })
  })

  ELEV_ITEMS.forEach(itemDef => {
    DIRECTIONS.forEach(dir => {
      const cell = data.elevData?.[`${itemDef.id}_${dir}`]
      if (!cell || cell.excluded) return

      ;(itemDef.fields || []).forEach(field => countValue(cell.fields?.[field.l], totals))
      if (cell.fields?.Damaged === 'Yes') countValue(cell.fields?._damage, totals)
    })
  })

  ;(data.interiorData?.rooms || []).forEach(room => {
    countValue(room.name, totals)
    if (room.name === 'Other') countValue(room.customName, totals)
    ;['story', 'ceilingDamage', 'wallDamage', 'floorDamage', 'moldPresent'].forEach(key => {
      countValue(room.fields?.[key], totals)
    })
    if (room.fields?.ceilingDamage === 'Yes') countValue(room.fields?.ceilingNotes, totals)
    if (room.fields?.wallDamage === 'Yes') countValue(room.fields?.wallNotes, totals)
    if (room.fields?.floorDamage === 'Yes') countValue(room.fields?.floorNotes, totals)
    if (room.fields?.moldPresent === 'Yes') countValue(room.fields?.moldNotes, totals)
  })

  const percent = totals.total ? Math.round((totals.filled / totals.total) * 100) : 0
  return { ...totals, percent }
}

export function InspectionProvider({ children }) {
  const [data, setData] = useState(INITIAL_STATE)
  const [activeTab, setActiveTabState] = useState(0)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [driveSaveStatus, setDriveSaveStatus] = useState('unsaved')
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
          exteriorData: { ...INITIAL_EXTERIOR_DATA, ...(saved.exteriorData || {}) },
          notesData: { ...INITIAL_NOTES_DATA, ...(saved.notesData || {}) },
        })
        if (Number.isInteger(saved.activeTab)) setActiveTabState(saved.activeTab)
      }
    }).catch(() => {})
  }, [])

  function scheduleSave(newData) {
    setSaveStatus('unsaved')
    setDriveSaveStatus('unsaved')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setSaveStatus('saving')
      idbSave('current', { ...newData, activeTab })
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('unsaved'))
    }, 3000)
  }

  function setActiveTab(nextTab) {
    setActiveTabState(prev => {
      const resolved = typeof nextTab === 'function' ? nextTab(prev) : nextTab
      idbSave('current', { ...data, activeTab: resolved }).catch(() => {})
      return resolved
    })
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

  // ── Notes ─────────────────────────────────────────────────────────

  function updateNote(field, value) {
    setData(prev => {
      const next = { ...prev, notesData: { ...prev.notesData, [field]: value } }
      scheduleSave(next)
      return next
    })
  }

  // ── Exterior ──────────────────────────────────────────────────────

  function toggleExteriorExclude(itemId) {
    setData(prev => {
      const item = prev.exteriorData[itemId]
      const next = { ...prev, exteriorData: { ...prev.exteriorData, [itemId]: { ...item, excluded: !item.excluded } } }
      scheduleSave(next)
      return next
    })
  }

  function updateExteriorField(itemId, label, value) {
    setData(prev => {
      const item = prev.exteriorData[itemId]
      const next = { ...prev, exteriorData: { ...prev.exteriorData, [itemId]: { ...item, fields: { ...item.fields, [label]: value } } } }
      scheduleSave(next)
      return next
    })
  }

  function addExteriorPhoto(itemId, dataUrl) {
    setData(prev => {
      const item = prev.exteriorData[itemId]
      const next = { ...prev, exteriorData: { ...prev.exteriorData, [itemId]: { ...item, photos: [...item.photos, dataUrl] } } }
      scheduleSave(next)
      return next
    })
  }

  function removeExteriorPhoto(itemId, index) {
    setData(prev => {
      const item = prev.exteriorData[itemId]
      const next = { ...prev, exteriorData: { ...prev.exteriorData, [itemId]: { ...item, photos: item.photos.filter((_, i) => i !== index) } } }
      scheduleSave(next)
      return next
    })
  }

  // ─────────────────────────────────────────────────────────────────

  function applyXmlImport(parsed) {
    setData(prev => {
      let next = { ...prev }

      if (parsed.address?.address1) {
        const a = parsed.address
        const addressLine = a.address1
        const formatted = `${addressLine}, ${a.city}, ${a.state} ${a.zipcode}`
        next = {
          ...next,
          jobInfo: {
            ...next.jobInfo,
            addrParts: { address1: a.address1, address2: '', city: a.city, state: a.state, zipcode: a.zipcode },
            addr: formatted,
          },
        }
      }

      const roofData = { ...next.roofData }

      if (parsed.pitch) {
        const ri0 = roofData.ri0
        roofData.ri0 = { ...ri0, fields: { ...ri0.fields, 'Predominant Pitch': parsed.pitch } }
      }

      if (parsed.valleyPresent) {
        const ri5 = roofData.ri5
        roofData.ri5 = { ...ri5, fields: { ...ri5.fields, 'Present': 'Yes' } }
      }

      if (parsed.lineLengths?.RIDGE > 0) {
        const ri6 = roofData.ri6
        roofData.ri6 = { ...ri6, fields: { ...ri6.fields, 'Length (LF)': String(parsed.lineLengths.RIDGE) } }
      }

      next = { ...next, roofData }
      scheduleSave(next)
      return next
    })
  }

  function manualSave() {
    setSaveStatus('saving')
    idbSave('current', { ...data, activeTab })
      .then(() => setSaveStatus('saved'))
      .catch(() => setSaveStatus('unsaved'))
  }

  function loadInspection(saved) {
    const jobInfo = { ...INITIAL_STATE.jobInfo, ...(saved.jobInfo || {}) }
    if (!jobInfo.residenceType) jobInfo.residenceType = 'Primary'
    const next = {
      ...INITIAL_STATE,
      ...saved,
      jobInfo,
      roofData: { ...INITIAL_ROOF_DATA, ...(saved.roofData || {}) },
      elevData: { ...INITIAL_ELEV_DATA, ...(saved.elevData || {}) },
      interiorData: saved.interiorData || INITIAL_INTERIOR_DATA,
      exteriorData: { ...INITIAL_EXTERIOR_DATA, ...(saved.exteriorData || {}) },
      notesData: { ...INITIAL_NOTES_DATA, ...(saved.notesData || {}) },
    }
    setData(next)
    setActiveTabState(0)
    idbSave('current', { ...next, activeTab: 0 })
    setSaveStatus('saved')
    setDriveSaveStatus('saved')
  }

  function resetAll() {
    if (!confirm('Reset all data? This cannot be undone.')) return
    setData(INITIAL_STATE)
    setActiveTabState(0)
    idbSave('current', { ...INITIAL_STATE, activeTab: 0 })
    setSaveStatus('saved')
    setDriveSaveStatus('unsaved')
  }

  function startNewInspection() {
    setData(INITIAL_STATE)
    setActiveTabState(0)
    idbSave('current', { ...INITIAL_STATE, activeTab: 0 })
    setSaveStatus('saved')
    setDriveSaveStatus('unsaved')
  }

  const completion = calculateCompletion(data)

  return (
    <InspectionContext.Provider value={{
      data, activeTab, setActiveTab,
      saveStatus, driveSaveStatus, setDriveSaveStatus, completion, updateJobInfo, manualSave, resetAll, startNewInspection, loadInspection, applyXmlImport,
      toggleRoofExclude, updateRoofField,
      addRoofSubItem, removeRoofSubItem, updateRoofSubField,
      addRoofPhoto, removeRoofPhoto,
      toggleElevExclude, updateElevField,
      addElevPhoto, removeElevPhoto,
      addInteriorRoom, removeInteriorRoom, updateInteriorRoom,
      addInteriorPhoto, removeInteriorPhoto,
      toggleExteriorExclude, updateExteriorField,
      addExteriorPhoto, removeExteriorPhoto,
      updateNote,
    }}>
      {children}
    </InspectionContext.Provider>
  )
}

export function useInspection() {
  return useContext(InspectionContext)
}
