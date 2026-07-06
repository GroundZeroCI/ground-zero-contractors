import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    let eAddr = email.trim()
    if (!eAddr.includes('@')) {
      eAddr += '@gzci.ca'
    }
    try {
      await login(eAddr, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f2f0ea',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 8,
        padding: '2.5rem',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: '2rem'
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '2px solid #1c1c1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 18,
            color: '#1c1c1a',
            letterSpacing: 1
          }}>GZ</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1c1c1a', letterSpacing: 1.5 }}>GROUND ZERO</div>
            <div style={{ fontWeight: 400, fontSize: 11, color: '#8a8578' }}>CONTRACTORS INC.</div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: '#1c1c1a' }}>Staff / Client Login</h2>

        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#b91c1c',
            padding: '0.6rem 1rem',
            borderRadius: 4,
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1c1c1a', marginBottom: 4 }}>
            Email
          </label>
          <input
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@gzci.ca"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d4d0c8',
              borderRadius: 4,
              fontSize: '0.95rem',
              marginBottom: '1rem',
              outline: 'none',
              background: '#fafaf8'
            }}
          />

          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1c1c1a', marginBottom: 4 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d4d0c8',
              borderRadius: 4,
              fontSize: '0.95rem',
              marginBottom: '1.5rem',
              outline: 'none',
              background: '#fafaf8'
            }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#e8590c',
              color: '#ffffff',
              border: 'none',
              borderRadius: 4,
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: 0.5
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
