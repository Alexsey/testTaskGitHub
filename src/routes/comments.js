'use strict'

const express = require('express')
const router = express.Router()
const {isValidRepo} = require('../gitHubApi')
const {aTry} = require('../utils')

module.exports = ((async () => {
  const {comments} = await require('../models/index')

  router.route('/:user/:repo/comments')
    .get(async (req, res, next) => {
      const {user, repo} = req.params
      req.toSend = await comments.find({user, repo}).toArray()
      next()
    })
    .put(async (req, res, next) => {
      const {user, repo} = req.params
      const {comment} = req.body
      const creds = req.user
      const author = creds.username
      if (!comment) return responseForEmptyComment(res)
      const [requestError, repoIsOk] = await aTry(isValidRepo, user, repo, creds)
      if (requestError) return responseForGithubError(res, requestError)
      if (!repoIsOk) return responseForInvalidRepo(res, user, repo)
      const {result} = await comments.insertOne({user, repo, comment, author})
      if (!result.ok) return responseForInvalidWrite(res, req)
      req.toSend = getResponseForSuccessWrite(res, req)
      next()
    })

  return router
}))()

function responseForEmptyComment (res) {
  const error = `request body must be JSON with non-empty field 'comment'`
  return res.status(400).send({error})
}

function responseForGithubError (res, gitHubError) {
  console.error('github request error:', gitHubError)
  const error = 'Some error occurred during connection to github'
  res.status(500).send({error})
}

function responseForInvalidRepo (res, user, repo) {
  const error = `User '${user}' doesn't have repository '${repo}'`
  return res.status(404).send({error})
}

function getResponseForSuccessWrite (res, req) {
  res.setHeader('location', req.url)
  return {status: 201}
}

function responseForInvalidWrite (res, req) {
  const error = `failed to PUT on url '${req.url}'`
  res.status(400).send({error})
}
