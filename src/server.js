import http from 'http'
import chalk from 'chalk'
import Config from './config'

const httpHandler = require('./index.js')

let server = http.createServer(httpHandler)

if (Config.IS_PROD && Config.ID === Config.DEFAULT_ID) {
  // eslint-disable-next-line no-console
  console.error(
    chalk.red(
      '\nWhen running in production, a non-default addon identifier must be specified\n'
    )
  )
  process.exit(1)
}

if (Config.IS_PROD) {
  /* eslint-disable no-console */
  console.log(
    chalk.green(`Publishing to Stremio central: ${Config.ENDPOINT}/manifest.json`)
  )
  publishToCentral(`${Config.ENDPOINT}/manifest.json`)
}

server
  .on('listening', () => {
    let values = {
      endpoint: chalk.green(`${Config.ENDPOINT}/manifest.json`),
      id: Config.ID === Config.DEFAULT_ID ? chalk.red(Config.ID) : chalk.green(Config.ID),
      email: Config.EMAIL ? chalk.green(Config.EMAIL) : chalk.red('undefined'),
      env: Config.IS_PROD ? chalk.green('production') : chalk.green('development'),
      proxy: Config.PROXY ? chalk.green(Config.PROXY) : chalk.red('off'),
      cache: (Config.CACHE === '0') ?
        chalk.red('off') :
        chalk.green(Config.CACHE === '1' ? 'on' : Config.CACHE),
    }

    // eslint-disable-next-line no-console
    console.log(`Porn Addon is listening on port ${Config.PORT}

    Endpoint:    ${values.endpoint}
    Addon Id:    ${values.id}
    Email:       ${values.email}
    Environment: ${values.env}
    Proxy:       ${values.proxy}
    Cache:       ${values.cache}
    `)
  })
  .listen(Config.PORT)

export default server
