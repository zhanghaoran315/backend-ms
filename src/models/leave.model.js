const mongoose = require('mongoose')
const Schema = mongoose.Schema

const leaveSchema = new Schema({
  leaveNo: String, // 编号
  leaveType: Number, // 休假类型 1-事假 2-调休 3-年假
  startTime: Date,
  endTime: Date,
  leaveTime: String,
  reasons: String,
  applyUser: {
    userId: String,
    userName: String,
    userEmail: String
  },
  applyStatus: {
    type: Number,
    default: 1
    // 1:待审批 2:审批中
    // 3:审批拒绝 4:审批通过 5:作废
  },
  approvers: String, // 审批人不是一个，是一个字符串
  currentApprover: String, // 当前审批人
  approveFlows: [ // 审批流
    {
      userId: String,
      userName: String,
      userEmail: String
    }
  ],
  approveLogs: [ // 审批日志
    {
      userId: String,
      userName: String,
      action: String,
      remark: String,
      createTime: Date
    }
  ],
  createTime: {
    type: Date,
    default: Date.now()
  },
  updateTime: {
    type: Date,
    default: Date.now()
  }
})

const leaveModel = mongoose.model('leaves', leaveSchema)

module.exports = leaveModel