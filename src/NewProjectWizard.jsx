import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'

const STEPS = ['Basic Info', 'Client Contacts', 'Folders', 'Review']

export default function NewProjectWizard() {
  const { userRole, user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const isClient = userRole === 'client'

  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [unit, setUnit] = useState('units')
  const [totalPlanned, setTotalPlanned] = useState('')
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [assignedClientEmail, setAssignedClientEmail] = useState('')

  const [contacts, setContacts] = useState([{ name: '', email: '' }])

  const [folders, setFolders] = useState(['Client Files', 'Project Files', 'Expenses'])
  const [newFolder, setNewFolder] = useState('')

  function addContact() {
    setContacts([...contacts, { name: '', email: '' }])
  }

  function updateContact(i, field, value) {
    const updated = [...contacts]
    updated[i][field] = value
    setContacts(updated)
  }

  function removeContact(i) {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, idx) => idx !== i))
    }
  }

  function addFolder() {
    const trimmed = newFolder.trim()
    if (trimmed && !folders.includes(trimmed)) {
      setFolders([...folders, trimmed])
      setNewFolder('')
    }
  }

  function removeFolder(f) {
    setFolders(folders.filter(x => x !== f))
  }

  function canNext() {
    if (step === 0) return name && client && totalPlanned && startDate && targetDate
    if (step === 1) return contacts.every(c => c.name && c.email)
    if (step === 2) return folders.length > 0
    return true
  }

  async function handleCreate() {
    setSubmitting(true)
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        client,
        unit,
        total_planned: parseFloat(totalPlanned),
        start_date: startDate,
        target_date: targetDate,
        contacts: JSON.stringify(contacts),
        folders: JSON.stringify(folders),
        assigned_client_email: assignedClientEmail || null
      })
      .select()
      .single()

    setSubmitting(false)
    if (!error && data) {
      navigate(`/project/${data.id}`)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f2f0ea' }}>
      {/* Top bar */}
      <div style={{
        background: '#14202b', height: 72, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, border: '2px solid #ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 16, color: '#ffffff', letterSpacing: 1
          }}>GZ</div>
          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, letterSpacing: 1.5 }}>
            GROUND ZERO
            <span style={{ fontWeight: 400, fontSize: 11, color: '#b0b0b0', display: 'block' }}>
              CONTRACTORS INC.
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent', color: '#c0c0c0', border: '1px solid #555',
            padding: '6px 14px', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{
              flex: 1, textAlign: 'center', padding: '8px 0',
              fontSize: '0.75rem', fontWeight: 600, letterSpacing: 0.5,
              color: i === step ? '#e8590c' : i < step ? '#2b8a3e' : '#8a8578',
              borderBottom: `3px solid ${i === step ? '#e8590c' : i < step ? '#2b8a3e' : '#d4d0c8'}`,
              transition: 'all 0.2s'
            }}>
              {i < step ? '\u2713 ' : ''}{label}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{ background: '#ffffff', borderRadius: 8, padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: '1.1rem', color: '#1c1c1a', marginBottom: '1.5rem' }}>Step 1: Basic Information</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1c1c1a', marginBottom: 4 }}>Project Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Highway 401 Expansion" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1c1c1a', marginBottom: 4 }}>Client</label>
                  <input value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. Ministry of Transportation" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1c1c1a', marginBottom: 4 }}>Unit</label>
                    <select value={unit} onChange={e => setUnit(e.target.value)} style={inputStyle}>
                      <option value="units">units</option>
                      <option value="m³">m³</option>
                      <option value="tonnes">tonnes</option>
                      <option value="sq ft">sq ft</option>
                      <option value="lin ft">lin ft</option>
                      <option value="hours">hours</option>
                      <option value="each">each</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1c1c1a', marginBottom: 4 }}>Total Planned</label>
                    <input type="number" step="any" value={totalPlanned} onChange={e => setTotalPlanned(e.target.value)} placeholder="e.g. 50000" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1c1c1a', marginBottom: 4 }}>Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1c1c1a', marginBottom: 4 }}>Target Date</label>
                    <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                {!isClient && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1c1c1a', marginBottom: 4 }}>Assigned Client Email (optional)</label>
                    <input
                      type="email"
                      value={assignedClientEmail}
                      onChange={e => setAssignedClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      style={inputStyle}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#8a8578', marginTop: 4 }}>Assign a client user to this project. They'll only see this project.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.1rem', color: '#1c1c1a', marginBottom: '1.5rem' }}>Step 2: Client Contacts</h2>
              {contacts.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
                  marginBottom: '0.75rem', paddingBottom: '0.75rem',
                  borderBottom: i < contacts.length - 1 ? '1px solid #f2f0ea' : 'none'
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#8a8578', marginBottom: 3 }}>Name</label>
                    <input value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} placeholder="Contact name" style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#8a8578', marginBottom: 3 }}>Email</label>
                    <input value={c.email} onChange={e => updateContact(i, 'email', e.target.value)} placeholder="email@example.com" style={inputStyle} />
                  </div>
                  <button onClick={() => removeContact(i)} disabled={contacts.length <= 1}
                    style={{
                      background: 'transparent', border: '1px solid #d4d0c8',
                      color: '#8a8578', padding: '6px 10px', borderRadius: 4,
                      fontSize: '0.8rem', cursor: contacts.length <= 1 ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >Remove</button>
                </div>
              ))}
              <button onClick={addContact} style={{
                background: 'transparent', border: '1px dashed #d4d0c8', color: '#8a8578',
                padding: '8px 16px', borderRadius: 4, fontSize: '0.85rem', cursor: 'pointer',
                width: '100%'
              }}>+ Add Contact</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.1rem', color: '#1c1c1a', marginBottom: '1.5rem' }}>Step 3: Project Folders</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {folders.map(f => (
                  <div key={f} style={{
                    background: '#f2f0ea', borderRadius: 20, padding: '5px 12px',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: '0.85rem', color: '#1c1c1a'
                  }}>
                    {f}
                    <span onClick={() => removeFolder(f)} style={{ cursor: 'pointer', color: '#8a8578', fontWeight: 700 }}>&times;</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={newFolder}
                  onChange={e => setNewFolder(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFolder(); } }}
                  placeholder="Folder name"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addFolder} style={{
                  background: '#e8590c', color: '#ffffff', border: 'none',
                  padding: '8px 16px', borderRadius: 4, fontSize: '0.85rem',
                  fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                }}>Add</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.1rem', color: '#1c1c1a', marginBottom: '1.5rem' }}>Step 4: Review &amp; Create</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <ReviewRow label="Project Name" value={name} />
                <ReviewRow label="Client" value={client} />
                <ReviewRow label="Total Planned" value={`${parseFloat(totalPlanned).toLocaleString()} ${unit}`} />
                <ReviewRow label="Start Date" value={startDate} />
                <ReviewRow label="Target Date" value={targetDate} />
                {assignedClientEmail && <ReviewRow label="Client Email" value={assignedClientEmail} />}
                <ReviewRow label="Contacts" value={contacts.filter(c => c.name && c.email).map(c => `${c.name} (${c.email})`).join(', ') || 'None'} />
                <ReviewRow label="Folders" value={folders.join(', ')} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button
              onClick={() => step === 0 ? navigate('/') : setStep(step - 1)}
              style={{
                background: 'transparent', color: '#8a8578', border: '1px solid #d4d0c8',
                padding: '10px 22px', borderRadius: 4, fontSize: '0.85rem',
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                style={{
                  background: '#e8590c', color: '#ffffff', border: 'none',
                  padding: '10px 22px', borderRadius: 4, fontSize: '0.85rem',
                  fontWeight: 600, cursor: canNext() ? 'pointer' : 'not-allowed',
                  opacity: canNext() ? 1 : 0.5
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={submitting}
                style={{
                  background: '#e8590c', color: '#ffffff', border: 'none',
                  padding: '10px 22px', borderRadius: 4, fontSize: '0.85rem',
                  fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1
                }}
              >
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #d4d0c8',
  borderRadius: 4,
  fontSize: '0.9rem',
  background: '#fafaf8',
  outline: 'none'
}

function ReviewRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <span style={{ width: 140, fontWeight: 600, color: '#8a8578', fontSize: '0.85rem', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#1c1c1a', fontSize: '0.85rem' }}>{value}</span>
    </div>
  )
}
