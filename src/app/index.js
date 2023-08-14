
const onerror = require('koa-onerror')
const log = require('../utils/log')

const useRoute = require('../router/index')


require('./database')

const register = function () {

  const app = this

  onerror(app)

  app.useRoute = useRoute
  app.useRoute()

  app.on('error', (err, ctx) => {
    log.error(err.message)
  });
}

module.exports = register