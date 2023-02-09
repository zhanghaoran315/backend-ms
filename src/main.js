const Koa = require('koa')

const app = new Koa()

const json = require('koa-json')
const bodyparser = require('koa-bodyparser')
const onerror = require('koa-onerror')
onerror(app)

const log = require('./utils/log')


const index = require('./router/index')
const users = require('./router/users')


// middlewares
app.use(json())
app.use(bodyparser())
app.use(require('koa-static')(__dirname + '/public'))

app.use(() => {
  ctx.body = "1111"
})

app.use(async (ctx, next) => {
  await next()
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  log.error(err.message)
});

module.exports = app
