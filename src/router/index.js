const fs = require('fs');

const useRoutes = function () {
  fs.readdirSync(__dirname).forEach(file => {
    if (file === 'index.js') return
    const route = require(`./${file}`)
    this.use(route.routes(), route.allowedMethods())
  })
}

module.exports = useRoutes