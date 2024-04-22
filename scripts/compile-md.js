import { readFileSync, writeFileSync } from 'fs'
import { basename  } from 'path'
import { marked } from 'marked'

let file = process.argv[2]
let name = basename(file, '.md')
let title = name[0].toUpperCase() + name.slice(1)
let md = readFileSync(file, 'utf8')
let main = marked.parse(md)

let html = `<!DOCTYPE html>
<html lang="en" itemtype="https://schema.org/Person" itemscope>
  <head>
    <meta charset="utf-8" />
    <title>${title} › h+h lab</title>
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" href="./favicon.ico" sizes="32x32" />
    <link rel="icon" href="./icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="./apple.png" />
    <link
      rel="preload"
      href="./martianmono.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <main>
      ${main.replace(/\n/g, '\n      ').trim()}
    </main>
    <a
      href="https://github.com/hplush/hplush.dev/edit/main/${file}"
      class="edit"
    >
      edit
    </a>
  </body>
</html>`

writeFileSync(`content/${name}.html`, html, 'utf8')
