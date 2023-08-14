const mongoose = require('mongoose')
const Scheme = mongoose.Schema

// 1.创建文档结构对象
const menuSchema = new Scheme({
  menuType: Number, // 菜单类型 1菜单 2按钮
  menuState: Number, // 菜单状态 1正常 2停用
  menuName: String,
  menuCode: String, // 权限标识
  path: String, // 路由地址
  icon: String, // 图标
  component: String, // 组件地址
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

// 2.创建文档模型对象
const menuModel = mongoose.model('menus', menuSchema)

module.exports = menuModel