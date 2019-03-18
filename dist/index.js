"use strict";

var _stremioAddonSdk = require("stremio-addon-sdk");

var _serveStatic = _interopRequireDefault(require("serve-static"));

var _chalk = _interopRequireDefault(require("chalk"));

var _package = _interopRequireDefault(require("../package.json"));

var _PornClient = _interopRequireDefault(require("./PornClient"));

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

// @TODO adapt methods (stream.find, meta.find, ...)
// @TODO serveStatic not needed
// @TODO search
// @TODO landing
let availableSites = _PornClient.default.ADAPTERS.map(a => a.DISPLAY_NAME).join(', ');

const MANIFEST = {
  name: 'Porn+',
  id: _config.default.ID,
  version: _package.default.version,
  description: `\
Time to unsheathe your sword! \
Watch porn videos and webcam streams from ${availableSites}\
`,
  resources: ['catalog', 'meta', 'stream'],
  types: ['movie', 'tv'],
  idPrefixes: [_PornClient.default.ID],
  catalogs: _PornClient.default.CATALOGS,
  contactEmail: _config.default.EMAIL,
  logo: `${_config.default.ENDPOINT}/logo.png`,
  icon: `${_config.default.ENDPOINT}/logo.png`,
  background: `${_config.default.ENDPOINT}/bg.jpg`,
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
  proxy: _config.default.PROXY,
  cache: _config.default.CACHE
});
let addon = new _stremioAddonSdk.addonBuilder(MANIFEST).defineCatalogHandler(makeResourceHandler(client, 'catalog')).defineMetaHandler(makeResourceHandler(client, 'meta')).defineStreamHandler(makeResourceHandler(client, 'stream')).getInterface();
let middleware = (0, _stremioAddonSdk.getRouter)(addon);

const httpHandler = (req, res) => {
  (0, _serveStatic.default)(_config.default.STATIC_DIR)(req, res, () => {
    middleware(req, res, () => res.end());
  });
};

module.exports = httpHandler;
//# sourceMappingURL=index.js.map