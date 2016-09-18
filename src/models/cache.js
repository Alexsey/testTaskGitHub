'use strict'

const crypto = require('crypto')

const _ = require('lodash')
const nconf = require('nconf')

const {safeDropCollection} = require('./utils')

module.exports = {
  init: async db => {
    if (nconf.get('cleanUpCache')) {
      await safeDropCollection(db, 'Cache')
    }
    const collection = db.collection('Cache')
    await collection.createIndex(
      {createAt: 1},
      {expireAfterSeconds: nconf.get('cacheTTL')}
    )
    await collection.createIndex({route: 1})
    return collection
  },
  create: (route, params, response) => {
    const _id = calcUrlHash(route, params)
    return {_id, createAt: new Date(), route, response}
  },
  calcUrlHash
}

// if we will need to show different data to different users
// we will also need to use current user to calc hash
function calcUrlHash (route, params) {
  const sortedParams = _(params).toPairs().sortBy(0).fromPairs().value()
  const serializedParams = JSON.stringify(sortedParams)
  const hash = crypto.createHash('md5')
  return hash.update(route + serializedParams).digest('hex')
}
