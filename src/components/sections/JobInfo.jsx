import { useInspection } from '../../context/InspectionContext'

const CONTACT_OPTIONS = ['Phone', 'Email', 'Text']

export default function JobInfo() {
  const { data, updateJobInfo } = useInspection()
  const ji = data.jobInfo

  function field(id, label, props = {}) {
    const { full, ...inputProps } = props
    return (
      <div className={`form-field ${full ? 'form-field--full' : ''}`}>
        <label className="form-label">{label}</label>
        <input
          className="form-input"
          value={ji[id] || ''}
          onChange={e => updateJobInfo(id, e.target.value)}
          {...inputProps}
        />
      </div>
    )
  }

  function toggleContact(val) {
    const cur = ji.preferredContact || []
    updateJobInfo('preferredContact',
      cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val]
    )
  }

  function setResidence(val) {
    updateJobInfo('residenceType', val)
    if (val === 'Primary') {
      updateJobInfo('tenantname', '')
      updateJobInfo('tenantphone', '')
    }
  }

  return (
    <section className="job-card app-card">
      <div className="card-header">
        <div>
          <p className="section-eyebrow">Inspection Setup</p>
          <h2 className="card-title">Job Information</h2>
          <p className="card-subtitle">Customer, claim, contact, and assignment details.</p>
        </div>
        <span className="status-pill">Draft</span>
      </div>
      <div className="form-grid">
        {field('cust', 'Customer Name(s)', { full: true, placeholder: 'John & Jane Smith' })}
        {field('phone', 'Customer Phone', { type: 'tel', placeholder: '(214) 555-0100' })}
        {field('email', 'Customer Email', { type: 'email', placeholder: 'john@email.com' })}

        <div className="form-field form-field--full">
          <label className="form-label">Preferred Contact Method</label>
          <div className="pill-row">
            {CONTACT_OPTIONS.map(opt => (
              <label key={opt} className="choice-pill">
                <input
                  type="checkbox"
                  checked={(ji.preferredContact || []).includes(opt)}
                  onChange={() => toggleContact(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="form-field form-field--full">
          <label className="form-label">Residence Type</label>
          <div className="pill-row">
            {['Primary', 'Rental'].map(val => (
              <div
                key={val}
                className={`select-pill ${ji.residenceType === val ? 'select-pill--active' : ''}`}
                onClick={() => setResidence(val)}
              >
                {val === 'Primary' ? 'Primary Residence' : 'Rental Property'}
              </div>
            ))}
          </div>
        </div>

        {ji.residenceType === 'Rental' && (
          <>
            {field('tenantname', 'Tenant Name', { placeholder: 'Tenant full name' })}
            {field('tenantphone', 'Tenant Phone', { type: 'tel', placeholder: '(214) 555-0101' })}
          </>
        )}

        {field('addr', 'Property Address', { full: true, placeholder: '3203 Edgebrook Ct, Wylie TX 75098' })}
        {field('pm', 'Project Manager', { placeholder: 'Name' })}
        {field('insp', 'Inspector / Rep', { placeholder: 'Name' })}
        {field('ins', 'Insurance Co', { placeholder: 'State Farm' })}
        {field('claim', 'Claim #', { placeholder: 'Pending if not filed' })}
        {field('date', 'Date', { type: 'date' })}
      </div>
    </section>
  )
}
