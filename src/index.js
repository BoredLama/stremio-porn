import { addonBuilder as AddonBuilder, getRouter, publishToCentral } from 'stremio-addon-sdk'
import serveStatic from 'serve-static'
import chalk from 'chalk'
import pkg from '../package.json'
import PornClient from './PornClient'
import Config from './config'

// @TODO adapt methods (stream.find, meta.find, ...)
// @TODO serveStatic not needed
// @TODO search
// @TODO landing

let availableSites = PornClient.ADAPTERS.map((a) => a.DISPLAY_NAME).join(', ')

const MANIFEST = {
  name: 'Porn+',
  id: Config.ID,
  version: pkg.version,
  description: `\
Time to unsheathe your sword! \
Watch porn videos and webcam streams from ${availableSites}\
`,
  resources: ['catalog', 'meta', 'stream'],
  types: ['movie', 'tv'],
  idPrefixes: [PornClient.ID],
  catalogs: PornClient.CATALOGS,
  contactEmail: Config.EMAIL,
  logo: `${Config.ENDPOINT}/logo.png`,
  icon: `${Config.ENDPOINT}/logo.png`,
  background: `${Config.ENDPOINT}/bg.jpg`,
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

let client = new PornClient({ proxy: Config.PROXY, cache: Config.CACHE })
let addon = new AddonBuilder(MANIFEST)
  .defineCatalogHandler(makeResourceHandler(client, 'catalog'))
  .defineMetaHandler(makeResourceHandler(client, 'meta'))
  .defineStreamHandler(makeResourceHandler(client, 'stream'))
  .getInterface()
let middleware = getRouter(addon)

const httpHandler = (req, res) => {
  serveStatic(Config.STATIC_DIR)(req, res, () => {
    middleware(req, res, () => res.end())
  })
}

module.exports = httpHandler
