const leaveRouter = require('koa-router')()
const leaveModel = require('../models/leave.model')
const departmentModel = require('../models/department.model')
const tools = require('../utils/tools')

leaveRouter.prefix('/leave')

// 查询自己休假的申请数据
leaveRouter.get('/list', async (ctx, next) => {
  const { applyStatus } = ctx.request.query
  const { page, skipIndex } = tools.pager(ctx.request.query)
  const authorization = ctx.request.headers.authorization
  const { userId } = tools.decoded(authorization)
  const params = {
    'applyUser.userId': userId
  }
  if (applyStatus) params.applyStatus = applyStatus
  const Query = leaveModel.find(params)
  // 第一个直接返回的promise
  const list = await Query.skip(skipIndex).limit(page.pageSize)
  const total = await leaveModel.countDocuments(params)
  ctx.body = tools.success({
    page: {
      ...page,
      total
    },
    list
  })
})

// 待我审批列表
leaveRouter.get('/ratify/list', async (ctx, next) => {
  const { applyStatus } = ctx.request.query
  const { page, skipIndex } = tools.pager(ctx.request.query)
  const authorization = ctx.request.headers.authorization
  const { userId, userName } = tools.decoded(authorization)
  let params = {}
  // 待审批，待我审批
  // 第一审批人（待审批）
  // 第二审批人（审批中）
  if (applyStatus == 1) {
    params.currentApprover = userName
    params.$or = [{ applyStatus: 1 }, { applyStatus: 2 }]
    // 审批状态为 待审批 或者 审批中，如果当前审批人是我，那都是由我来审批
  } else if (applyStatus == 2) {
    params.currentApprover = userName
    params.applyStatus = 2
  } else if (applyStatus > 2) {
    params = { "approveFlows.userId": userId, applyStatus }
  } else {
    // 上面都是带状态查询
    // 查询全部
    params = { "approveFlows.userId": userId }
  }
  const Query = leaveModel.find(params)
  // 第一个直接返回的promise
  const list = await Query.skip(skipIndex).limit(page.pageSize)
  const total = await leaveModel.countDocuments(params)
  ctx.body = tools.success({
    page: {
      ...page,
      total
    },
    list
  })
})

// 休假申请操作
// 创建 - 作废（将状态调整为5）
leaveRouter.post('/operate', async (ctx, next) => {
  const { _id, action, ...params } = ctx.request.body
  const authorization = ctx.request.headers.authorization
  const { userId, userName, userEmail, deptId } = tools.decoded(authorization)
  if (action == 'create') {
    // 生成申请单号
    let leaveNo = 'XJ'
    leaveNo += tools.formatDate(new Date(), 'YYYY-MM-DD')
    const count = await leaveModel.countDocuments()
    params.leaveNo = leaveNo + count

    // 获取当前用户的部门_id
    // 用户的部门 deptId 是一个数组 这个 cascader当 emitPath 为 true 时返回的结果,如果为false会返回绑定的值
    const _id = deptId.pop()
    // 获取当前用户所在的部门信息
    const department = await departmentModel.findById(_id)
    // 获取人事部门或者财务部门负责人的信息
    const userList = await departmentModel.find({ departmentName: { $in: ['人事部门', '财务部门'] } })

    let approvers = department.userName
    let approveFlows = [
      {
        userId: department.userId,
        userName: department.userName,
        userEmail: department.userEmail
      }
    ]
    userList.map(item => {
      approveFlows.push({
        userId: item.userId,
        userName: item.userName,
        userEmail: item.userEmail
      })
      approvers += ',' + item.userName
    })
    // 创建文档时，审批状态默认为待审批
    // 所有的审批人
    params.approvers = approvers
    // 当前的审批人
    params.currentApprover = department.userName
    // 审批流
    params.approveFlows = approveFlows
    params.approveLogs = []
    // 申请人的信息
    params.applyUser = {
      userId,
      userName,
      userEmail
    }

    await leaveModel.create(params)
    ctx.body = tools.success('', '创建成功')
  } else {
    await leaveModel.findByIdAndUpdate(_id, { applyStatus: 5 })
    ctx.body = tools.success('', '操作成功')
  }
})

// 审批操作
leaveRouter.post('/approve', async (ctx, next) => {
  const { _id, action, remark } = ctx.request.body 
  const authorization = ctx.request.headers.authorization
  const { userId, userName } = tools.decoded(authorization)
  // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
  const doc = await leaveModel.findById(_id)
  const params = {}
  const approveLogs = doc.approveLogs || []
  if (action == 'refuse') {
    params.applyStatus = 3  
  } else if (action == 'pass') {
    // 通过
    if (doc.approveFlows.length == doc.approveLogs.length) {
      ctx.body = tools.success('', '当前申请单已处理，请勿重复提交')
    } else if (doc.approveFlows.length == doc.approveLogs.length + 1) {
      // 最后一个审批人也点了通过
      params.applyStatus = 4
    } else if (doc.approveFlows.length > doc.approveLogs.length) {
      params.applyStatus = 2
      params.currentApprover = doc.approveFlows[doc.approveLogs.length + 1].userName
      // 当前审批人改为这个流的下一个审批人
    }
  }
  approveLogs.push({
    userId,
    userName,
    createTime: new Date(),
    remark,
    action: action == 'refuse' ? '审核拒绝' : '审核通过'
  })
  params.approveLogs= approveLogs
  await leaveModel.findByIdAndUpdate(_id, params)
  ctx.body = tools.success('', '处理成功')
})

// 审批通知数量
leaveRouter.get('/approve/notice', async (ctx, next) => {
  const authorization = ctx.request.headers.authorization
  const { userName } = tools.decoded(authorization)
  const params = {
    currentApprover: userName,
    $or: [{ applyStatus: 1 }, { applyStatus: 2 }]
  }
  const count = await leaveModel.countDocuments(params)
  ctx.body = tools.success(count)
})



module.exports = leaveRouter