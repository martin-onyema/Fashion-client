/**
 * Test that bcrypt comparison correctly rejects wrong passwords
 * for all existing users in the database.
 *
 * If any wrong password "matches", we have a real auth bypass bug.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const db = new PrismaClient()

async function main() {
  const users = await db.user.findMany({
    select: { email: true, passwordHash: true, role: true },
  })
  console.log(`Testing ${users.length} user hashes\n`)

  // Candidate passwords to try (both the seeded correct one and various wrong ones)
  const candidates = [
    'wardrobecare2026', // expected correct
    'wrongpassword',
    'password',
    'admin',
    '12345678',
    '',
    'randomstring',
    'test',
  ]

  for (const u of users) {
    if (!u.passwordHash) {
      console.log(`⚠ ${u.email} — no passwordHash`)
      continue
    }
    console.log(`User: ${u.email} (${u.role})`)
    for (const c of candidates) {
      const ok = await bcrypt.compare(c, u.passwordHash)
      const marker = ok ? '✓ MATCH' : '  reject'
      console.log(`    [${marker}] password="${c}"`)
    }
    console.log()
  }
}
main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
