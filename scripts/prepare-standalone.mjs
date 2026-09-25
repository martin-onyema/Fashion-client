#!/usr/bin/env node
/**
 * Post-build step for standalone deployments (Docker / Aliyun FC).
 *
 * `next build` with output:"standalone" produces .next/standalone with a
 * minimal server.js, but it does NOT copy the static assets, public files
 * or environment template. This script finishes the bundle:
 *
 *   1. .next/static        -> .next/standalone/.next/static
 *   2. public/             -> .next/standalone/public
 *   3. .env.production     -> .next/standalone/.env.production (if present)
 *
 * Every step is guarded: a missing source only warns, never fails the
 * build. Run automatically via "npm run build" (see package.json).
 * Vercel deployments ignore this (no standalone output needed there).
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const STANDALONE = path.join(ROOT, '.next', 'standalone')

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[prepare-standalone] skip (missing): ${path.relative(ROOT, src)}`)
    return
  }
  fs.cpSync(src, dest, { recursive: true, force: true })
  console.log(`[prepare-standalone] copied dir -> ${path.relative(ROOT, dest)}`)
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[prepare-standalone] skip (missing): ${path.relative(ROOT, src)}`)
    return
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.cpSync(src, dest)
  console.log(`[prepare-standalone] copied file -> ${path.relative(ROOT, dest)}`)
}

if (!fs.existsSync(STANDALONE)) {
  console.warn('[prepare-standalone] .next/standalone not found — nothing to do (Vercel build?)')
  process.exit(0)
}

copyDir(path.join(ROOT, '.next', 'static'), path.join(STANDALONE, '.next', 'static'))
copyDir(path.join(ROOT, 'public'), path.join(STANDALONE, 'public'))
copyFile(path.join(ROOT, '.env.production'), path.join(STANDALONE, '.env.production'))

console.log('[prepare-standalone] done ✔')
