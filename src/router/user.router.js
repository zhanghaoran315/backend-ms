const userRouter = require('koa-router')()
const userModel = require('../models/user.model')
const counterModel = require('../models/counter.model')
const menuModel = require('../models/menu.model')
const roleModel = require('../models/role.model')
const tools = require('../utils/tools')

userRouter.prefix('/users')

// 1.用户列表
userRouter.get('/list', async (ctx, next) => {
  const { userId, userName, state } = ctx.request.query
  const { page, skipIndex } = tools.pager(ctx.request.query)
  const params = {}
  if (userId) params.userId = userId
  if (userName) params.userName = userName
  if (state && state != 0) params.state = state

  const Query = userModel.find(params, { _id: 0, userPwd: 0, __v: 0 })

  const list = await Query.skip(skipIndex).limit(page.pageSize)
  const total = await userModel.count(params)

  // 根据条件查询
  ctx.body = tools.success({
    page: {
      ...page,
      total
    },
    list
  })
})

// 2.删除用户
userRouter.post('/delete', async (ctx, next) => {
  // 待删除的用户id数组
  const { userIds } = ctx.request.body
  // userModel.updateMany({ $or: [{userId: 1001}, {userId: 1002}] }, { state: 2 })
  const result = await userModel.updateMany({ userId: { $in: userIds } }, { state: 2 })

  console.log(result);

  if (result.modifiedCount) {
    ctx.body = tools.success(result, `共删除${result.modifiedCount}`)
    return
  }
  ctx.body = tools.fail('删除失败')
})

// 3.用户新增/编辑
userRouter.post('/operate', async (ctx,next) => {
  const { userId,userName,userEmail,mobile,job,state,roleList,deptId,action } = ctx.request.body
  if (action === 'add') {
    if (!userName || !userEmail || !deptId) {
      ctx.body = tools.fail('参数错误', tools.CODE.PARAM_ERROR)
      return
    }

    const result = await userModel.findOne({ $or: [{userName}, {userEmail}]}, '_id userName userEmail')
    // 查不到数据，会返回一个 null
    if (result) {
      ctx.body = tools.fail(`系统监测到有重复的用户，信息如下：${result.userName} - ${result.userEmail}`)
    } else {
      // const doc = await counterModel.updateOne({ _id: 'userId' }, { $inc: { sequence_value: 1 } }, { new: true })
      const doc = await counterModel.findOneAndUpdate({ _id: 'userId' }, { $inc: { sequence_value: 1 } }, { new: true })
      new userModel({
        userId: doc.sequence_value,
        userName,
        userPwd: '123456',
        userEmail,
        role: 1, // 默认是普通用户
        roleList,
        job,
        state,
        deptId,
        mobile
      }).save()
      ctx.body = tools.success('', '用户创建成功')
    }
  } else {
    if (!deptId) {
      ctx.body = tools.fail('部门不能为空', tools.CODE.PARAM_ERROR)
      return
    }

    await userModel.updateOne({ userId },{ mobile,job,state,roleList,deptId })
    ctx.body = tools.success({}, '更新成功')
  }
})

// 4.完整的用户列表
userRouter.get('/all/list', async (ctx, next) => {

  const list = await userModel.find({}, { _id: 0, userId: 1, userName: 1, userEmail: 1 })

  // 根据条件查询
  ctx.body = tools.success(list)
})

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

/**
 * 
 * @param {role: 用户角色 0系统管理员 1普通用户} role 
 * @param {roleList: 用户对应角色的_id} roleList 
 */
const getMenuList = async (role, roleList) => {
  let menuListArr = []
  if (role == 0) {
    // 0系统管理员 - 根本没有这个选项
    menuListArr = await menuModel.find()
    console.log('--------------------');
  } else {
    // 1普通用户
    // 用户所有的角色
    let roleListArr = await roleModel.find({ _id: { $in: roleList } })
    let menuKeys = []
    roleListArr.forEach((item) => {
      const { checkedKeys, halfCheckedKeys } = item.permissionList
      menuKeys.push(...checkedKeys, ...halfCheckedKeys)
    })
    menuKeys = [...new Set(menuKeys)]
    menuListArr = await menuModel.find({ _id: {$in: menuKeys }})
  }
  return getMenuTree(menuListArr, undefined, [])
}

const getActionList = (menuList, actionList = []) => {
  for (const menu of menuList) {
    if (menu.children && !menu.action) {
      getActionList(menu.children, actionList)
    } else if (menu.action) {
      menu.action.forEach((item) => {
        if (item.menuCode) actionList.push(item.menuCode)
      })
    }
  }
  return actionList
}

// 5.获取用户对应的权限菜单
userRouter.get('/permissionList', async(ctx, next) => {
  const authorization = ctx.request.headers.authorization
  const { role, roleList } = tools.decoded(authorization)
  const menuList = await getMenuList(role, roleList)
  const actionList = getActionList(menuList)

  ctx.body = tools.success({
    menuList,
    actionList
  })
})


module.exports = userRouter
