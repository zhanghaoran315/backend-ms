const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 1.创建文档结构对象
const userScheme = new Schema({
  userId: Number,
  userName: String,
  userPwd: String, // 密码 md5加密
  userEmail: String,
  mobile: String,
  sex: Number, // 性别：0男 1女
  job: String,
  deptId: Array,
  state: { // 状态：1在职 2离职 3试用期
    type: Number,
    default: 1
  },
  role: { // 用户角色 0系统管理员 1普通用户
    type: Number,
    default: 1
  },
  roleList: Array,
  createTime: {
    type: Date,
    default: Date.now()
  },
  lastLoginTime: {
    type: Date,
    default: Date.now()
  },
  remark: String
})


// 2.创建文档模型对象
const userModel = mongoose.model('users', userScheme)

module.exports = userModel