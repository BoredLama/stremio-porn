"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _HubTrafficAdapter = _interopRequireDefault(require("./HubTrafficAdapter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const androidUA = 'Mozilla/5.0 (Linux; Android 8.0.0; TA-1053 Build/OPR1.170623.026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3368.0 Mobile Safari/537.36';

class SpankWire extends _HubTrafficAdapter.default {
  _makeMethodUrl(method) {
    return `https://www.spankwire.com/api/HubTrafficApiCall?data=${method}`;
  }

  _makeEmbedUrl(id) {
    return `https://www.spankwire.com/EmbedPlayer.aspx?ArticleId=${id}`;
  }

  _getStreams(type, id) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const fromUrl = `https://www.spankwire.com/a/video${id}/`; // android user agent results in a much smaller page size

      let {
        body
      } = yield _this.httpClient.request(fromUrl, {
        headers: {
          'user-agent': androidUA
        }
      });
      /* eslint-disable max-len */
      // URL example:
      // https://cdn1-mobile-spankwire.spankcdn.net/201811/26/25065251/mp4_720p_25065251.mp4?validfrom=1548762876&validto=1548791676&rate=531k&burst=1300k&hash=g8xUTRCfFKKbphgNZQK9VyXRWlw%3D

      let regexp = /videoUrl_hd["']?\s*:\s*["']?(https?:\\?\/\\?\/[^.]+\.spankcdn\.net[^"']+)/gi;
      /* eslint-enable max-len */

      let urlMatches = regexp.exec(body);
      let title = 'HD';

      if (!urlMatches || !urlMatches[1]) {
        // use sd version if hd is unavailable
        regexp = /videoUrl_sd["']?\s*:\s*["']?(https?:\\?\/\\?\/[^.]+\.spankcdn\.net[^"']+)/gi;
        urlMatches = regexp.exec(body);

        if (!urlMatches || !urlMatches[1]) {
          throw new Error('Unable to extract a stream URL from an android page');
        } else {
          title = 'SD';
        }
      }

      let url = urlMatches[1].replace('-mobile-', '-public-'); // works without this too

      if (url[0] === '/') {
        url = `https:/${url}`;
      }

      const qualities = ['1080', '720', '480', '360', '240'];
      const found = qualities.some(qual => {
        if (url.includes('_' + qual + 'p_')) {
          title += ' ' + qual + 'p';
          return true;
        }
      });

      if (!found) {
        const altQualities = ['high', 'ultra'];
        altQualities.some(qual => {
          if (url.includes('_' + qual + '_')) {
            title += ' ' + qual.toUpperCase();
            return true;
          }
        });
      }

      return [{
        title,
        url
      }];
    })();
  }

}

_defineProperty(_defineProperty(_defineProperty(SpankWire, "DISPLAY_NAME", 'SpankWire'), "ITEMS_PER_PAGE", 20), "GENRES", ['milf', 'asian', 'ebony', 'latina', 'hentai', 'babysitter', 'anal', 'public', 'gay']);

var _default = SpankWire;
exports.default = _default;
//# sourceMappingURL=SpankWire.js.map