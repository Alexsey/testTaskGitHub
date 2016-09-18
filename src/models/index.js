'use strict'

const nconf = require('nconf')
const Promise = require('bluebird')
const connectToMongo = require('mongodb').MongoClient.connect

const commentModel = require('./comment')
const catchModel = require('./cache')

const mongoUrl = nconf.get('mongoUrl').match(/.*[^\/$]/) // remove trailing '/'
const baseUrl = `${mongoUrl}/${nconf.get('mongoBase')}`

module.exports = ((async () => {
  const db = await Promise.fromCallback(connectToMongo.bind(null, baseUrl))

  global.__cleanupTasks__.push(db.close.bind(db))

  return {
    comments: await commentModel.init(db),
    cache: await catchModel.init(db)
  }
}))()
