const pify = require('pify')
const path = require('path')
const readFile = pify(require('fs').readFile)
const randomItem = require('random-item')
const micro = require('micro')

module.exports = (opts) => (uw) => {
  /**
   * Check if randomization is enabled.
   * 
   * @return {Promise.<boolean>}
   */
  function shouldRandomize () {
    return uw.redis.get('wlk:shouldRandomize')
      // Cast 0 → false, 1 → true
      .then(Number)
      .then(Boolean)
  }

  async function enableRandomize () {
    await uw.redis.set('wlk:shouldRandomize', 1)
    publishRandomize()
  }
  async function disableRandomize () {
    await uw.redis.set('wlk:shouldRandomize', 0)
    publishRandomize()
  }
  async function toggleRandomize () {
    const current = await shouldRandomize()
    if (current) {
      await disableRandomize()
    } else {
      await enableRandomize()
    }
  }

  async function publishRandomize () {
    const value = await shouldRandomize()

    await uw.redis.publish('v1', JSON.stringify({
      command: 'wlk:shouldRandomize',
      data: { value }
    }))
  }

  const server = micro(async (req, res) => {
    if (req.url === '/status') {
      if (req.method.toLowerCase() === 'post') {
        await toggleRandomize()

        return {
          meta: {},
          data: {}
        }
      }
      if (req.method.toLowerCase() === 'get') {
        return {
          meta: {},
          data: {
            value: await shouldRandomize()
          }
        }
      }
    }
    if (req.url === '/') {
      res.setHeader('content-type', 'text/html')
      return readFile(path.join(__dirname, 'src/manage.html'), 'utf8')
    }
    if (req.url === '/manage.js') {
      res.setHeader('content-type', 'application/javascript')
      return readFile(path.join(__dirname, 'client.js'), 'utf8')
    }

    throw micro.createError(400, 'Bad Request')
  })

  server.listen(opts && opts.port || 8886)

  const defaultGetNextEntry = uw.booth.getNextEntry
  uw.booth.getNextEntry = async function (opts) {
    // Use the standard logic if randomization is not enabled.
    if (!(await shouldRandomize())) {
      return defaultGetNextEntry.call(this, opts)
    }

    const HistoryEntry = this.uw.model('History')

    const user = await this.getNextDJ(opts)
    if (!user) {
      return null
    }

    const playlist = randomItem(await user.getPlaylists())
    const playlistItem = await playlist.getItemAt(Math.floor(Math.random() * playlist.size))

    await playlistItem.populate('media').execPopulate()

    // TERRIBLE HACK!!! to prevent the waitlist from cycling lol
    playlist.media.push = (item) => {
      playlist.media.unshift(item)
      playlist.media.push = [].push
    }

    return new HistoryEntry({
      user,
      playlist,
      item: playlistItem,
      media: {
        media: playlistItem.media,
        artist: playlistItem.artist,
        title: playlistItem.title,
        start: playlistItem.start,
        end: playlistItem.end
      }
    })
  }

  uw.wlk = uw.wlk || {}
  uw.wlk.shouldRandomize = shouldRandomize
  uw.wlk.enableRandomize = enableRandomize
  uw.wlk.disableRandomize = disableRandomize
  uw.wlk.toggleRandomize = toggleRandomize
}
