// scripts/setup-supabase.ts
// ----------------------------------------------------------------
// Run this AFTER pasting your real Supabase credentials into .env:
//   bun run scripts/setup-supabase.ts
//
// It will:
//   1. Flip prisma/schema.prisma provider from "sqlite" → "postgres"
//      (adds directUrl so Supabase migrations work)
//   2. Run `prisma generate` to rebuild the client for postgres
//   3. Run `prisma db push` to create all tables on your Supabase project
//   4. Run `prisma db seed` (if seed script exists) to populate initial
//      categories + sample products
// ----------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { resolve } from 'path'

const SCHEMA_PATH = resolve('prisma/schema.prisma')
const ENV_PATH = resolve('.env')

function run(cmd: string, label: string) {
  console.log(`\n→ ${label}`)
  console.log(`  $ ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd() })
}

function fail(msg: string) {
  console.error(`\n✗ ${msg}`)
  process.exit(1)
}

// --- 1. Sanity check env vars --------------------------------------------------
console.log('Checking .env for Supabase credentials...')
const env = readFileSync(ENV_PATH, 'utf8')

const required = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]
for (const key of required) {
  // Match `key=value` or `key =value`, ignoring # comments
  const re = new RegExp(`^\\s*${key}\\s*=\\s*([^\\s#]+)`, 'm')
  const m = env.match(re)
  if (!m) fail(`Missing ${key} in .env`)
  const val = m[1]
  if (val.includes('YOUR-') || val.includes('PASTE_')) {
    fail(`${key} still has a placeholder value. Replace it with your real Supabase value before running this script.`)
  }
}
console.log('✓ All required env vars are present and look real.')

// --- 2. Flip schema provider to postgres ---------------------------------------
console.log('\nUpdating prisma/schema.prisma to use postgres...')
let schema = readFileSync(SCHEMA_PATH, 'utf8')

if (schema.includes('provider = "sqlite"')) {
  schema = schema.replace(
    /provider\s*=\s*"sqlite"/,
    'provider = "postgres"',
  )
  // Add directUrl next to the existing url line if not already there
  if (!schema.includes('directUrl')) {
    schema = schema.replace(
      /(datasource db \{[\s\S]*?url\s*=\s*env\("DATABASE_URL"\)\s*\n)(\s*[^}]*\})/,
      `$1  directUrl = env("DIRECT_URL")\n$2`,
    )
  }
  writeFileSync(SCHEMA_PATH, schema)
  console.log('✓ Schema flipped to postgres.')
} else if (schema.includes('provider = "postgres"')) {
  console.log('✓ Schema already uses postgres.')
} else {
  fail('Could not find provider in schema.prisma')
}

// --- 3. Regenerate Prisma client ----------------------------------------------
run('bun run db:generate', 'Regenerating Prisma client for postgres')

// --- 4. Push schema to Supabase ------------------------------------------------
run('bun run db:push', 'Creating tables on Supabase (prisma db push)')

// --- 5. Run the storage SQL migration -----------------------------------------
console.log('\n→ Applying Supabase Storage bucket + RLS policies')
console.log('  NOTE: this step is manual. Open:')
console.log('  - supabase.com → your project → SQL Editor')
console.log('  - New query → paste the contents of scripts/supabase-storage.sql')
console.log('  - Run')
console.log('  Press Enter when done, or Ctrl+C to skip.')
try {
  process.stdin.resume()
  process.stdin.once('data', () => {})
} catch {
  // non-interactive shell — skip
}

// --- 6. Seed -------------------------------------------------------------------
if (existsSync(resolve('scripts/seed.ts'))) {
  run('bun run scripts/seed.ts', 'Seeding initial categories + sample products')
}

console.log('\n✅ Supabase setup complete.')
console.log('   Next: bun run dev — your app is now backed by Supabase.')
