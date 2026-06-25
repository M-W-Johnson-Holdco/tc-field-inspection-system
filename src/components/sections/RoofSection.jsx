import { useRef, useState } from 'react'
import { Camera, ChevronDown, FolderOpen } from 'lucide-react'
import { useInspection } from '../../context/InspectionContext'
import { ROOF_ITEMS, SUBSECTIONS } from '../../data/roofItems'

// ── Field Renderer ─────────────────────────────────────────────────
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
          {opts.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  if (t === 'multiRadio' || t === 'multi') {
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
                  onChange={() => {
                    const next = arr.includes(opt)
                      ? arr.filter(v => v !== opt)
                      : [...arr, opt]
                    onChange(next)
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
        </details>
        {arr.length > 0 && (
          <div className="multi-select__selected" aria-label={`Selected ${l}`}>
            {arr.map(opt => (
              <span key={opt} className="multi-select__chip">{opt}</span>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (t === 'select') {
    return (
      <div className="field-group">
        {lbl}
        <select
          className="field-select"
          value={value || o[0]}
          onChange={e => onChange(e.target.value)}
        >
          {o.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  if (t === 'textarea') {
    return (
      <div className="field-group">
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

  const inputCh = Math.max(String(value || p || '').length, 3)

  if (t === 'num') {
    const currentValue = value === '' || value == null ? 0 : Number(value)
    const adjustValue = amount => {
      const base = Number.isFinite(currentValue) ? currentValue : 0
      onChange(String(Math.max(0, base + amount)))
    }

    return (
      <div className="field-group">
        {lbl}
        <div className="number-stepper">
          <button
            type="button"
            className="number-stepper__btn"
            aria-label={`Decrease ${l}`}
            onClick={() => adjustValue(-1)}
          >
            −
          </button>
          <input
            className="field-input number-stepper__input"
            style={{ '--field-ch': inputCh }}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={value || ''}
            placeholder={p || ''}
            onChange={e => onChange(e.target.value)}
          />
          <button
            type="button"
            className="number-stepper__btn"
            aria-label={`Increase ${l}`}
            onClick={() => adjustValue(1)}
          >
            +
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="field-group">
      {lbl}
      <input
        className="field-input"
        style={{ '--field-ch': inputCh }}
        type="text"
        inputMode="text"
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
              <button
                type="button"
                className="ri-photo-del"
                onClick={() => onRemove(itemId, i)}
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="ri-photo-btns">
        <button
          type="button"
          className="ri-btn-photo ri-btn-photo--cam"
          onClick={() => trigPhoto(itemId, 'cam')}
          aria-label="Add photo from camera"
          title="Camera"
        >
          <Camera size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ri-btn-photo ri-btn-photo--gal"
          onClick={() => trigPhoto(itemId, 'gal')}
          aria-label="Add photo from gallery"
          title="Gallery"
        >
          <FolderOpen size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ── Check Item ────────────────────────────────────────────────────
function CheckItem({ itemDef, trigPhoto }) {
  const {
    updateRoofField, toggleRoofExclude,
    addRoofSubItem, removeRoofSubItem, updateRoofSubField,
    removeRoofPhoto, data,
  } = useInspection()

  const { id, lbl, flags, fields, addMore, addMoreLabel, subFields } = itemDef
  const item = data.roofData[id]
  const { excluded, subItems, photos } = item

  const hasP = flags.includes('P')
  const hasM = flags.includes('M')
  const hasD = flags.includes('D')

  return (
    <div className={`ri-item${excluded ? ' ri-item--excluded' : ''}`}>
      <div className="ri-item__top">
        <button
          type="button"
          className={`ri-item__toggle${excluded ? ' ri-item__toggle--excl' : ''}`}
          onClick={() => toggleRoofExclude(id)}
          title={excluded ? 'Click to include' : 'Click to mark as N/A'}
        >
          {excluded ? 'N/A' : '✓'}
        </button>
        <span className={`ri-item__name${excluded ? ' ri-item__name--excl' : ''}`}>
          {lbl}
        </span>
      </div>

      {!excluded && (
        <div className="ri-item__body">

          <div className="ri-flag-row">
            {hasP && <span className="ri-flag ri-flag--photo">PHOTO</span>}
            {hasM && <span className="ri-flag ri-flag--measure">MEASURE</span>}
            {hasD && <span className="ri-flag ri-flag--damage">DAMAGE</span>}
          </div>

          <div className="ri-fields-grid">
            {fields.map(f => (
              <FieldRenderer
                key={f.l}
                field={f}
                value={item.fields[f.l]}
                onChange={val => updateRoofField(id, f.l, val)}
              />
            ))}
          </div>

          {hasD && (
            <div className="ri-damage-row">
              <label className="form-label">Damage Description</label>
              <textarea
                className="ri-damage-input"
                placeholder="Describe visible hail/wind damage..."
                value={item.fields['_damage'] || ''}
                onChange={e => updateRoofField(id, '_damage', e.target.value)}
              />
            </div>
          )}

          {addMore && (
            <div className="ri-sub-items">
              {subItems.map((sub, idx) => (
                <div key={idx} className="ri-sub-card">
                  <div className="ri-sub-card__top">
                    <span className="ri-sub-card__title">
                      {(addMoreLabel || 'Item').replace('Add ', '')} #{idx + 1}
                    </span>
                    <button
                      type="button"
                      className="ri-btn-remove"
                      onClick={() => removeRoofSubItem(id, idx)}
                    >
                      Remove
                    </button>
                  </div>
                  {subFields && subFields.length > 0 && (
                    <div className="ri-fields-grid">
                      {subFields.map(f => (
                        <FieldRenderer
                          key={f.l}
                          field={f}
                          value={sub.fields[f.l]}
                          onChange={val => updateRoofSubField(id, idx, f.l, val)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="ri-btn-add-sub"
                onClick={() => addRoofSubItem(id)}
              >
                + {addMoreLabel}
              </button>
            </div>
          )}

          {hasP && (
            <PhotoZone
              itemId={id}
              photos={photos}
              trigPhoto={trigPhoto}
              onRemove={removeRoofPhoto}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-section Card ──────────────────────────────────────────────
function SubSectionCard({ title, items, trigPhoto, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

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
      {isOpen && (
        <div className="ri-card__content">
          {items.map(item => (
            <CheckItem key={item.id} itemDef={item} trigPhoto={trigPhoto} />
          ))}
        </div>
      )}
    </section>
  )
}

// ── Main Export ───────────────────────────────────────────────────
export default function RoofSection() {
  const { addRoofPhoto } = useInspection()
  const activeItemRef = useRef(null)
  const camRef = useRef(null)
  const galRef = useRef(null)

  function trigPhoto(itemId, mode) {
    activeItemRef.current = itemId
    if (mode === 'cam') camRef.current?.click()
    else galRef.current?.click()
  }

  function handleFiles(e) {
    const itemId = activeItemRef.current
    if (!itemId) return
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => addRoofPhoto(itemId, ev.target.result)
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const ssIds = Object.keys(SUBSECTIONS)
  const subsections = ssIds.map((startId, i) => {
    const from = ROOF_ITEMS.findIndex(it => it.id === startId)
    const to = i + 1 < ssIds.length
      ? ROOF_ITEMS.findIndex(it => it.id === ssIds[i + 1])
      : ROOF_ITEMS.length
    return { title: SUBSECTIONS[startId], items: ROOF_ITEMS.slice(from, to) }
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
        onChange={handleFiles}
      />
      <input
        ref={galRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFiles}
      />
      {subsections.map(({ title, items }, index) => (
        <SubSectionCard
          key={title}
          title={title}
          items={items}
          trigPhoto={trigPhoto}
          defaultOpen={index === 0}
        />
      ))}
    </>
  )
}
