import HubTrafficAdapter from './HubTrafficAdapter'

const androidUA = 'Mozilla/5.0 (Linux; Android 8.0.0; TA-1053 Build/OPR1.170623.026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3368.0 Mobile Safari/537.36'

class PornHub extends HubTrafficAdapter {
  static DISPLAY_NAME = 'PornHub'
  static ITEMS_PER_PAGE = 30
  static VIDEO_ID_PARAMETER = 'id'

  _makeMethodUrl(method) {
    let methodAliases = {
      searchVideos: 'search',
      getVideoById: 'video_by_id',
    }
    return `https://www.pornhub.com/webmasters/${methodAliases[method]}`
  }

  _makeEmbedUrl(id) {
    return `https://www.pornhub.com/embed/${id}`
  }

  async _getStreams(type, id) {
    const fromUrl = `https://www.pornhub.com/view_video.php?viewkey=${id}`
    // android user agent results in a much smaller page size
    let { body } = await this.httpClient.request(fromUrl, { headers: { 'user-agent': androidUA } })

    /* eslint-disable max-len */
    // URL example:
    // https:\/\/cv.phncdn.com\/videos\/201812\/18\/197359631\/720P_1500K_197359631.mp4?Y23fgPea7lt_eqyjC6ej2YRTuUjwKmPFjA-U1toa4MkKgg2SVYcgoTTgdQz_d7kk2u4H2BSlKqXZE0-58JT-5vafU_8jOlWSKy5B1eW-dSTc7c4Z7dh-rqaauQGs972zG_4dM_Spok3bt2AYBZLoHUu33u6y1jteum3AWT1mnpyhpmfcx8TFwK8arSVrj-2lD8Z9-1U5NmQ
    let regexp = /videoUrl["']?\s*:\s*["']?(https?:\\?\/\\?\/[a-z]+\.phncdn\.com[^"']+)/gi
    /* eslint-enable max-len */
    let urlMatches = regexp.exec(body)

    if (!urlMatches || !urlMatches[1]) {
      throw new Error('Unable to extract a stream URL from an android page')
    }

    let url = urlMatches[1]
      .replace(/[\\/]+/g, '/') // Normalize the slashes...
      .replace(/(https?:\/)/, '$1/') // ...but keep the // after "https:"

    if (url[0] === '/') {
      url = `https:/${url}`
    }

    const qualities = ['1080', '720', '480', '360', '240']

    let title = '480p'

    qualities.some(qual => {
      if (url.includes('/'+qual+'P_')) {
        title = qual + 'p'
        return true
      }
    })

    return [{ title, url }]

  }

}


export default PornHub
