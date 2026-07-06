const https = require('https')

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const { email, name, password } = JSON.parse(event.body)

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) }
  }

  const pwd = password || 'PeterSabota'

  // Store the plaintext password in user_metadata so admins can look it up
  const metadata = { role: 'client', name, plain_password: password || '' }

  try {
    const result = await createSupabaseUser(email, pwd, metadata)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    }
  }
}

function createSupabaseUser(email, password, metadata) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata
    })

    const hostname = SUPABASE_URL.replace('https://', '')
    const req = https.request({
      hostname,
      path: '/auth/v1/admin/users',
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = ''
      res.on('data', c => body += c)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          if (parsed.id) resolve({ id: parsed.id, email: parsed.email })
          else if (parsed.code === 'user_already_exists') resolve({ exists: true, email })
          else reject(new Error(parsed.msg || 'Failed to create user'))
        } catch(e) {
          reject(new Error(body))
        }
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}
