#!/usr/bin/env node

'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const nconf = require('nconf')
nconf
  .argv()
  .env()
  .file({file: './config.json'})

process.on('unhandledRejection', reason => {
  const mongoConnectionError = reason.name = 'MongoError' &&
    reason.message.startsWith('failed to connect')
  if (mongoConnectionError) {
    const mongoUrl = reason.message.match(/\[[^\]]*\]/)
    const error = `MongoDB failed to connect to ${mongoUrl}. ` +
      `Please set url with MongoDB instance running as ` +
      `command line argument --mongoUrl=`
    exitHandler(error)
  } else {
    exitHandler(reason)
  }
})

process.on('exit', exitHandler)
process.on('SIGINT', exitHandler)
process.on('uncaughtException', exitHandler)

function exitHandler (error) {
  Promise.all(global.__cleanupTasks__).then(() => {
    if (error) console.error(error)
    process.exit(1)
  }).catch(e => {
    console.error(`failed during execution of a cleanup task:\n`, e)
    if (error) console.error('\nThe error that lead to fall:\n', error)
    process.exit(1)
  })
}

_.extend(require('util').inspect.defaultOptions, {
  colors: true,
  depth: null
})

global.__cleanupTasks__ = []

require('babel-register')({only: '/src/'})
require('./server')
