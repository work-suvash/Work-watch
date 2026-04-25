#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  '.local',
  '.cache',
  'attached_assets',
  'dist',
  '.output'
])

const EXCLUDE_FILES = new Set([
  'pnpm-lock.yaml',
  'package-lock.json',
  'bun.lock',
  'rebrand.mjs'
])

const INCLUDE_EXTS = new Set([
  '.md', '.mdx',
  '.ts', '.mts', '.cts', '.tsx',
  '.js', '.mjs', '.cjs', '.jsx',
  '.vue',
  '.json', '.jsonc',
  '.yaml', '.yml',
  '.toml',
  '.html', '.htm',
  '.css', '.scss', '.sass',
  '.txt',
  '.xml',
  '.svg'
])

const EXTRA_FILES = new Set([
  'docs/public/_headers',
  'docs/public/robots.txt',
  'docs/public/key.txt',
  '.gitignore',
  '.gitattributes',
  '.prettierignore',
  '.prettierrc.yaml',
  '.npmrc',
  'Dockerfile',
  '.dockerignore',
  'flake.nix',
  '.licenserc.json',
  '.gitpod.yml',
  '.mise.toml'
])

// Protect external npm package imports we depend on.
const PLACEHOLDERS = [
  ['@fmhy/colors', '\u0001KEEP_DEP_COLORS\u0001'],
  ['@fmhy/components', '\u0001KEEP_DEP_COMPONENTS\u0001']
]

// Order matters: longest/most specific & uppercase before lowercase.
const SUBS = [
  [/FREEMEDIAHECKYEAH/g, 'WORKWATCH'],
  [/FreeMediaHeckYeah/g, 'WorkWatch'],
  [/Freemediaheckyeah/g, 'WorkWatch'],
  [/freemediaheckyeah/g, 'WorkWatch'],
  [/FMHY/g, 'WORKWATCH'],
  [/Fmhy/g, 'WorkWatch'],
  [/Fhmy/g, 'WorkWatch'],
  [/fhmY/g, 'workwatch'],
  [/fmhy/g, 'workwatch']
]

function shouldProcess(absPath) {
  const rel = path.relative(ROOT, absPath).split(path.sep).join('/')
  const parts = new Set(rel.split('/'))
  for (const ex of EXCLUDE_DIRS) if (parts.has(ex)) return false
  if (EXCLUDE_FILES.has(path.basename(absPath))) return false
  if (EXTRA_FILES.has(rel)) return true
  return INCLUDE_EXTS.has(path.extname(absPath).toLowerCase())
}

function transform(text) {
  for (const [needle, ph] of PLACEHOLDERS) text = text.split(needle).join(ph)
  for (const [pat, repl] of SUBS) text = text.replace(pat, repl)
  for (const [needle, ph] of PLACEHOLDERS) text = text.split(ph).join(needle)
  return text
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue
      yield* walk(path.join(dir, entry.name))
    } else if (entry.isFile()) {
      yield path.join(dir, entry.name)
    }
  }
}

const changed = []
for (const p of walk(ROOT)) {
  if (!shouldProcess(p)) continue
  let original
  try {
    original = fs.readFileSync(p, 'utf8')
  } catch {
    continue
  }
  const updated = transform(original)
  if (updated !== original) {
    fs.writeFileSync(p, updated)
    changed.push(path.relative(ROOT, p))
  }
}

console.log(`Rewrote ${changed.length} file(s).`)
for (const c of changed) console.log('  ' + c)
