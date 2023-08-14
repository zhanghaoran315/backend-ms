const mongoose = require("mongoose")
const config = require("./config")
const log = require('../utils/log')

// 1.连接数据库
mongoose.connect(config.dbUrl)

// 2.检查连接状态
mongoose.connection.on('open', () => {
  log.info('***数据库连接成功***')
})

mongoose.connection.on('error', () => {
  log.error('***数据库连接失败***')
})