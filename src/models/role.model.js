const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 1.创建文档结构对象
const roleSchema = new Schema({
  roleName: String,
  remark: String,
  permissionList: {
    checkedKeys: Array,
    halfCheckedKeys: Array
  },
  createTime: {
    type: Date,
    default: Date.now()
  },
  updateTime: {
    type: Date,
    default: Date.now()
  }
})

// 2.创建文档模型对象
const roleModel = mongoose.model('roles', roleSchema)

module.exports = roleModel