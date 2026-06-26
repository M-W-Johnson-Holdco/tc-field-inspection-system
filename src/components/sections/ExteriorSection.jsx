import { useRef, useState } from 'react'
import { Camera, ChevronDown, FolderOpen } from 'lucide-react'
import { useInspection } from '../../context/InspectionContext'
import { EXTERIOR_ITEMS, EXTERIOR_SUBSECTIONS } from '../../data/exteriorItems'

// ── Field Renderer ─────────────────────────────────────────────────
function isLinearMeasurementField(field) {
  return field.t === 'num' && /\bLF\b/i.test(field.l)
}

function parseMeasurement(value) {
  const text = String(value || '').trim()
  if (!text) return { feet: '', inches: '' }
  const feetMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:'|ft|feet)?/i)
  const inchesMatch = text.match(/(?:'|ft|feet)\s*(\d+(?:\.\d+)?)\s*(?:"|in|inches)?/i)
    || text.match(/(\d+(?:\.\d+)?)\s*(?:"|in|inches)/i)
  return {
    feet: feetMatch ? feetMatch[1] : '',
    inches: inchesMatch ? inchesMatch[1] : '',
  }
}

function formatMeasurement(feet, inches) {
  const ft = String(feet || '').trim()
  const inch = String(inches || '').trim()
  if (!ft && !inch) return ''
  if (!inch) return `${ft}'`
  return `${ft || '0'}' ${inch}"`
}

function MeasurementInput({ field, value, onChange }) {
  const { feet, inches } = parseMeasurement(value)
  const update = (part, nextValue) => {
    onChange(formatMeasurement(part === 'feet' ? nextValue : feet, part === 'inches' ? nextValue : inches))
  }

  return (
    <div className="field-group">
      <label className="form-label">{field.l}</label>
      <div className="measurement-input">
        <label className="measurement-input__part">
          <input
            className="field-input measurement-input__field"
            type="text"
            inputMode="decimal"
            pattern="[0-9.]*"
            value={feet}
            placeholder="0"
            onChange={e => update('feet', e.target.value)}
          />
          <span className="measurement-input__unit">ft</span>
        </label>
        <label className="measurement-input__part">
          <input
            className="field-input measurement-input__field"
            type="text"
            inputMode="decimal"
            pattern="[0-9.]*"
            value={inches}
            placeholder="0"
            onChange={e => update('inches', e.target.value)}
          />
          <span className="measurement-input__unit">in</span>
        </label>
      </div>
    </div>
  )
}

function FieldRenderer({ field, value, onChange }) {
  const { t, l, o, p } = field
  const lbl = <label className="form-label">{l}</label>

  if (t === 'yn' || t === 'radio') {
    const opts = t === 'yn' ? ['Yes', 'No'] : o
    return (
      <div className="field-group">
        {lbl}
        <select
          className="field-select compact-select"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          {opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    )
  }

  if (t === 'multiRadio' || t === 'multi' || t === 'toggleMulti') {
    const arr = Array.isArray(value) ? value : []
    return (
      <div className="field-group">
        {lbl}
        <details className="multi-select">
          <summary className="multi-select__summary">
            <span>{arr.length ? arr.join(', ') : 'Select...'}</span>
            <ChevronDown className="multi-select__icon" aria-hidden="true" />
          </summary>
          <div className="multi-select__menu">
            {o.map(opt => (
              <label key={opt} className="multi-select__option">
                <input
                  type="checkbox"
                  checked={arr.includes(opt)}
                  onChange={() => onChange(arr.includes(opt) ? arr.filter(v => v !== opt) : [...arr, opt])}
                />
                {opt}
              </label>
            ))}
          </div>
        </details>
        {arr.length > 0 && (
          <div className="multi-select__selected">
            {arr.map(opt => <span key={opt} className="multi-select__chip">{opt}</span>)}
          </div>
        )}
      </div>
    )
  }

  if (t === 'textarea') {
    return (
      <div className="field-group field-group--full">
        {lbl}
        <textarea
          className="field-textarea"
          value={value || ''}
          placeholder={p || ''}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    )
  }

  if (t === 'num') {
    if (isLinearMeasurementField(field)) {
      return <MeasurementInput field={field} value={value} onChange={onChange} />
    }

    const currentValue = value === '' || value == null ? 0 : Number(value)
    const adjustValue = amount => {
      const base = Number.isFinite(currentValue) ? currentValue : 0
      onChange(String(Math.max(0, base + amount)))
    }
    const inputCh = Math.max(String(value || p || '').length, 3)
    return (
      <div className="field-group">
        {lbl}
        <div className="number-stepper">
          <button type="button" className="number-stepper__btn" onClick={() => adjustValue(-1)} aria-label={`Decrease ${l}`}>−</button>
          <input
            className="field-input number-stepper__input"
            style={{ '--field-ch': inputCh }}
            type="number"
            inputMode="numeric"
            min="0"
            value={value || ''}
            placeholder={p || '0'}
            onChange={e => onChange(e.target.value)}
          />
          <button type="button" className="number-stepper__btn" onClick={() => adjustValue(1)} aria-label={`Increase ${l}`}>+</button>
        </div>
      </div>
    )
  }

  const inputCh = Math.max(String(value || p || '').length, 3)
  return (
    <div className="field-group">
      {lbl}
      <input
        className="field-input"
        style={{ '--field-ch': inputCh }}
        type="text"
        value={value || ''}
        placeholder={p || ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

// ── Photo Zone ────────────────────────────────────────────────────
function PhotoZone({ itemId, photos, trigPhoto, onRemove }) {
  return (
    <div className="ri-photo-zone">
      <span className="ri-photo-label">Photos</span>
      {photos.length > 0 && (
        <div className="ri-photo-row">
          {photos.map((src, i) => (
            <div key={i} className="ri-photo-thumb">
              <img src={src} alt="" />
              <button type="button" className="ri-photo-del" onClick={() => onRemove(itemId, i)} aria-label="Remove photo">×</button>
            </div>
          ))}
        </div>
      )}
      <div className="ri-photo-btns">
        <button type="button" className="ri-btn-photo ri-btn-photo--cam" onClick={() => trigPhoto(itemId, 'cam')} aria-label="Camera" title="Camera">
          <Camera size={16} aria-hidden="true" />
        </button>
        <button type="button" className="ri-btn-photo ri-btn-photo--gal" onClick={() => trigPhoto(itemId, 'gal')} aria-label="Gallery" title="Gallery">
          <FolderOpen size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ── Exterior Item Card ────────────────────────────────────────────
function ExteriorItem({ itemDef, trigPhoto }) {
  const { toggleExteriorExclude, updateExteriorField, removeExteriorPhoto, data } = useInspection()
  const { id, lbl, flags, fields, damageLabel, damagePlaceholder } = itemDef
  const item = data.exteriorData[id]
  const { excluded, photos } = item

  const hasP = flags.includes('P')
  const hasM = flags.includes('M')
  const hasD = flags.includes('D')
  const damageStatus = item.fields._damagePresent || (item.fields._damage ? 'Yes' : '')

  function handleDamageStatus(nextStatus) {
    updateExteriorField(id, '_damagePresent', nextStatus)
    if (nextStatus !== 'Yes') updateExteriorField(id, '_damage', '')
  }

  return (
    <div className={`ri-item${excluded ? ' ri-item--excluded' : ''}`}>
      <div className="ri-item__top">
        <button
          type="button"
          className={`ri-item__toggle${excluded ? ' ri-item__toggle--excl' : ''}`}
          onClick={() => toggleExteriorExclude(id)}
          title={excluded ? 'Click to include' : 'Click to mark as N/A'}
        >
          {excluded ? 'N/A' : '✓'}
        </button>
        <span className={`ri-item__name${excluded ? ' ri-item__name--excl' : ''}`}>{lbl}</span>
      </div>

      {!excluded && (
        <div className="ri-item__body">
          {flags.length > 0 && (
            <div className="ri-flag-row">
              {hasP && <span className="ri-flag ri-flag--photo">PHOTO</span>}
              {hasM && <span className="ri-flag ri-flag--measure">MEASURE</span>}
              {hasD && <span className="ri-flag ri-flag--damage">DAMAGE</span>}
            </div>
          )}

          <div className="ri-fields-grid">
            {fields.map(f => (
              <FieldRenderer
                key={f.l}
                field={f}
                value={item.fields[f.l]}
                onChange={val => updateExteriorField(id, f.l, val)}
              />
            ))}
          </div>

          {hasD && (
            <div className="ri-damage-row">
              <div className="field-group">
                <label className="form-label">Damaged</label>
                <select
                  className="field-select compact-select"
                  value={damageStatus}
                  onChange={e => handleDamageStatus(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              {damageStatus === 'Yes' && (
                <>
                  <label className="form-label">{damageLabel || 'Damage Notes'}</label>
                  <textarea
                    className="ri-damage-input"
                    placeholder={damagePlaceholder || 'Describe damage...'}
                    value={item.fields['_damage'] || ''}
                    onChange={e => updateExteriorField(id, '_damage', e.target.value)}
                  />
                </>
              )}
            </div>
          )}

          {hasP && (
            <PhotoZone
              itemId={id}
              photos={photos}
              trigPhoto={trigPhoto}
              onRemove={removeExteriorPhoto}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-section Card ──────────────────────────────────────────────
function SubSectionCard({ title, items, trigPhoto }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className={`app-card ri-card${isOpen ? ' ri-card--open' : ''}`}>
      <button
        type="button"
        className="ri-card__toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
      >
        <span className="section-eyebrow ri-card__eyebrow">{title}</span>
        <ChevronDown className="ri-card__chevron" aria-hidden="true" />
      </button>
      <div className={`collapse-panel ${isOpen ? 'collapse-panel--open' : ''}`} aria-hidden={!isOpen}>
        <div className="collapse-panel__inner">
          <div className="ri-card__content">
            {items.map(item => (
              <ExteriorItem key={item.id} itemDef={item} trigPhoto={trigPhoto} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Main Section ──────────────────────────────────────────────────
export default function ExteriorSection() {
  const { addExteriorPhoto } = useInspection()
  const activeItemRef = useRef(null)
  const camRef = useRef(null)
  const galRef = useRef(null)

  function trigPhoto(itemId, mode) {
    activeItemRef.current = itemId
    if (mode === 'cam') camRef.current?.click()
    else galRef.current?.click()
  }

  function handleFile(e) {
    const itemId = activeItemRef.current
    if (!itemId) return
    Array.from(e.target.files || []).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => addExteriorPhoto(itemId, ev.target.result)
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  // Group items by subsection
  const subsectionKeys = Object.keys(EXTERIOR_SUBSECTIONS)
  const groups = subsectionKeys.map(startId => {
    const startIdx = EXTERIOR_ITEMS.findIndex(i => i.id === startId)
    const nextIdx = subsectionKeys.findIndex(k => k === startId) + 1
    const nextStartId = subsectionKeys[nextIdx]
    const endIdx = nextStartId ? EXTERIOR_ITEMS.findIndex(i => i.id === nextStartId) : EXTERIOR_ITEMS.length
    return {
      label: EXTERIOR_SUBSECTIONS[startId],
      items: EXTERIOR_ITEMS.slice(startIdx, endIdx),
    }
  })

  return (
    <>
      <input
        ref={camRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <input
        ref={galRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {groups.map(group => (
        <SubSectionCard
          key={group.label}
          title={group.label}
          items={group.items}
          trigPhoto={trigPhoto}
        />
      ))}
    </>
  )
}
