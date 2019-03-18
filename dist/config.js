"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const DEFAULT_ID = 'stremio_porn';

class Config {}

_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(Config, "DEFAULT_ID", DEFAULT_ID), "STATIC_DIR", 'static'), "DEFAULT_ID", 'stremio_porn'), "ID", process.env.STREMIO_PORN_ID || DEFAULT_ID), "ENDPOINT", process.env.STREMIO_PORN_ENDPOINT || 'https://stremio-porn.ga'), "IS_PROD", process.env.NODE_ENV === 'production'), "PORT", process.env.STREMIO_PORN_PORT || process.env.PORT || '80'), "EMAIL", process.env.STREMIO_PORN_EMAIL || process.env.EMAIL), "PROXY", process.env.STREMIO_PORN_PROXY || process.env.HTTPS_PROXY), "CACHE", process.env.STREMIO_PORN_CACHE || process.env.REDIS_URL || '1'), "ENDPOINT", process.env.STREMIO_PORN_ENDPOINT || 'https://stremio-porn.ga'), "PROXY", process.env.STREMIO_PORN_PROXY || process.env.HTTPS_PROXY), "CACHE", process.env.STREMIO_PORN_CACHE || process.env.REDIS_URL || '1'), "EMAIL", process.env.STREMIO_PORN_EMAIL || process.env.EMAIL);

var _default = Config;
exports.default = _default;
//# sourceMappingURL=config.js.map