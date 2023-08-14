const roleRouter = require('koa-router')()
const roleModel = require('../models/role.model')
const tools = require('../utils/tools')

roleRouter.prefix('/roles')

// 1.角色列表（完整）
roleRouter.get('/all/list', async (ctx, next) => {
  const list = await roleModel.find({}, "_id roleName")
  ctx.body = tools.success(list)
})

// 2.角色列表（表格）
roleRouter.get('/list', async (ctx, next) => {
  const { roleName } = ctx.request.query
  const { page, skipIndex } = tools.pager(ctx.request.query)
  const params = {}
  if (roleName) params.roleName = roleName
  const Query = roleModel.find(params)
  // 查询对象
  const list = await Query.skip(skipIndex).limit(page.pageSize)
  // 过滤后的列表
  const total = await roleModel.countDocuments(params)
  // 文档数量
  ctx.body = tools.success({
    list,
    page: {
      ...page,
      total
    }
  })
})

// 3.角色操作：创建、编辑、删除
roleRouter.post('/operate', async (ctx, next) => {
  const { _id, roleName, remark, action } = ctx.request.body
  let info = null
  if (action === 'create') {
    await roleModel.create({ roleName, remark })
    info = '创建成功'
  } else if (action === 'edit') {
    const params = { roleName, remark, updateTime: new Date() }
    await roleModel.updateOne({ _id }, params)
    info = '编辑成功'
  } else {
    await roleModel.findByIdAndRemove(_id)
    info = '删除成功'
  }
  ctx.body = tools.success('', info)
})

// 4.角色权限设置
roleRouter.post('/update/permission', async (ctx, next) => {
  const { _id, permissionList } = ctx.request.body
  const params = { permissionList, updateTime: new Date() }
  await roleModel.findByIdAndUpdate(_id, params)
  ctx.body = tools.success('', '权限设置成功')
})

module.exports = roleRouter