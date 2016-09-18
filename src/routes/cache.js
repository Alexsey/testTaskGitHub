'use strict'

const {calcUrlHash, create: createCache} = require('../models/cache')
const {getResponse} = require('./utils')

module.exports = (async () => {
  const {cache} = await require('../models/index')
  return {
    read: async (req, res, next) => {
      const route = req._parsedUrl.pathname
      const params = req.query
      const urlHash = calcUrlHash(route, params)
      if (req.method === 'GET') {
        if (req.headers.pragma === 'no-cache') return next()
        const cached = (await cache.find({_id: urlHash}).toArray())[0]
        const response = cached && cached.response
        if (response) return res.status(response.status).send(response.body)
      } else if ([ 'POST', 'PUT', 'PATCH', 'DELETE' ].includes(req.method)) {
        await cache.remove({route})
      }
      next()
    },
    write: async (req, res, next) => {
      if (req.method !== 'GET' || !req.toSend) return next()
      const route = req._parsedUrl.pathname
      const params = req.query
      const urlHash = calcUrlHash(route, params)
      const response = getResponse(req.toSend)
      const cached = createCache(route, params, response)
      await cache.remove({_id: urlHash})
      await cache.insertOne(cached)
      next()
    }
  }
})()
