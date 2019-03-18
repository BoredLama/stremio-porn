"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _http = _interopRequireDefault(require("http"));

var _chalk = _interopRequireDefault(require("chalk"));

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const httpHandler = require('./index.js');

let server = _http.default.createServer(httpHandler);

if (_config.default.IS_PROD && _config.default.ID === _config.default.DEFAULT_ID) {
  // eslint-disable-next-line no-console
  console.error(_chalk.default.red('\nWhen running in production, a non-default addon identifier must be specified\n'));
  process.exit(1);
}

if (_config.default.IS_PROD) {
  /* eslint-disable no-console */
  console.log(_chalk.default.green(`Publishing to Stremio central: ${_config.default.ENDPOINT}/manifest.json`));
  publishToCentral(`${_config.default.ENDPOINT}/manifest.json`);
}

server.on('listening', () => {
  let values = {
    endpoint: _chalk.default.green(`${_config.default.ENDPOINT}/manifest.json`),
    id: _config.default.ID === _config.default.DEFAULT_ID ? _chalk.default.red(_config.default.ID) : _chalk.default.green(_config.default.ID),
    email: _config.default.EMAIL ? _chalk.default.green(_config.default.EMAIL) : _chalk.default.red('undefined'),
    env: _config.default.IS_PROD ? _chalk.default.green('production') : _chalk.default.green('development'),
    proxy: _config.default.PROXY ? _chalk.default.green(_config.default.PROXY) : _chalk.default.red('off'),
    cache: _config.default.CACHE === '0' ? _chalk.default.red('off') : _chalk.default.green(_config.default.CACHE === '1' ? 'on' : _config.default.CACHE) // eslint-disable-next-line no-console

  };
  console.log(`Porn Addon is listening on port ${_config.default.PORT}

    Endpoint:    ${values.endpoint}
    Addon Id:    ${values.id}
    Email:       ${values.email}
    Environment: ${values.env}
    Proxy:       ${values.proxy}
    Cache:       ${values.cache}
    `);
}).listen(_config.default.PORT);
var _default = server;
exports.default = _default;
//# sourceMappingURL=server.js.map