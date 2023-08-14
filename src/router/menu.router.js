const menuRouter = require('koa-router')()
const tools = require('../utils/tools')
const menuModel = require('../models/menu.model')

menuRouter.prefix('/menu')

const getMenuTree = (menuList, _id = undefined, menuTree = []) => {
  // 1.一级菜单
  for (const menu of menuList) {
    if (String(menu.parentId.at(-1)) === String(_id)) {
      menuTree.push(menu._doc)
    } 
  }
  // 2.子菜单
  for (const item of menuTree) {
    item.children = []
    getMenuTree(menuList, item._id, item.children)
    if (item.children.length == 0) {
      delete item.children;
    } else if (item.children.length > 0 && item.children[0].menuType == 2) {
      // 快速区分按钮和菜单，用于后期做菜单按钮权限控制
      item.action = item.children;
    }
  }
  return menuTree
}

// 菜单列表
menuRouter.get('/list', async (ctx, next) => {
  const { menuName, menuState } = ctx.request.body
  const params = {}
  if(menuName) params.menuName = menuName
  if(menuState) params.menuState = menuState
  const list = await menuModel.find(params)
  console.log(list);
  const menuTree = getMenuTree(list)
  ctx.body = tools.success(menuTree)
})

// 新建、编辑、删除
menuRouter.post('/operate', async (ctx, next) => {
  const { _id, action, ...params } = ctx.request.body
  let res, info
  if (action == 'add') {
    res = await menuModel.create(params)
    info = '创建成功'
  } else if (action == 'edit') {
    res = await menuModel.findByIdAndUpdate(_id, params)
    info = '编辑成功'
  } else {
    res = await menuModel.findByIdAndRemove(_id)
    // 将所有 parentId 里包含 _id 的全部删除
    await menuModel.deleteMany({ parentId: { $all: [_id] } })
    info = '删除成功'
  }
  ctx.body = tools.success('', info)
})

module.exports = menuRouter