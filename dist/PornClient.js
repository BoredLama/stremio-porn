"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cacheManager = _interopRequireDefault(require("cache-manager"));

var _cacheManagerRedisStore = _interopRequireDefault(require("cache-manager-redis-store"));

var _HttpClient = _interopRequireDefault(require("./HttpClient"));

var _PornHub = _interopRequireDefault(require("./adapters/PornHub"));

var _RedTube = _interopRequireDefault(require("./adapters/RedTube"));

var _YouPorn = _interopRequireDefault(require("./adapters/YouPorn"));

var _SpankWire = _interopRequireDefault(require("./adapters/SpankWire"));

var _PornCom = _interopRequireDefault(require("./adapters/PornCom"));

var _Chaturbate = _interopRequireDefault(require("./adapters/Chaturbate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// EPorner has restricted video downloads to 30 per day per guest
// import EPorner from './adapters/EPorner'
const ID = 'porn_id';
const CACHE_PREFIX = 'stremio-porn|'; // Making multiple requests to multiple adapters for different types
// and then aggregating them is a lot of work,
// so we only support 1 adapter per request for now.

const ADAPTERS = [_RedTube.default, _SpankWire.default, _Chaturbate.default];
const CATALOGS = ADAPTERS.map(({
  name,
  DISPLAY_NAME,
  SUPPORTED_TYPES,
  GENRES
}) => {
  return SUPPORTED_TYPES.map(type => ({
    type,
    id: makePornId(name, type, 'top'),
    name: `Porn: ${DISPLAY_NAME}`,
    genres: GENRES,
    extra: [{
      name: 'search'
    }, {
      name: 'genre'
    }]
  }));
}).reduce((a, b) => a.concat(b), []);

function makePornId(adapter, type, id) {
  return `${ID}:${adapter}-${type}-${id}`;
}

function parsePornId(pornId) {
  let [adapter, type, id] = pornId.split(':').pop().split('-');
  return {
    adapter,
    type,
    id
  };
}

function normalizeResult(adapter, item) {
  let newItem = _objectSpread({}, item);

  if (item.id) {
    newItem.id = makePornId(adapter.constructor.name, item.type, item.id);
  }

  return newItem;
}

class PornClient {
  constructor(options) {
    let httpClient = new _HttpClient.default(options);
    this.adapters = ADAPTERS.map(Adapter => new Adapter(httpClient));

    if (options.cache === '1') {
      this.cache = _cacheManager.default.caching({
        store: 'memory'
      });
    } else if (options.cache && options.cache !== '0') {
      this.cache = _cacheManager.default.caching({
        store: _cacheManagerRedisStore.default,
        url: options.cache
      });
    }
  }

  _getAdapterForRequest(adapterName, type) {
    let matchingAdapters = this.adapters;
    matchingAdapters = matchingAdapters.filter(adapter => {
      return adapterName === adapter.constructor.name;
    });

    if (type) {
      matchingAdapters = matchingAdapters.filter(adapter => {
        return adapter.constructor.SUPPORTED_TYPES.includes(type);
      });
    }

    return matchingAdapters[0];
  }

  _invokeAdapterMethod(adapter, method, request) {
    return _asyncToGenerator(function* () {
      let results = yield adapter[method](request);
      return results.map(result => {
        return normalizeResult(adapter, result);
      });
    })();
  } // Aggregate method that dispatches requests to matching adapters


  _retrieveResource(resourceName, args) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let {
        adapter,
        id
      } = parsePornId(args.id);
      let request = {
        query: {
          type: args.type,
          id
        }
      };

      if (!isNaN(args.extra.skip)) {
        request.skip = parseInt(args.extra.skip, 10);
      }

      if (args.extra.search) {
        request.query.search = args.extra.search;
      }

      if (args.extra.genre) {
        request.query.genre = args.extra.genre;
      }

      let adapterImpl = _this._getAdapterForRequest(adapter, args.type);

      if (!adapterImpl) {
        throw new Error('Couldn\'t find suitable adapters for a request');
      }

      if (resourceName === 'catalog') {
        return {
          metas: yield _this._invokeAdapterMethod(adapterImpl, 'find', _objectSpread({
            limit: 100
          }, request)),
          cacheMaxAge: 3600
        };
      } else if (resourceName === 'meta') {
        return {
          meta: (yield _this._invokeAdapterMethod(adapterImpl, 'getItem', request))[0],
          cacheMaxAge: 300
        };
      } else if (resourceName === 'stream') {
        return {
          streams: yield _this._invokeAdapterMethod(adapterImpl, 'getStreams', request),
          cacheMaxAge: 300
        };
      } else {
        throw new Error(`Invalid resourceName: ${resourceName}`);
      }
    })();
  } // This is a public wrapper around the private method
  // that implements caching and result normalization


  invokeResource(resourceName, args) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let invokeResource =
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* () {
          return _this2._retrieveResource(resourceName, args);
        });

        return function invokeResource() {
          return _ref.apply(this, arguments);
        };
      }();

      if (_this2.cache) {
        let cacheTtl = resourceName == 'catalog' ? 3600 : 300;
        let cacheKey = CACHE_PREFIX + JSON.stringify({
          resourceName,
          args
        });
        let cacheOptions = {
          ttl: cacheTtl
        };
        return _this2.cache.wrap(cacheKey, invokeResource, cacheOptions);
      } else {
        return invokeResource();
      }
    })();
  }

}

_defineProperty(_defineProperty(_defineProperty(PornClient, "ID", ID), "ADAPTERS", ADAPTERS), "CATALOGS", CATALOGS);

var _default = PornClient;
exports.default = _default;
//# sourceMappingURL=PornClient.js.map