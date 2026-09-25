/**
 * Check the PRODUCTION (Supabase postgres) admin user + verify the password.
 * Run AFTER regenerating the prisma client for the postgres schema:
 *   bunx prisma generate --schema=prisma/schema.prisma
 *   DATABASE_URL="..." bun scripts/check-users-prod.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const users = await db.user.findMany({
    select: {
      id: true, email: true, name: true, role: true,
      active: true, passwordHash: true, lastLoginAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })
  console.log(`Total users in PRODUCTION db: ${users.length}\n`)
  for (const u of users) {
    console.log(`— ${u.email}`)
    console.log(`    role=${u.role}  active=${u.active}  lastLoginAt=${u.lastLoginAt ?? '<never>'}`)
    console.log(`    passwordHash=${u.passwordHash ? u.passwordHash.slice(0, 14) + '... (len=' + u.passwordHash.length + ')' : 'NULL'}`)
  }

  const admin = users.find((u) => u.role === 'ADMIN' || u.email === 'admin@wardrobecare.com')
  if (!admin) {
    console.log('\n!! NO ADMIN USER FOUND in production database')
  } else if (!admin.passwordHash) {
    console.log('\n!! Admin exists but passwordHash is NULL')
  } else {
    const ok = await bcrypt.compare('wardrobecare2026', admin.passwordHash)
    console.log(`\nPassword "wardrobecare2026" matches admin hash: ${ok ? 'YES — credentials are correct' : 'NO — password differs'}`)
  }
}

main()
  .catch((e) => { console.error('QUERY FAILED:', e.message); process.exit(1) })
  .finally(() => db.$disconnect())
