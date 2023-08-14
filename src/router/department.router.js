const departmentRouter = require('koa-router')()
const tools = require('../utils/tools')
const departmentModel = require('../models/department.model')

departmentRouter.prefix('/department')

const getDepartmentTree = (departmentList, _id = undefined, departmentTree = []) => {
  for (const department of departmentList) {
    if (String(department.parentId.at(-1)) === String(_id)) {
      departmentTree.push(department._doc)
    }
  }

  for (const item of departmentTree) {
    item.children = []
    getDepartmentTree(departmentList, item._id, item.children)
  }
  return departmentTree
}

// 1.部门列表
departmentRouter.get('/list', async (ctx, next) => {
  const { departmentName } = ctx.request.query
  const params = {}
  if (departmentName)  params.departmentName = departmentName
  const list = await departmentModel.find(params)
  const departmentTree = getDepartmentTree(list)
  console.log(departmentTree);
  ctx.body = tools.success(departmentTree)
})



// 2.部门操作
departmentRouter.post('/operate', async (ctx, next) => {
  const { _id, action, ...params } = ctx.request.body
  let res, info
  if (action === 'create') {
    await departmentModel.create(params)
    info = '创建成功'
  } else if (action === 'edit') {
    params.updateTime = new Date()
    await departmentModel.findByIdAndUpdate(_id, params)
    info = '编辑成功'
  } else {
    await departmentModel.findByIdAndRemove(_id)
    await departmentModel.deleteMany({ parentId: { $all: [_id]} })
    info = '删除成功'
  }
  ctx.body = tools.success('', info) 
})

module.exports = departmentRouter