# Seia-Soto/lightwsd-fastify

A fastify plugin to wrap [`lightwsd`](http://github.com/Seia-Soto/lightwsd) plugin.
Inspired from [`fastify/fastify-websocket`](https://github.com/fastify/fastify-websocket).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [LICENSE](#license)

----

# Installation

To install this plugin, you need to install this repository:

```bash
yarn add Seia-Soto/lightwsd-fastify#[TAG]
```

# Usage

You need to call `fastify.register` with `await` because of promise.

```js
const fastify = require('fastify')
const lightwsdFastify = require('Seia-Soto/lightwsd-fastify')

const app = fastify()

module.exports = (async () => {
  await app.register(lightwsdFastify, {
    lightwsd: {
      ws: {},
      redis: {}
    },
    shouldUpgrade: async request => !request.headers.authorization
  })
})()
```

## Declarations

You can declare and handle websocket handler in various ways.

### Short-hand declaration

After registering this plugin, you can handle the websocket connection with `ws` and `wsHandler` property when you route.
You can handle both HTTP request and websocket connection at the time with `wsHandler` property.

```js
app.get('/anotherRoute', {
  handler: (req, res) => ({ hello: 1 }),
  wsHandler: async (connection, request) => {
    console.log('connected /anotherRoute')
  }
})
```

### `routeOptions.handler` as websocket handler

You can set `ws` property to truthy values such as `1` instead of defining `wsHandler`.
If you do so, the plugin will override existing `handler` function with following function which won't respond to request.

```js
app.get('/anotherRoute', {
  ws: 1,
  handler: async (connection, request) => {
    console.log('connected /anotherRoute')
  }
})
```

### Full declaration

Of course you can.

```js
app.route({
  method: 'GET',
  url: '/anotherRoute',
  ws: 1,
  handler: async (connection, request) => {
    console.log('connected /anotherRoute')
  }
})
```

## `handler (connection, request, lightwsd) => ...`

- `connection` (WebSocket) An established websocket connection to client.
  - `fns` (lightwsd.fns) A short-cut access for lightwsd functions.
- `request` (HTTP.IncomingMessage) An incoming HTTP request.
- `lightwsd` (lightwsd) Lightwsd instance.

A handler function that you create will handle incoming connection.

```js
app.route({
  method: 'GET',
  url: '/anotherRoute',
  ws: 1,
  handler: async (connection, request, lightwsd) => {
    connection.fns.send(connection.id, { hello: 'world' })
  }
})
```

## LICENSE

This project is distributed under [MIT License](./LICENSE).
