if (process.env.BABEL_ENV === 'client') {
  module.exports = require('./client-preset')
} else {
  module.exports = require('./server-preset')
}