import http from 'http'
import { addonBuilder as AddonBuilder, getRouter, publishToCentral } from 'stremio-addon-sdk'
import serveStatic from 'serve-static'
import chalk from 'chalk'
import pkg from '../package.json'
import PornClient from './PornClient'

// @TODO adapt methods (stream.find, meta.find, ...)
// @TODO serveStatic not needed
// @TODO search
// @TODO landing

const STATIC_DIR = 'static'
const DEFAULT_ID = 'stremio_porn'

const ID = process.env.STREMIO_PORN_ID || DEFAULT_ID
const ENDPOINT = process.env.STREMIO_PORN_ENDPOINT || 'https://stremio-porn.now.sh'
const PORT = process.env.STREMIO_PORN_PORT || process.env.PORT || '80'
const PROXY = process.env.STREMIO_PORN_PROXY || process.env.HTTPS_PROXY
const CACHE = process.env.STREMIO_PORN_CACHE || process.env.REDIS_URL || '1'
const EMAIL = process.env.STREMIO_PORN_EMAIL || process.env.EMAIL
const IS_PROD = process.env.NODE_ENV === 'production'


if (IS_PROD && ID === DEFAULT_ID) {
  // eslint-disable-next-line no-console
  console.error(
    chalk.red(
      '\nWhen running in production, a non-default addon identifier must be specified\n'
    )
  )
  process.exit(1)
}

let availableSites = PornClient.ADAPTERS.map((a) => a.DISPLAY_NAME).join(', ')

const MANIFEST = {
  name: 'Porn+',
  id: ID,
  version: pkg.version,
  description: `\
Time to unsheathe your sword! \
Watch porn videos and webcam streams from ${availableSites}\
`,
  resources: ['catalog', 'meta', 'stream'],
  types: ['movie', 'tv'],
  idPrefixes: [PornClient.ID],
  catalogs: PornClient.CATALOGS,
  contactEmail: EMAIL,
  logo: `${ENDPOINT}/logo.png`,
  icon: `${ENDPOINT}/logo.png`,
  background: `${ENDPOINT}/bg.jpg`,
  behaviorHints: { adult: true },
}

function makeResourceHandler(client, resourceName) {
  return async (args) => {
    try {
      let response = await client.invokeResource(resourceName, args)
      return response
    } catch (err) {
      /* eslint-disable no-console */
      console.error(
        // eslint-disable-next-line prefer-template
        chalk.gray(new Date().toLocaleString()) +
        ' An error has occurred while processing ' +
        `the following request to ${resourceName}:`
      )
      console.error(args)
      console.error(err)
      /* eslint-enable no-console */
      throw err
    }
  }
}

let client = new PornClient({ proxy: PROXY, cache: CACHE })
let addon = new AddonBuilder(MANIFEST)
  .defineCatalogHandler(makeResourceHandler(client, 'catalog'))
  .defineMetaHandler(makeResourceHandler(client, 'meta'))
  .defineStreamHandler(makeResourceHandler(client, 'stream'))
  .getInterface()
let middleware = getRouter(addon)
let server = http.createServer((req, res) => {
  serveStatic(STATIC_DIR)(req, res, () => {
    middleware(req, res, () => res.end())
  })
})
if (IS_PROD) {
  /* eslint-disable no-console */
  console.log(
    chalk.green(`Publishing to Stremio central: ${ENDPOINT}/manifest.json`)
  )
  publishToCentral(`${ENDPOINT}/manifest.json`)
}

server
  .on('listening', () => {
    let values = {
      endpoint: chalk.green(`${ENDPOINT}/manifest.json`),
      id: ID === DEFAULT_ID ? chalk.red(ID) : chalk.green(ID),
      email: EMAIL ? chalk.green(EMAIL) : chalk.red('undefined'),
      env: IS_PROD ? chalk.green('production') : chalk.green('development'),
      proxy: PROXY ? chalk.green(PROXY) : chalk.red('off'),
      cache: (CACHE === '0') ?
        chalk.red('off') :
        chalk.green(CACHE === '1' ? 'on' : CACHE),
    }

    // eslint-disable-next-line no-console
    console.log(`
    ${MANIFEST.name} Addon is listening on port ${PORT}

    Endpoint:    ${values.endpoint}
    Addon Id:    ${values.id}
    Email:       ${values.email}
    Environment: ${values.env}
    Proxy:       ${values.proxy}
    Cache:       ${values.cache}
    `)
  })
  .listen(PORT)


export default server
