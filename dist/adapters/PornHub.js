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

class PornHub extends _HubTrafficAdapter.default {
  _makeMethodUrl(method) {
    let methodAliases = {
      searchVideos: 'search',
      getVideoById: 'video_by_id'
    };
    return `https://www.pornhub.com/webmasters/${methodAliases[method]}`;
  }

  _makeEmbedUrl(id) {
    return `https://www.pornhub.com/embed/${id}`;
  }

  _getStreams(type, id) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const fromUrl = `https://www.pornhub.com/view_video.php?viewkey=${id}`; // android user agent results in a much smaller page size

      let {
        body
      } = yield _this.httpClient.request(fromUrl, {
        headers: {
          'user-agent': androidUA
        }
      });
      /* eslint-disable max-len */
      // URL example:
      // https:\/\/cv.phncdn.com\/videos\/201812\/18\/197359631\/720P_1500K_197359631.mp4?Y23fgPea7lt_eqyjC6ej2YRTuUjwKmPFjA-U1toa4MkKgg2SVYcgoTTgdQz_d7kk2u4H2BSlKqXZE0-58JT-5vafU_8jOlWSKy5B1eW-dSTc7c4Z7dh-rqaauQGs972zG_4dM_Spok3bt2AYBZLoHUu33u6y1jteum3AWT1mnpyhpmfcx8TFwK8arSVrj-2lD8Z9-1U5NmQ

      let regexp = /videoUrl["']?\s*:\s*["']?(https?:\\?\/\\?\/[a-z]+\.phncdn\.com[^"']+)/gi;
      /* eslint-enable max-len */

      let urlMatches = regexp.exec(body);

      if (!urlMatches || !urlMatches[1]) {
        throw new Error('Unable to extract a stream URL from an android page');
      }

      let url = urlMatches[1].replace(/[\\/]+/g, '/') // Normalize the slashes...
      .replace(/(https?:\/)/, '$1/'); // ...but keep the // after "https:"

      if (url[0] === '/') {
        url = `https:/${url}`;
      }

      const qualities = ['1080', '720', '480', '360', '240'];
      let title = '480p';
      qualities.some(qual => {
        if (url.includes('/' + qual + 'P_')) {
          title = qual + 'p';
          return true;
        }
      });
      return [{
        title,
        url
      }];
    })();
  }

}

_defineProperty(_defineProperty(_defineProperty(_defineProperty(PornHub, "DISPLAY_NAME", 'PornHub'), "ITEMS_PER_PAGE", 30), "VIDEO_ID_PARAMETER", 'id'), "GENRES", ['milf', 'asian', 'ebony', 'latina', 'arab', 'hentai', 'babysitter', 'anal', 'orgy', 'public', 'gay']);

var _default = PornHub;
exports.default = _default;
//# sourceMappingURL=PornHub.js.map