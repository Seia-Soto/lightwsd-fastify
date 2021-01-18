const { default: lib } = require('lightwsd')
const url = require('urlite')
const findMyWay = require('find-my-way')

module.exports = async (fastify, options, done) => {
  options = Object.assign({
    lightwsd: {
      ws: {
        noServer: true
      }
    },
    shouldUpgrade: () => true
  }, options)

  options.lightwsd = options.lightwsd || {}
  options.lightwsd.ws = options.lightwsd.ws || {}
  options.lightwsd.ws.noServer = true

  const lightwsd = await lib(options.lightwsd)
  const router = findMyWay()

  fastify.addHook('onRoute', routeOpts => {
    if (routeOpts.ws || routeOpts.wsHandler) {
      router.on('GET', routeOpts.url, routeOpts.wsHandler || (routeOpts.ws && routeOpts.handler))

      if (routeOpts.ws && !routeOpts.wsHandler) {
        routeOpts.handler = (request, reply) => request.socket.destroy()
      }
    }
  })

  fastify.server.on('upgrade', async (request, socket, head) => {
    request.pathname = url.parse(request.url).pathname
    request.controller = router.find('GET', request.pathname)

    const upgradable =
      (request.controller) &&
      (await options.shouldUpgrade(request))
    if (!upgradable) return socket.destroy()

    lightwsd._ws.handleUpgrade(
      request,
      socket,
      head,
      // NOTE: emit event on ws, so lightwsd can pre-handle;
      connection => lightwsd._ws.emit('connection', connection, request)
    )
  })

  // NOTE: receive decorated `request`;
  lightwsd.signal.on('connection.create', (connection, request) => {
    if (request.controller.handler) {
      connection.fns = lightwsd.fns

      // NOTE: call original handler;
      request.controller.handler(connection, request, lightwsd)
    } else {
      lightwsd.fns.close(connection.id)
    }
  })

  fastify.decorate('wsd', lightwsd)

  done()
}
