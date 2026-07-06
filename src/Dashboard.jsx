import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'

export default function Dashboard() {
  const { user, userRole, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const navigate = useNavigate()

  const isClient = userRole === 'client'
  const canCreate = userRole !== 'client'

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setProjects(data)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f2f0ea' }}>
      {/* Top bar */}
      <div style={{
        background: '#14202b',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            background: isClient ? '#854d0e' : '#2b8a3e',
            color: '#ffffff', fontSize: '0.7rem', fontWeight: 600,
            padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase'
          }}>
            {userRole}
          </span>
          <span style={{ color: '#ffffff', fontSize: '0.85rem' }}>
            {user?.email}
          </span>
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              color: '#c0c0c0',
              border: '1px solid #555',
              padding: '6px 14px',
              borderRadius: 4,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '2rem'
        }}>
          <h1 style={{ fontSize: '1.6rem', color: '#1c1c1a', fontWeight: 700 }}>Dashboard</h1>
          {canCreate && (
            <button
              onClick={() => navigate('/new')}
              style={{
                background: '#e8590c', color: '#ffffff', border: 'none',
                padding: '10px 22px', borderRadius: 4, fontSize: '0.9rem',
                fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5
              }}
            >
              + New Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem', color: '#8a8578',
            background: '#ffffff', borderRadius: 8
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No projects yet</p>
            <p style={{ fontSize: '0.9rem' }}>{isClient ? 'You don\'t have any assigned projects.' : 'Click "New Project" to get started.'}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/project/${p.id}`)}
                style={{
                  background: '#ffffff',
                  borderRadius: 8,
                  padding: '1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.2s'
                }}
              >
                <h3 style={{ fontSize: '1.05rem', color: '#1c1c1a', marginBottom: 4 }}>{p.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#8a8578', marginBottom: 8 }}>{p.client}</p>
                <p style={{ fontSize: '0.85rem', color: '#6e6e66' }}>
                  {p.total_planned?.toLocaleString()} {p.unit || 'units'} planned
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
