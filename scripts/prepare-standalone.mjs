#!/usr/bin/env node
/**
 * prepare-standalone.mjs — post-build packaging for the standalone output.
 *
 * Works on Windows, macOS and Linux (pure Node — no shell utilities), and is
 * safe to run even if pieces are missing: every step is guarded.
 *
 * What it does after `next build`:
 *   1. copies .next/static into .next/standalone/.next/static
 *   2. copies public/    into .next/standalone/public
 *   3. copies .env.production into .next/standalone/ (the standalone server
 *      loads env files from its own directory, and Vercel-style hosts ignore
 *      committed env files — self-hosted runs need this file next to server.js)
 */
import { cpSync, existsSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const sa = join(root, '.next', 'standalone')

if (!existsSync(sa)) {
  console.error('prepare-standalone: .next/standalone not found — did `next build` run with output:"standalone"?')
  process.exit(1)
}

function copy(src, dest) {
  if (!existsSync(src)) {
    console.warn(`prepare-standalone: skip (missing) ${src}`)
    return
  }
  cpSync(src, dest, { recursive: true })
  console.log(`prepare-standalone: copied ${src} -> ${dest}`)
}

copy(join(root, '.next', 'static'), join(sa, '.next', 'static'))
copy(join(root, 'public'), join(sa, 'public'))

const envProd = join(root, '.env.production')
if (existsSync(envProd)) {
  copyFileSync(envProd, join(sa, '.env.production'))
  console.log('prepare-standalone: copied .env.production into standalone/')
} else {
  console.warn('prepare-standalone: .env.production not found — self-hosted runs must provide env vars another way')
}

console.log('prepare-standalone: done')
