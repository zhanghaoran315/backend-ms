const authRouter = require('koa-router')()
const userModel = require('../models/user.model')
const tools = require('../utils/tools')
const jwt = require('jsonwebtoken')

authRouter.post('/login', async (ctx, next) => {
  const { userName, userPwd } = ctx.request.body

  const result = await userModel.findOne({ userName, userPwd }, {
    _id: 0,
    userPwd: 0,
    __v: 0
  })

  if (result) {
    // 真正的数据在 result._doc里面
    // 这个 result 的 setter和getter应该是做了劫持的
    const data = result._doc

    // 更新一下最后的登录时间
    await userModel.updateOne({ userName: data.userName }, { lastLoginTime: new Date() })

    const token = jwt.sign(data, 'coderzhr', {
      expiresIn: '1d'
    })

    data.token = token
    ctx.body = tools.success(data)
  } else {
    ctx.body = tools.fail('账号或密码不正确')
  }
})

module.exports = authRouter