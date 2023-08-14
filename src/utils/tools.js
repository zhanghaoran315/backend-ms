/**
 * 通用工具函数
 */
const log = require('./log')
const jwt = require('jsonwebtoken')

const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss'

const formatDate = (utcString, fmt = DEFAULT_FORMAT) => {
  return dayjs.utc(utcString).utcOffset(8).format(fmt)
}

const CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 10001, // 参数错误
  USER_ACCOUNT_ERROR: 20001, // 账号或密码错误
  USER_LOGIN_ERROR: 30001, // 用户未登陆
  BUSINESS_ERROR: 40001, // 业务请求失败
  AUTH_ERROR: 50001 // 认证失败或TOKEN过期
}

const pager = ({ pageNum = 1, pageSize = 10 }) => {
  pageNum *= 1
  pageSize *= 1
  const skipIndex = (pageNum - 1) * pageSize
  return {
    page: {
      pageNum,
      pageSize
    },
    skipIndex
  }
}

const success = (data = '', msg = '请求成功', code = CODE.SUCCESS) => {
  log.debug(data)
  return {
    code,
    data,
    msg
  }
}

const fail = (msg = '请求失败', code = CODE.BUSINESS_ERROR, data = '') => {
  log.debug(msg)
  return {
    code,
    data,
    msg
  }
}

const decoded = (authorization) => {
  if (authorization) {
    const token = authorization.replace('Bearer ', '')
    return jwt.verify(token, 'coderzhr')
  }
  return ''
}

module.exports = {
  CODE,
  success,
  fail,
  pager,
  decoded,
  formatDate
}