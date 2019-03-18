"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _http = _interopRequireDefault(require("http"));

var _stremioAddonSdk = require("stremio-addon-sdk");

var _serveStatic = _interopRequireDefault(require("serve-static"));

var _chalk = _interopRequireDefault(require("chalk"));

var _package = _interopRequireDefault(require("../package.json"));

var _PornClient = _interopRequireDefault(require("./PornClient"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

// @TODO adapt methods (stream.find, meta.find, ...)
// @TODO serveStatic not needed
// @TODO search
// @TODO landing
const STATIC_DIR = 'static';
const DEFAULT_ID = 'stremio_porn';
const ID = process.env.STREMIO_PORN_ID || DEFAULT_ID;
const ENDPOINT = process.env.STREMIO_PORN_ENDPOINT || 'https://stremio-porn.now.sh';
const PORT = process.env.STREMIO_PORN_PORT || process.env.PORT || '80';
const PROXY = process.env.STREMIO_PORN_PROXY || process.env.HTTPS_PROXY;
const CACHE = process.env.STREMIO_PORN_CACHE || process.env.REDIS_URL || '1';
const EMAIL = process.env.STREMIO_PORN_EMAIL || process.env.EMAIL;
const IS_PROD = process.env.NODE_ENV === 'production';

if (IS_PROD && ID === DEFAULT_ID) {
  // eslint-disable-next-line no-console
  console.error(_chalk.default.red('\nWhen running in production, a non-default addon identifier must be specified\n'));
  process.exit(1);
}

let availableSites = _PornClient.default.ADAPTERS.map(a => a.DISPLAY_NAME).join(', ');

const MANIFEST = {
  name: 'Porn+',
  id: ID,
  version: _package.default.version,
  description: `\
Time to unsheathe your sword! \
Watch porn videos and webcam streams from ${availableSites}\
`,
  resources: ['catalog', 'meta', 'stream'],
  types: ['movie', 'tv'],
  idPrefixes: [_PornClient.default.ID],
  catalogs: _PornClient.default.CATALOGS,
  contactEmail: EMAIL,
  logo: `${ENDPOINT}/logo.png`,
  icon: `${ENDPOINT}/logo.png`,
  background: `${ENDPOINT}/bg.jpg`,
  behaviorHints: {
    adult: true
  }
};

function makeResourceHandler(client, resourceName) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(function* (args) {
        try {
          let response = yield client.invokeResource(resourceName, args);
          return response;
        } catch (err) {
          /* eslint-disable no-console */
          console.error( // eslint-disable-next-line prefer-template
          _chalk.default.gray(new Date().toLocaleString()) + ' An error has occurred while processing ' + `the following request to ${resourceName}:`);
          console.error(args);
          console.error(err);
          /* eslint-enable no-console */

          throw err;
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}

let client = new _PornClient.default({
  proxy: PROXY,
  cache: CACHE
});
let addon = new _stremioAddonSdk.addonBuilder(MANIFEST).defineCatalogHandler(makeResourceHandler(client, 'catalog')).defineMetaHandler(makeResourceHandler(client, 'meta')).defineStreamHandler(makeResourceHandler(client, 'stream')).getInterface();
let middleware = (0, _stremioAddonSdk.getRouter)(addon);

let server = _http.default.createServer((req, res) => {
  (0, _serveStatic.default)(STATIC_DIR)(req, res, () => {
    middleware(req, res, () => res.end());
  });
});

if (IS_PROD) {
  /* eslint-disable no-console */
  console.log(_chalk.default.green(`Publishing to Stremio central: ${ENDPOINT}/manifest.json`));
  (0, _stremioAddonSdk.publishToCentral)(`${ENDPOINT}/manifest.json`);
}

server.on('listening', () => {
  let values = {
    endpoint: _chalk.default.green(`${ENDPOINT}/manifest.json`),
    id: ID === DEFAULT_ID ? _chalk.default.red(ID) : _chalk.default.green(ID),
    email: EMAIL ? _chalk.default.green(EMAIL) : _chalk.default.red('undefined'),
    env: IS_PROD ? _chalk.default.green('production') : _chalk.default.green('development'),
    proxy: PROXY ? _chalk.default.green(PROXY) : _chalk.default.red('off'),
    cache: CACHE === '0' ? _chalk.default.red('off') : _chalk.default.green(CACHE === '1' ? 'on' : CACHE) // eslint-disable-next-line no-console

  };
  console.log(`
    ${MANIFEST.name} Addon is listening on port ${PORT}

    Endpoint:    ${values.endpoint}
    Addon Id:    ${values.id}
    Email:       ${values.email}
    Environment: ${values.env}
    Proxy:       ${values.proxy}
    Cache:       ${values.cache}
    `);
}).listen(PORT);
var _default = server;
exports.default = _default;
//# sourceMappingURL=index.js.map