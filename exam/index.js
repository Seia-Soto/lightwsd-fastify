const fastify = require('fastify')
const lightwsdFastify = require('../')

const app = fastify({ logger: true })

module.exports = (async () => {
  await app.register(lightwsdFastify)

  app.get('/', {
    handler: (req, res) => ({ hello: 1 }),
    wsHandler: async (connection, request) => {
      console.log('connected /')
    }
  })
  app.get('/anotherRoute', {
    handler: (req, res) => ({ hello: 1 }),
    wsHandler: async (connection, request) => {
      console.log('connected /anotherRoute')
    }
  })
  app.get('/override', {
    ws: true,
    handler: async (connection, request) => {
      console.log('connected /override')
    }
  })

  app.route({
    method: 'GET',
    url: '/fullDecl',
    handler: async (req, res) => ({ url: '/fullDecl' }),
    wsHandler: async (connection, request) => {
      console.log('connected /fullDecl')
    }
  })

  app.listen(8080)
})()
