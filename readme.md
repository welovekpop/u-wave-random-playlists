# @wlk/u-wave-random-playlists

üWave plugin that, when enabled, selects random songs from any playlist for the DJ to play.
This overrides the default booth behaviour where songs are picked from the top of the active playlist.

## Install

```bash
npm install @wlk/u-wave-random-playlists
```

## Usage

```js
const randomPlaylists = require('@wlk/u-wave-random-playlists')

uw.use(randomPlaylists())
```

This plugin serves a small admin panel on `localhost:8886`.
A custom port can be specified using the `port` option:

```js
uw.use(randomPlaylists({ port: 3033 }))
```

The admin panel is not protected, so it's best to put it behind a reverse proxy like nginx and add HTTP basic authentication yourself.

## License

[MIT](./LICENSE)
