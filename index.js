const fp = require('fastify-plugin')

const plugin = require('./plugin')
const pkg = require('./package')

module.exports = fp(plugin, {
  fastify: '^3.10.0',
  name: pkg.name
})
