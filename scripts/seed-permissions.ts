/**
 * Seed the permissions catalogue + assign default permissions to each role.
 *
 * Run:  bun run scripts/seed-permissions.ts
 *
 * Idempotent: upserts permissions by code, clears and re-syncs role grants.
 */
import { PrismaClient, Role } from '@prisma/client'
import { PERMISSIONS } from '../src/lib/permissions'

const db = new PrismaClient()

async function main() {
  console.log('Seeding permissions catalogue...')

  // 1. Upsert all permissions
  for (const p of PERMISSIONS) {
    await db.permission.upsert({
      where: { code: p.code },
      update: { name: p.name, description: p.name },
      create: { code: p.code, name: p.name, description: p.name },
    })
  }
  console.log(`✓ ${PERMISSIONS.length} permissions upserted`)

  // 2. For each role, clear existing grants and re-create based on PERMISSIONS list
  const allRoles: Role[] = [
    'ADMIN',
    'MANAGER',
    'SALES',
    'INVENTORY_MANAGER',
    'CUSTOMER_SUPPORT',
    'CONTENT_MANAGER',
  ]

  // Build a code→id lookup
  const codeToId = new Map<string, string>()
  for (const p of PERMISSIONS) {
    const row = await db.permission.findUnique({ where: { code: p.code } })
    if (row) codeToId.set(p.code, row.id)
  }

  let grants = 0
  for (const role of allRoles) {
    // Clear existing grants for this role
    await db.rolePermission.deleteMany({ where: { role } })

    const inserts = []
    for (const p of PERMISSIONS) {
      if (p.roles.includes(role as any)) {
        inserts.push({
          role,
          permissionId: codeToId.get(p.code)!,
          granted: true,
        })
      }
    }
    // createMany — no skipDuplicates on SQLite; we already cleared above so no duplicates
    await db.rolePermission.createMany({ data: inserts })
    grants += inserts.length
  }
  console.log(`✓ ${grants} role-permission grants created`)

  // 3. Summary
  const counts = await db.rolePermission.groupBy({
    by: ['role'],
    _count: true,
  })
  console.log('\n=== PERMISSIONS BY ROLE ===')
  for (const c of counts) {
    console.log(`  ${c.role.padEnd(20)}: ${c._count} permissions`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
