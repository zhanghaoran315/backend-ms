const approveRouter = require('koa-router')()
const tools = require('../utils/tools')

approveRouter.get('/notice', (ctx, next) => {
  const authorization = ctx.headers.authorization
  console.log(authorization);
  ctx.body = tools.success(100)
})


module.exports = approveRouter