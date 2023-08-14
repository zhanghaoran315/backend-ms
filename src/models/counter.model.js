const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 1.创建文档结构模型
const counterSchema = new Schema({
  _id: String,
  sequence_value: Number
}) 


// 2.创建文档对象模型
const counterModel = mongoose.model('counters', counterSchema)

module.exports = counterModel