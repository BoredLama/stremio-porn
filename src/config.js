
const DEFAULT_ID = 'stremio_porn_plus'

class Config {

	static DEFAULT_ID = DEFAULT_ID
	static STATIC_DIR = 'static'

	static ID = process.env.STREMIO_PORN_ID || DEFAULT_ID
	static ENDPOINT = process.env.STREMIO_PORN_ENDPOINT || 'https://stremio-porn-plus.now.sh'
	static IS_PROD = process.env.NODE_ENV === 'production'
	static PORT = process.env.STREMIO_PORN_PORT || process.env.PORT || '80'
	static EMAIL = process.env.STREMIO_PORN_EMAIL || process.env.EMAIL
	static PROXY = process.env.STREMIO_PORN_PROXY || process.env.HTTPS_PROXY
	static CACHE = process.env.STREMIO_PORN_CACHE || process.env.REDIS_URL || '1'

	static ENDPOINT = process.env.STREMIO_PORN_ENDPOINT || 'https://stremio-porn-plus.now.sh'
	static PROXY = process.env.STREMIO_PORN_PROXY || process.env.HTTPS_PROXY
	static CACHE = process.env.STREMIO_PORN_CACHE || process.env.REDIS_URL || '1'
	static EMAIL = process.env.STREMIO_PORN_EMAIL || process.env.EMAIL

}

export default Config
