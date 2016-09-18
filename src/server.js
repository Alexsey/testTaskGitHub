'use strict'

const Promise = require('bluebird')
const express = require('express')
const nconf = require('nconf')
const bodyParser = require('body-parser')
const app = express()

;(async () => {
  const basicAuth = require('./routes/basicAuth')
  const cache = await require('./routes/cache')
  const reposRouter = require('./routes/repos')
  const commentsRouter = await require('./routes/comments')
  const response = require('./routes/response')

  app.use(bodyParser.json())

  app.use(basicAuth)
  app.use(cache.read)

  app.use(reposRouter)
  app.use(commentsRouter)

  app.use(cache.write)

  app.use(response)

  await Promise.fromCallback(app.listen.bind(app, nconf.get('port')))
  console.log('Server started')
})()
