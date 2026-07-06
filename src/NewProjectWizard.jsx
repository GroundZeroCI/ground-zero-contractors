import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'

const FIXED_SUBFOLDERS = [
  'Client Files', 'Project Files', 'Expenses',
  'Timesheets', 'Daily Safety Talks', 'Machine Inspections', 'Photos'
]

const SUGGESTED_CLIENT_FOLDERS = ['3rd Parties', 'Permits', 'Change Orders']
const DEFAULT_PROJECT_FOLDERS = ['Drawings', 'Specs']
const SUGGESTED_PROJECT_FOLDERS = ['As-Builts', 'Survey Data', 'Engineering Reports', 'Permits']
const DEFAULT_EXPENSE_FOLDERS = ['Equipment Rentals', 'Fuel', 'Misc']
const SUGGESTED_EXPENSE_FOLDERS = ['Materials', 'Subcontractors', 'Permits and Fees']

export default function NewProjectWizard() {
  const { userRole, user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')

  const [contacts, setContacts] = useState([{ name: '', email: '' }])

  const [clientSubfolders, setClientSubfolders] = useState([])
  const [customFolderInput, setCustomFolderInput] = useState('')
  const [projectFileSubfolders, setProjectFileSubfolders] = useState(DEFAULT_PROJECT_FOLDERS)
  const [customProjectFileInput, setCustomProjectFileInput] = useState('')
  const [expenseSubfolders, setExpenseSubfolders] = useState(DEFAULT_EXPENSE_FOLDERS)
  const [customExpenseInput, setCustomExpenseInput] = useState('')

  const [unit, setUnit] = useState('units')
  const [totalPlanned, setTotalPlanned] = useState('')
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [assignedClientEmail, setAssignedClientEmail] = useState('')

  function updateContact(i, field, value) {
    setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  function addContact() {
    setContacts(prev => [...prev, { name: '', email: '' }])
  }

  function removeContact(i) {
    setContacts(prev => prev.filter((_, idx) => idx !== i))
  }

  function toggleSuggestedFolder(name) {
    setClientSubfolders(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name])
  }

  function addCustomFolder() {
    const name = customFolderInput.trim()
    if (name && !clientSubfolders.includes(name)) {
      setClientSubfolders(prev => [...prev, name])
    }
    setCustomFolderInput('')
  }

  function toggleSuggestedProjectFolder(name) {
    setProjectFileSubfolders(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name])
  }

  function addCustomProjectFolder() {
    const name = customProjectFileInput.trim()
    if (name && !projectFileSubfolders.includes(name)) {
      setProjectFileSubfolders(prev => [...prev, name])
    }
    setCustomProjectFileInput('')
  }

  function toggleSuggestedExpenseFolder(name) {
    setExpenseSubfolders(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name])
  }

  function addCustomExpenseFolder() {
    const name = customExpenseInput.trim()
    if (name && !expenseSubfolders.includes(name)) {
      setExpenseSubfolders(prev => [...prev, name])
    }
    setCustomExpenseInput('')
  }

  async function handleCreate() {
    setSubmitting(true)
    const foldersData = {
      fixed: FIXED_SUBFOLDERS,
      clientFiles: clientSubfolders,
      projectFiles: projectFileSubfolders,
      expenses: expenseSubfolders
    }

    const { data, error } = await supabase.from('projects').insert({
      name: projectName,
      client: clientName,
      unit,
      total_planned: totalPlanned ? parseFloat(totalPlanned) : null,
      start_date: startDate || null,
      target_date: targetDate || null,
      contacts: JSON.stringify(contacts.filter(c => c.name || c.email)),
      folders: JSON.stringify(foldersData),
      assigned_client_email: assignedClientEmail || null
    }).select().single()

    setSubmitting(false)
    if (!error && data) {
      navigate(`/project/${data.id}`)
    }
  }

  const canProceedStep1 = projectName.trim().length > 0 && clientName.trim().length > 0

  return (
    <div style={styles.app}>
      <div style={styles.topbar}>
        <div style={styles.brandMark}>GZ</div>
        <div style={styles.brandName}>New project setup</div>
        <button onClick={() => navigate('/')} style={styles.cancelBtn}>Cancel</button>
      </div>

      <div style={styles.stepIndicator}>
        <div style={{ ...styles.stepDot, ...(step >= 1 ? styles.stepDotActive : {}) }}>1</div>
        <div style={styles.stepLine} />
        <div style={{ ...styles.stepDot, ...(step >= 2 ? styles.stepDotActive : {}) }}>2</div>
        <div style={styles.stepLine} />
        <div style={{ ...styles.stepDot, ...(step >= 3 ? styles.stepDotActive : {}) }}>3</div>
        <div style={styles.stepLine} />
        <div style={{ ...styles.stepDot, ...(step >= 4 ? styles.stepDotActive : {}) }}>4</div>
      </div>

      <div style={styles.body}>
        {step === 1 && (
          <>
            <h2 style={styles.stepTitle}>What's the project called?</h2>
            <p style={styles.stepSub}>This is just for your team to recognize it in the folder list.</p>

            <label style={styles.label}>Project name</label>
            <input style={styles.input} placeholder="e.g. T210 Remediation" value={projectName} onChange={e => setProjectName(e.target.value)} />

            <label style={styles.label}>Client name</label>
            <input style={styles.input} placeholder="e.g. Acme Corp" value={clientName} onChange={e => setClientName(e.target.value)} />

            <label style={styles.label}>Tracking unit (optional)</label>
            <select value={unit} onChange={e => setUnit(e.target.value)} style={styles.input}>
              <option value="units">units</option>
              <option value="m\u00b3">m\u00b3</option>
              <option value="tonnes">tonnes</option>
              <option value="sq ft">sq ft</option>
              <option value="lin ft">lin ft</option>
              <option value="hours">hours</option>
              <option value="each">each</option>
            </select>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Total planned</label>
                <input type="number" style={styles.input} placeholder="e.g. 50000" value={totalPlanned} onChange={e => setTotalPlanned(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Start date</label>
                <input type="date" style={styles.input} value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Target date</label>
                <input type="date" style={styles.input} value={targetDate} onChange={e => setTargetDate(e.target.value)} />
              </div>
            </div>

            {userRole !== 'client' && (
              <div>
                <label style={styles.label}>Assigned client email (optional)</label>
                <input type="email" style={styles.input} placeholder="client@example.com" value={assignedClientEmail} onChange={e => setAssignedClientEmail(e.target.value)} />
              </div>
            )}

            <button style={{ ...styles.primaryBtn, ...(!canProceedStep1 ? styles.disabledBtn : {}) }} disabled={!canProceedStep1} onClick={() => setStep(2)}>Next</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={styles.stepTitle}>Who from the client can see project files?</h2>
            <p style={styles.stepSub}>These people will only see the Client Files folder for {projectName || 'this project'}. Nothing else on the site.</p>

            {contacts.map((c, i) => (
              <div key={i} style={styles.contactRow}>
                <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Contact name" value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} />
                <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="Email" value={c.email} onChange={e => updateContact(i, 'email', e.target.value)} />
                {contacts.length > 1 && <button style={styles.removeBtn} onClick={() => removeContact(i)}>Remove</button>}
              </div>
            ))}

            <button style={styles.secondaryBtn} onClick={addContact}>+ Add another contact</button>

            <div style={styles.stepButtons}>
              <button style={styles.secondaryBtn} onClick={() => setStep(1)}>Back</button>
              <button style={styles.primaryBtn} onClick={() => setStep(3)}>Next</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={styles.stepTitle}>Set up folders for this project</h2>
            <p style={styles.stepSub}>Optional. Bigger projects with lots of third parties, drawings, or varied expenses often want these split out.</p>

            <h3 style={styles.sectionTitle}>Client Files folder</h3>
            <div style={styles.chipRow}>
              {SUGGESTED_CLIENT_FOLDERS.map(name => (
                <button key={name} style={{ ...styles.chip, ...(clientSubfolders.includes(name) ? styles.chipActive : {}) }} onClick={() => toggleSuggestedFolder(name)}>
                  {clientSubfolders.includes(name) ? 'Added: ' : '+ '}{name}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="e.g. Subcontractor Insurance" value={customFolderInput} onChange={e => setCustomFolderInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomFolder()} />
              <button style={styles.secondaryBtn} onClick={addCustomFolder}>Add</button>
            </div>

            <div style={styles.divider} />

            <h3 style={styles.sectionTitle}>Project Files folder</h3>
            <p style={styles.stepSub}>Internal reference material — drawings and specs are added by default. Not visible to clients.</p>
            <div style={styles.chipRow}>
              {[...DEFAULT_PROJECT_FOLDERS, ...SUGGESTED_PROJECT_FOLDERS].map(name => (
                <button key={name} style={{ ...styles.chip, ...(projectFileSubfolders.includes(name) ? styles.chipActive : {}) }} onClick={() => toggleSuggestedProjectFolder(name)}>
                  {projectFileSubfolders.includes(name) ? 'Added: ' : '+ '}{name}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="e.g. Geotechnical Reports" value={customProjectFileInput} onChange={e => setCustomProjectFileInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomProjectFolder()} />
              <button style={styles.secondaryBtn} onClick={addCustomProjectFolder}>Add</button>
            </div>

            <div style={styles.divider} />

            <h3 style={styles.sectionTitle}>Expenses folder</h3>
            <p style={styles.stepSub}>Equipment Rentals, Fuel, and Misc are added by default. Add more if needed.</p>
            <div style={styles.chipRow}>
              {[...DEFAULT_EXPENSE_FOLDERS, ...SUGGESTED_EXPENSE_FOLDERS].map(name => (
                <button key={name} style={{ ...styles.chip, ...(expenseSubfolders.includes(name) ? styles.chipActive : {}) }} onClick={() => toggleSuggestedExpenseFolder(name)}>
                  {expenseSubfolders.includes(name) ? 'Added: ' : '+ '}{name}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...styles.input, marginBottom: 0, flex: 1 }} placeholder="e.g. Rental Deposits" value={customExpenseInput} onChange={e => setCustomExpenseInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomExpenseFolder()} />
              <button style={styles.secondaryBtn} onClick={addCustomExpenseFolder}>Add</button>
            </div>

            <div style={styles.stepButtons}>
              <button style={styles.secondaryBtn} onClick={() => setStep(2)}>Back</button>
              <button style={styles.primaryBtn} onClick={() => setStep(4)}>Next</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={styles.stepTitle}>Review and create</h2>
            <p style={styles.stepSub}>Here is what will be set up. Nothing else to configure.</p>

            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Project</div>
              <div style={styles.summaryRow}>{projectName}</div>
              <div style={styles.summaryRowMuted}>Client: {clientName}</div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Folders (created automatically)</div>
              {FIXED_SUBFOLDERS.map(f => <div key={f} style={styles.summaryRow}>{f}</div>)}
              {clientSubfolders.length > 0 && (
                <div style={{ marginTop: 8, paddingLeft: 14 }}>
                  <div style={styles.summaryRowMuted}>Inside Client Files:</div>
                  {clientSubfolders.map(f => <div key={f} style={styles.summaryRow}>{f}</div>)}
                </div>
              )}
              {projectFileSubfolders.length > 0 && (
                <div style={{ marginTop: 8, paddingLeft: 14 }}>
                  <div style={styles.summaryRowMuted}>Inside Project Files:</div>
                  {projectFileSubfolders.map(f => <div key={f} style={styles.summaryRow}>{f}</div>)}
                </div>
              )}
              {expenseSubfolders.length > 0 && (
                <div style={{ marginTop: 8, paddingLeft: 14 }}>
                  <div style={styles.summaryRowMuted}>Inside Expenses:</div>
                  {expenseSubfolders.map(f => <div key={f} style={styles.summaryRow}>{f}</div>)}
                </div>
              )}
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Client access</div>
              {contacts.filter(c => c.name || c.email).length === 0 ? (
                <div style={styles.summaryRowMuted}>None added — can be added later</div>
              ) : (
                contacts.filter(c => c.name || c.email).map((c, i) => (
                  <div key={i} style={styles.summaryRow}>{c.name} ({c.email || 'no email yet'})</div>
                ))
              )}
            </div>

            {totalPlanned && (
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Production tracking</div>
                <div style={styles.summaryRow}>{totalPlanned} {unit} planned</div>
                {startDate && <div style={styles.summaryRowMuted}>Start: {startDate}</div>}
                {targetDate && <div style={styles.summaryRowMuted}>Target: {targetDate}</div>}
              </div>
            )}

            {assignedClientEmail && (
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Client portal access</div>
                <div style={styles.summaryRow}>{assignedClientEmail}</div>
              </div>
            )}

            <div style={styles.stepButtons}>
              <button style={styles.secondaryBtn} onClick={() => setStep(3)}>Back</button>
              <button style={styles.primaryBtn} onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create project'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  app: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#1c1c1a',
    background: '#f2f0ea',
    minHeight: '100vh',
    maxWidth: 640,
    margin: '0 auto',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 20px',
    background: '#14202b',
    color: '#fff',
  },
  brandMark: {
    width: 32,
    height: 32,
    background: '#e8590c',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 12,
  },
  brandName: { fontWeight: 600, fontSize: 15, flex: 1 },
  cancelBtn: {
    background: 'transparent', color: '#c0c0c0', border: '1px solid #555',
    padding: '6px 14px', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer'
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '20px 0 4px',
    background: '#f2f0ea',
  },
  stepDot: {
    width: 26, height: 26, borderRadius: '50%',
    background: '#e2ded2', color: '#8a8578',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 600,
  },
  stepDotActive: { background: '#e8590c', color: '#fff' },
  stepLine: { width: 40, height: 2, background: '#e2ded2' },
  body: { padding: '24px 32px 32px', background: '#f2f0ea' },
  stepTitle: { fontSize: 19, fontWeight: 600, margin: '0 0 6px' },
  stepSub: { fontSize: 13, color: '#8a8578', margin: '0 0 20px' },
  sectionTitle: { fontSize: 15, fontWeight: 600, margin: '0 0 4px' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, marginTop: 14 },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #d8d5cb',
    borderRadius: 6,
    marginBottom: 4,
    boxSizing: 'border-box',
    background: '#fafaf8',
  },
  contactRow: { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    fontSize: 13,
    padding: '8px 14px',
    borderRadius: 20,
    border: '1px solid #d8d5cb',
    background: '#fff',
    color: '#57544c',
    cursor: 'pointer',
  },
  chipActive: {
    background: '#fde4d3',
    borderColor: '#e8590c',
    color: '#a8380d',
    fontWeight: 500,
  },
  removeBtn: {
    fontSize: 12, color: '#a8380d', background: 'none',
    border: '1px solid #f0997b', borderRadius: 4,
    padding: '8px 10px', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  primaryBtn: {
    background: '#e8590c', color: '#fff', border: 'none', borderRadius: 6,
    padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 20,
  },
  disabledBtn: { background: '#e2ded2', color: '#a8a498', cursor: 'not-allowed' },
  secondaryBtn: {
    background: 'none', color: '#57544c', border: '1px solid #d8d5cb',
    borderRadius: 6, padding: '11px 20px', fontSize: 14, cursor: 'pointer', marginTop: 12,
  },
  stepButtons: { display: 'flex', gap: 10, marginTop: 20 },
  divider: { borderTop: '1px solid #e2ded2', margin: '24px 0 20px' },
  summaryCard: {
    background: '#fff', border: '1px solid #e2ded2', borderRadius: 8,
    padding: '14px 16px', marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em',
    color: '#8a8578', marginBottom: 8,
  },
  summaryRow: { fontSize: 14, padding: '3px 0' },
  summaryRowMuted: { fontSize: 13, color: '#8a8578', padding: '3px 0' },
}
