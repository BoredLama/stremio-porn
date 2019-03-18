"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _url = require("url");

var _BaseAdapter = _interopRequireDefault(require("./BaseAdapter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// https://www.hubtraffic.com/
class HubTrafficAdapter extends _BaseAdapter.default {
  _normalizeItem(item) {
    let video = item.video || item;
    let {
      TAGS_TO_SKIP
    } = this.constructor;
    let tags = video.tags && Object.values(video.tags).map(tag => {
      return typeof tag === 'string' ? tag : tag.tag_name;
    }).filter(tag => !TAGS_TO_SKIP.includes(tag.toLowerCase()));
    return super._normalizeItem({
      type: 'movie',
      id: video.video_id || video.id,
      name: video.title.trim(),
      genres: tags,
      background: video.thumb,
      poster: video.thumb,
      posterShape: 'landscape',
      releaseInfo: video.publish_date && video.publish_date.split('-')[0],
      website: video.url,
      description: video.url,
      runtime: video.duration
    });
  }

  _normalizeStream(stream) {
    let title = stream.title && stream.title.trim() || stream.quality && stream.quality.trim() || 'SD';
    return super._normalizeStream(_objectSpread({}, stream, {
      title,
      availability: 1,
      isFree: 1
    }));
  }

  _makeMethodUrl() {
    throw new Error('Not implemented');
  }

  _makeEmbedUrl() {
    throw new Error('Not implemented');
  }

  _extractStreamsFromEmbed() {
    throw new Error('Not implemented');
  }

  _requestApi(method, params) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let options = {
        json: true
      };

      let url = _this._makeMethodUrl(method);

      if (params) {
        url = new _url.URL(url);
        Object.keys(params).forEach(name => {
          if (params[name] !== undefined) {
            url.searchParams.set(name, params[name]);
          }
        });
      }

      let {
        body
      } = yield _this.httpClient.request(url, options); // Ignore "No Videos found!"" and "No video with this ID." errors
      // eslint-disable-next-line eqeqeq

      if (body.code && body.code != 2001 && body.code != 2002) {
        let err = new Error(body.message);
        err.code = Number(body.code);
        throw err;
      }

      return body;
    })();
  }

  _findByPage(query, page) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let {
        ITEMS_PER_PAGE
      } = _this2.constructor;
      let newQuery = {
        'tags[]': !query.genre && !query.search ? 'teen' : query.genre,
        search: query.search,
        period: 'weekly',
        ordering: 'mostviewed',
        thumbsize: 'medium',
        page
      };
      let result = yield _this2._requestApi('searchVideos', newQuery);
      let videos = result.videos || result.video || []; // We retry with the monthly period in case there are too few weekly videos

      if (!query.search && page === 1 && videos.length < ITEMS_PER_PAGE) {
        newQuery.period = 'monthly';
        let result = yield _this2._requestApi('searchVideos', newQuery);
        let monthlyVideos = result.videos || result.video || [];
        videos = videos.concat(monthlyVideos).slice(0, ITEMS_PER_PAGE);
      }

      return videos;
    })();
  }

  _getItem(type, id) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let query = {
        [_this3.constructor.VIDEO_ID_PARAMETER]: id
      };
      return _this3._requestApi('getVideoById', query);
    })();
  }

  _getStreams(type, id) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      let url = _this4._makeEmbedUrl(id);

      let {
        body
      } = yield _this4.httpClient.request(url);

      let streams = _this4._extractStreamsFromEmbed(body);

      return streams && streams.map(stream => {
        stream.id = id;
        return stream;
      });
    })();
  }

}

_defineProperty(_defineProperty(_defineProperty(HubTrafficAdapter, "SUPPORTED_TYPES", ['movie']), "TAGS_TO_SKIP", []), "VIDEO_ID_PARAMETER", 'video_id');

var _default = HubTrafficAdapter;
exports.default = _default;
//# sourceMappingURL=HubTrafficAdapter.js.map