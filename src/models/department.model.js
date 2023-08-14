const mongoose = require('mongoose')
const Schema = mongoose.Schema

const departmentSchema = new Schema({
  departmentName: String,
  userId: String,
  userName: String,
  userEmail: String,
  parentId: [mongoose.Types.ObjectId],
  createTime: {
    type: Date,
    default: Date.now()
  },
  updateTime: {
    type: Date,
    default: Date.now()
  }
})

const departmentModel = mongoose.model('departments', departmentSchema)

module.exports = departmentModel