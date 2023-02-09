/**
 * 日志配置
 */
const log4js = require('log4js')

// 日志级别
const levels = {
  'trace': log4js.levels.TRACE,
  'debug': log4js.levels.DEBUG,
  'info': log4js.levels.INFO,
  'warn': log4js.levels.WARN,
  'error': log4js.levels.ERROR,
  'fatal': log4js.levels.FATAL
}

// 日志配置
log4js.configure({
  appenders: {
    console: { type: 'console' },
    info: {
      type: 'file',
      filename: './logs/all-logs.log'
    },
    error: {
      type: 'dateFile',
      filename: './logs/log',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'debug' },
    info: {
      appenders: ['console', 'info'],
      level: 'info'
    },
    error: {
      appenders: ['console', 'error'],
      level: 'error'
    }
  }
})

// 日志输出 
// level = debug
const debug = (content) => {
  const logger = log4js.getLogger()
  logger.level = levels.debug
  logger.debug(content)
}

// level = info
const info = (content) => {
  const logger = log4js.getLogger('info')
  logger.level = levels.info
  logger.info(content)
}

// level = error
const error = (content) => {
  const logger = log4js.getLogger('error')
  logger.level = levels.error
  logger.error(content)
}

module.exports = {
  debug,
  info,
  error
}

