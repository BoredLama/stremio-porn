import HubTrafficAdapter from './HubTrafficAdapter'

const androidUA = 'Mozilla/5.0 (Linux; Android 8.0.0; TA-1053 Build/OPR1.170623.026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3368.0 Mobile Safari/537.36'

class SpankWire extends HubTrafficAdapter {
  static DISPLAY_NAME = 'SpankWire'
  static ITEMS_PER_PAGE = 20
  static GENRES = ['milf', 'asian', 'ebony', 'latina', 'hentai', 'babysitter', 'anal', 'public', 'gay']

  _makeMethodUrl(method) {
    return `https://www.spankwire.com/api/HubTrafficApiCall?data=${method}`
  }

  _makeEmbedUrl(id) {
    return `https://www.spankwire.com/EmbedPlayer.aspx?ArticleId=${id}`
  }

  async _getStreams(type, id) {
    const fromUrl = `https://www.spankwire.com/a/video${id}/`
    // android user agent results in a much smaller page size
    let { body } = await this.httpClient.request(fromUrl, { headers: { 'user-agent': androidUA } })

    /* eslint-disable max-len */
    // URL example:
    // https://cdn1-mobile-spankwire.spankcdn.net/201811/26/25065251/mp4_720p_25065251.mp4?validfrom=1548762876&validto=1548791676&rate=531k&burst=1300k&hash=g8xUTRCfFKKbphgNZQK9VyXRWlw%3D
    let regexp = /videoUrl_hd["']?\s*:\s*["']?(https?:\\?\/\\?\/[^.]+\.spankcdn\.net[^"']+)/gi
    /* eslint-enable max-len */
    let urlMatches = regexp.exec(body)

    let title = 'HD'

    if (!urlMatches || !urlMatches[1]) {
      // use sd version if hd is unavailable
      regexp = /videoUrl_sd["']?\s*:\s*["']?(https?:\\?\/\\?\/[^.]+\.spankcdn\.net[^"']+)/gi
      urlMatches = regexp.exec(body)

      if (!urlMatches || !urlMatches[1]) {
        throw new Error('Unable to extract a stream URL from an android page')
      } else {
        title = 'SD'
      }

    }

    let url = urlMatches[1]
      .replace('-mobile-', '-public-') // works without this too

    if (url[0] === '/') {
      url = `https:/${url}`
    }

    const qualities = ['1080', '720', '480', '360', '240']

    const found = qualities.some(qual => {
      if (url.includes('_'+qual+'p_')) {
        title += ' ' + qual + 'p'
        return true
      }
    })

    if (!found) {
      const altQualities = ['high', 'ultra']

      altQualities.some(qual => {
        if (url.includes('_'+qual+'_')) {
          title += ' ' + qual.toUpperCase()
          return true
        }
      })
    }

    return [{ title, url }]
  }

}


export default SpankWire
