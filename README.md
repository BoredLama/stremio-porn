# Porn Addon for Stremio

_Time to unsheathe your sword!_

A [Stremio](https://www.stremio.com/) addon that provides porn content from various websites:

- __Videos__ _(Movies)_: PornHub, RedTube, YouPorn, SpankWire and Porn.com
- __Webcam streams__ _(TV Channels)_: Chaturbate


## Features

- Adds a dedicated tab in Discover for each website
- Configurable via environment variables
- Supports Docker out of the box
- Caches results in memory
- Supports HTTPS proxy


## Usage

```
git clone https://github.com/naughty-doge/stremio-porn
cd stremio-porn
npm install
npm start
```

After starting the addon, open its endpoint in the browser or enter it in the Stremio app.

The addon is a web server that fetches video streams from the porn sites in response to requests from Stremio clients. It uses environment variables for configuration and includes a handful of npm scripts to run with or without Docker.

By default the server listens to `localhost:8008` and doesn't announce itself to the Stremio addon tracker. In order for it to work publicly, `NODE_ENV` must be set to `production`, and `STREMIO_PORN_ENDPOINT` must be a public URL of the server.


## npm scripts

Each of these scripts can be used with `npm run <script>` or `yarn <script>`:

- `start` launches the addon
- `prod` sets `NODE_ENV` to `production` and launches the addon
- `dev` sets `NODE_ENV` to `development` and launches the addon with node inspector activated
- `build` builds the addon in the `dist` dir

* `docker-build` builds the Docker image
* `docker-start` launches the addon in a `stremio-porn` Docker container
* `docker-dev` sets `NODE_ENV` to `development` and launches the addon in a `stremio-porn` Docker container
* `docker-prod` sets `NODE_ENV` to `production` and launches the addon in a `stremio-porn` Docker container
* `docker-stop` stops the Docker container


## Configuration

To configure the addon, set the following environment variables before running it:

- `NODE_ENV` — when set to `production`, the addon will announce its endpoint to the Stremio addon tracker
- `STREMIO_PORN_ENDPOINT` — URL to use as the endpoint, must be public in production mode (defaults to `http://localhost`)
- `STREMIO_PORN_PORT` — port to listen to (defaults to `8008`)
- `STREMIO_PORN_EMAIL` — email address that can be used to contact you (unset by default)
- `STREMIO_PORN_PROXY` — HTTPS proxy address to route all the outbound requests to (unset by default)
- `STREMIO_PORN_CACHE` — toggles the in-memory cache (defaults to 1)
