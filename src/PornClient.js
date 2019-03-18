import cacheManager from 'cache-manager'
import redisStore from 'cache-manager-redis-store'
import HttpClient from './HttpClient'
import PornHub from './adapters/PornHub'
import RedTube from './adapters/RedTube'
import YouPorn from './adapters/YouPorn'
import SpankWire from './adapters/SpankWire'
import PornCom from './adapters/PornCom'
import Chaturbate from './adapters/Chaturbate'

// EPorner has restricted video downloads to 30 per day per guest
// import EPorner from './adapters/EPorner'

const ID = 'porn_id'
const CACHE_PREFIX = 'stremio-porn|'
// Making multiple requests to multiple adapters for different types
// and then aggregating them is a lot of work,
// so we only support 1 adapter per request for now.
const ADAPTERS = [PornHub, RedTube, YouPorn, SpankWire, PornCom, Chaturbate]
const CATALOGS = ADAPTERS.map(({ name, DISPLAY_NAME, SUPPORTED_TYPES, GENRES }) => {
  return SUPPORTED_TYPES.map((type) => ({
    type,
    id: makePornId(name, type, 'top'),
    name: `Porn: ${DISPLAY_NAME}`,
    genres: GENRES,
    extra: [{ name: 'search' }, { name: 'genre' }],
  }))
}).reduce((a, b) => a.concat(b), [])

function makePornId(adapter, type, id) {
  return `${ID}:${adapter}-${type}-${id}`
}

function parsePornId(pornId) {
  let [adapter, type, id] = pornId.split(':').pop().split('-')
  return { adapter, type, id }
}

function normalizeResult(adapter, item) {
  let newItem = { ...item }
  if (item.id) {
    newItem.id = makePornId(adapter.constructor.name, item.type, item.id)
  }
  return newItem
}

class PornClient {
  static ID = ID
  static ADAPTERS = ADAPTERS
  static CATALOGS = CATALOGS

  constructor(options) {
    let httpClient = new HttpClient(options)
    this.adapters = ADAPTERS.map((Adapter) => new Adapter(httpClient))

    if (options.cache === '1') {
      this.cache = cacheManager.caching({ store: 'memory' })
    } else if (options.cache && options.cache !== '0') {
      this.cache = cacheManager.caching({
        store: redisStore,
        url: options.cache,
      })
    }
  }

  _getAdapterForRequest(adapterName, type) {
    let matchingAdapters = this.adapters

    matchingAdapters = matchingAdapters.filter((adapter) => {
      return adapterName === adapter.constructor.name
    })

    if (type) {
      matchingAdapters = matchingAdapters.filter((adapter) => {
        return adapter.constructor.SUPPORTED_TYPES.includes(type)
      })
    }

    return matchingAdapters[0]
  }

  async _invokeAdapterMethod(adapter, method, request) {
    let results = await adapter[method](request)
    return results.map((result) => {
      return normalizeResult(adapter, result)
    })
  }

  // Aggregate method that dispatches requests to matching adapters
  async _retrieveResource(resourceName, args) {
    let { adapter, id } = parsePornId(args.id)
    let request = {
      query: { type: args.type, id },
    }
    if (!isNaN(args.extra.skip)) {
      request.skip = parseInt(args.extra.skip, 10)
    }
    if (args.extra.search) {
      request.query.search = args.extra.search
    }
    if (args.extra.genre) {
      request.query.genre = args.extra.genre
    }

    let adapterImpl = this._getAdapterForRequest(adapter, args.type)
    if (!adapterImpl) {
      throw new Error('Couldn\'t find suitable adapters for a request')
    }
    if (resourceName === 'catalog') {
      return { metas: await this._invokeAdapterMethod(adapterImpl, 'find', request), cacheMaxAge: 3600 }
    } else if (resourceName === 'meta') {
      return { meta: (await this._invokeAdapterMethod(adapterImpl, 'getItem', request))[0], cacheMaxAge: 300 }
    } else if (resourceName === 'stream') {
      return { streams: await this._invokeAdapterMethod(adapterImpl, 'getStreams', request), cacheMaxAge: 300 }
    } else {
      throw new Error(`Invalid resourceName: ${resourceName}`)
    }
  }

  // This is a public wrapper around the private method
  // that implements caching and result normalization
  async invokeResource(resourceName, args) {
    let invokeResource = async () => {
      return this._retrieveResource(resourceName, args)
    }

    if (this.cache) {
      let cacheTtl = resourceName == 'catalog' ? 3600 : 300
      let cacheKey = CACHE_PREFIX + JSON.stringify({ resourceName, args })
      let cacheOptions = {
        ttl: cacheTtl,
      }
      return this.cache.wrap(cacheKey, invokeResource, cacheOptions)
    } else {
      return invokeResource()
    }
  }
}


export default PornClient
