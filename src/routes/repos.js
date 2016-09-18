'use strict'

const _ = require('lodash')
const express = require('express')
const router = express.Router()

const {getUserRepos} = require('../gitHubApi')
const {aTry} = require('../utils')

router.get('/:user/repo', async (req, res, next) => {
  const creds = req.user
  const [requestError, repos] = await aTry(getUserRepos, req.params.user, creds)
  if (requestError) return responseForGithubError(res, requestError)
  if (req.query.q) req.toSend = filterRepos(repos, req.query.q)
  else if (!_.isEmpty(req.query)) req.toSend = filterRepos(repos, req.query)
  else req.toSend = repos
  next()
})

function filterRepos (repos, pattern) {
  if (_.isObject(pattern)) {
    return _.reduce(pattern, (filtered, value, field) =>
        filtered.filter(repo => _.get(repo, field) === value)
      , repos)
  } else { // pattern is a string
    return repos.filter(repo => getStringValues(repo).includes(pattern))
  }

  function getStringValues (obj) {
    return _.flatMap(obj, v => {
      if (_.isString(v) || _.isNumber(v)) return v.toString()
      if (_.isObject(v)) return getStringValues(v)
      return []
    })
  }
}

function responseForGithubError (res, gitHubError) {
  console.error('github request error:', gitHubError)
  const error = 'Some error occurred during connection to github'
  res.status(500).send({error})
}

module.exports = router
