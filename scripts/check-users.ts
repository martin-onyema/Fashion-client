/**
 * Quick diagnostic: list every User row to see emails, roles, and whether
 * they have a passwordHash. Helps diagnose "any password lets me sign in".
 */
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      passwordHash: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })
  console.log(`Total users: ${users.length}\n`)
  for (const u of users) {
    console.log(`— ${u.email}`)
    console.log(`    id=${u.id}  role=${u.role}  active=${u.active}`)
    console.log(`    name=${u.name ?? '<none>'}  lastLoginAt=${u.lastLoginAt ?? '<never>'}`)
    console.log(`    passwordHash=${u.passwordHash ? u.passwordHash.slice(0, 18) + '...' + ' (len=' + u.passwordHash.length + ')' : 'NULL'}`)
  }
}
main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
