'use strict'

const _ = require('lodash')
const nconf = require('nconf')
const {aTry} = require('../utils')
const {isValidUser} = require('../gitHubApi')

module.exports = async (req, res, next) => {
  const credsBase64 = _.get(req, 'headers.authorization', '').split(' ')[1]
  const credsStr = new Buffer(credsBase64 || '', 'base64').toString()
  const name = credsStr.slice(0, credsStr.indexOf(':')) || nconf.get('user')
  const pass = credsStr.slice(credsStr.indexOf(':') + 1) || nconf.get('pass')
  const creds = {username: name, password: pass}
  const [requestError, userIsValid] = await aTry(isValidUser, creds)
  if (requestError) return responseForGithubError(res, requestError)
  if (!userIsValid) return responseForInvalidCredentials(res)
  req.user = creds
  next()
}

function responseForGithubError (res, gitHubError) {
  console.error('github request error:', gitHubError)
  const error = 'Some error occurred during connection to github'
  res.status(500).send({error})
}

function responseForInvalidCredentials (res) {
  const error = 'Basic authorization error: incorrect username or password'
  res.status(401).send({error})
}
