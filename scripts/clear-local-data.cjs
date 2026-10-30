/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const fs = require('node:fs')
const path = require('node:path')

const force = process.argv.includes('--force') || process.env.CONFIRM_DELETE_LOGS === '1'
const databaseUrl = process.env.DATABASE_URL || ''

if (!force) {
  console.error('Refusing to delete data without confirmation.')
  console.error('Run: npm run db:clear -- --force')
  process.exit(1)
}

if (databaseUrl && !databaseUrl.startsWith('file:') && process.env.ALLOW_REMOTE_DB_DELETE !== '1') {
  console.error('Refusing to clear a non-file database without ALLOW_REMOTE_DB_DELETE=1.')
  console.error('This protects shared Supabase or production data.')
  process.exit(1)
}

const prisma = new PrismaClient()
const legacyDatabasePath = path.resolve(__dirname, '..', 'db', 'custom.db')

prisma.appLog
  .deleteMany({})
  .then((result) => {
    console.log(`Deleted ${result.count} operational log record(s).`)
  })
  .catch((error) => {
    console.error('Failed to clear operational logs:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    if (fs.existsSync(legacyDatabasePath)) {
      fs.rmSync(legacyDatabasePath)
      console.log('Deleted legacy local database file.')
    }
  })
