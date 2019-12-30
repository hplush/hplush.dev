#!/usr/bin/env node

import { existsSync, promises as fs } from 'fs'
import { extname, join } from 'path'
import { promisify } from 'util'
import combineMedia from 'postcss-combine-media-query'
import Bundler from 'parcel-bundler'
import postcss from 'postcss'
import crypto from 'crypto'
import zlib from 'zlib'
import del from 'del'

import { ROOT, SRC, DIST } from './lib/dirs.js'

let gzip = promisify(zlib.gzip)

function findAssets (bundle) {
  return Array.from(bundle.childBundles).reduce((all, i) => {
    return all.concat(findAssets(i))
  }, [bundle.name])
}

function sha256 (string) {
  return crypto.createHash('sha256').update(string, 'utf8').digest('base64')
}

async function cleanBuildDir () {
  await del(join(DIST, '*'), { dot: true })
}

async function buildAssets () {
  let bundler = new Bundler(join(SRC, 'index.pug'), { sourceMaps: false })
  let bundle = await bundler.bundle()
  return findAssets(bundle)
}

async function copyFiles () {
  await Promise.all([
    fs.copyFile(join(SRC, 'base', 'favicon.ico'), join(DIST, 'favicon.ico'))
  ])
}

async function injectCSS (assets) {
  let cssFile = assets.find(i => extname(i) === '.css')
  let htmlFile = assets.find(i => extname(i) === '.html')
  let nginxFile = join(ROOT, 'scripts', 'deploy', 'nginx.conf')
  let [css, html, nginx] = await Promise.all([
    fs.readFile(cssFile),
    fs.readFile(htmlFile),
    fs.readFile(nginxFile)
  ])
  let compressed = postcss([combineMedia]).process(css).css
  let injected = html.toString().replace(
    /<link rel="stylesheet" href="[^"]+">/,
    `<style>${ compressed }</style>`
  )
  nginx = nginx.toString().replace(
    /(style-src 'sha256-)[^']+'/g, `$1${ sha256(compressed) }'`
  )
  await Promise.all([
    fs.writeFile(htmlFile, injected),
    fs.writeFile(nginxFile, nginx),
    fs.unlink(cssFile)
  ])
  return injected
}

async function compressAssets (assets, html) {
  let uncompressable = { '.png': true, '.woff2': true }
  await Promise.all(assets
    .concat([join(DIST, 'favicon.ico')])
    .filter(i => !uncompressable[extname(i)])
    .filter(i => existsSync(i))
    .map(async path => {
      let file
      if (extname(path) === '.html') {
        file = html
      } else {
        file = await fs.readFile(path)
      }
      let compressed = await gzip(file, { level: 9 })
      await fs.writeFile(path + '.gz', compressed)
    })
  )
}

async function build () {
  await cleanBuildDir()
  let assets = await buildAssets()
  let [html] = await Promise.all([
    injectCSS(assets),
    copyFiles()
  ])
  await compressAssets(assets, html)
}

build().catch(e => {
  process.stderr.write(e.stack + '\n')
  process.exit(1)
})
