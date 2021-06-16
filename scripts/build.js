#!/usr/bin/env node

import { readFile, writeFile, readdir, copyFile, rm, mkdir } from 'fs/promises'
import { extname, join } from 'path'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import ParcelCore from '@parcel/core'
import crypto from 'crypto'
import zlib from 'zlib'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const DIST = join(ROOT, 'dist')
const SRC = join(ROOT, 'src')

let gzip = promisify(zlib.gzip)
let Parcel = ParcelCore.default

function sha256(string) {
  return crypto.createHash('sha256').update(string, 'utf8').digest('base64')
}

async function cleanBuildDir() {
  await rm(DIST, { recursive: true, force: true })
  await mkdir(DIST)
}

async function buildAssets() {
  let bundler = new Parcel({
    entries: join(SRC, 'index.pug'),
    shouldPatchConsole: false,
    defaultConfig: join(ROOT, 'node_modules', '@parcel', 'config-default'),
    mode: 'production',
    defaultTargetOptions: {
      sourceMaps: false
    }
  })
  await bundler.run()
}

async function copyFiles() {
  await Promise.all([
    copyFile(join(SRC, 'base', 'favicon.ico'), join(DIST, 'favicon.ico'))
  ])
}

async function updateCSP() {
  let htmlFile = join(DIST, 'index.html')
  let nginxFile = join(ROOT, 'nginx.conf')
  let [html, nginx] = await Promise.all([
    readFile(htmlFile),
    readFile(nginxFile)
  ])
  let css = html.toString().match(/<style>([\W\w]*)<\/style>/m)[1]
  nginx = nginx
    .toString()
    .replace(/(style-src 'sha256-)[^']+'/g, `$1${sha256(css)}'`)
  await writeFile(nginxFile, nginx)
}

async function compressAssets() {
  let uncompressable = { '.png': true, '.woff2': true }
  let files = await readdir(DIST)
  await Promise.all(
    files
      .map(i => join(DIST, i))
      .concat([join(DIST, 'favicon.ico')])
      .filter(i => !uncompressable[extname(i)])
      .map(async path => {
        let file = await readFile(path)
        let compressed = await gzip(file, { level: 9 })
        await writeFile(path + '.gz', compressed)
      })
  )
}

async function build() {
  await cleanBuildDir()
  await buildAssets()
  await Promise.all([updateCSP(), copyFiles()])
  await compressAssets()
}

build().catch(e => {
  if (typeof e === 'string') {
    process.stderr.write(e + '\n')
  } else {
    process.stderr.write(e.stack + '\n')
  }
  process.exit(1)
})
