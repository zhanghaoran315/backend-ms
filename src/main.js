const Koa = require('koa')

const app = new Koa()

const json = require('koa-json')
const bodyparser = require('koa-bodyparser')
const koajwt = require('koa-jwt')
const log = require('./utils/log')

app.use(json())
app.use(bodyparser())
app.use(require('koa-static')(__dirname + '../public'))

const tools = require('./utils/tools')

app.use(async (ctx, next) => {
  log.info(`query传参${JSON.stringify(ctx.request.body)}`)
  await next().catch(err => {
    if (err.status == '401') {
      ctx.status = 200
      ctx.body = tools.fail('Token认证失败', tools.CODE.AUTH_ERROR)
    } else {
      throw err
    }
  })
})

app.use(koajwt({ secret: 'coderzhr' }).unless({
  path: [/login/]
}))
// 验证token是否失效，失效会抛出异常status改为401


const useRegister = require('./app/index.js')

app.useRegister = useRegister
app.useRegister()

module.exports = app
