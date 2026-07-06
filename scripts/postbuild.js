const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname, '..', 'build')

// Rename index.html to app-shell.html so it doesn't compete at root
fs.renameSync(
  path.join(buildDir, 'index.html'),
  path.join(buildDir, 'app-shell.html')
)

// Write _redirects so Netlify knows how to route
fs.writeFileSync(
  path.join(buildDir, '_redirects'),
  `/api/*  /.netlify/functions/:splat  200\n/app/*  /app-shell.html  200\n/*      /landing.html  200\n`
)

console.log('postbuild: index.html → app-shell.html, _redirects updated')
