/* eslint-disable @typescript-eslint/no-require-imports -- .cjs scripts require CommonJS imports. */
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const standalone = path.join(root, '.next', 'standalone')

fs.cpSync(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'), {
  recursive: true,
})
fs.cpSync(path.join(root, 'public'), path.join(standalone, 'public'), {
  recursive: true,
})
