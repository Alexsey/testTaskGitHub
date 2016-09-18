'use strict'

const {safeDropCollection} = require('./utils')
const nconf = require('nconf')

module.exports = {
  init: async db => {
    if (nconf.get('cleanUpComments')) {
      await safeDropCollection(db, 'Comments')
    }
    const collection = db.collection('Comments')
    await collection.createIndex({
      user: 1,
      repo: 1
    })
    return collection
  }
}
