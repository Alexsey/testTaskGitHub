'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const request = Promise.promisify(require('request'), {multiArgs: true})
const nconf = require('nconf')

const concurrency = nconf.get('gitHubConcurrency')

exports.getUserRepos = async (userName, creds) => {
  const reposUrl = _.template(`/users/${userName}/repos?page=<%= page %>`)
  const firstPageReqParams = constructReqParams(creds, reposUrl({page: 1}))
  const [{headers}, firstPageRepos] = await request(firstPageReqParams)
  if (!headers.link) return firstPageRepos

  const numberOfPages = +headers.link
    // todo .match(/(?<=page\=)\d+/g)[1] and --es_staging
    // after fis of https://bugs.chromium.org/p/v8/issues/detail?id=5322
    .match(/page=\d+/g)[1]
    .match(/\d+$/)
  const otherPagesReqParams = _.range(2, numberOfPages + 1)
    .map(page => reposUrl({page}))
    .map(url => constructReqParams(creds, url))
  const results = await Promise.map(otherPagesReqParams, request, {concurrency})
  const otherPagesRepos = _.flatMap(results, 1)
  return firstPageRepos.concat(otherPagesRepos)
}

exports.isValidRepo = async (ownerName, repoName, creds) => {
  const repoUrl = `/repos/${ownerName}/${repoName}`
  const repoReqParams = constructReqParams(creds, repoUrl)
  const [{headers}] = await request(repoReqParams)
  const status = headers.status.match(/^\d+/g)[0]
  return status === '200'
}

exports.isValidUser = async (creds) => {
  const userUrl = `users/${creds.username}`
  const userReqParams = constructReqParams(creds, userUrl)
  const [{headers: {status}}] = await request(userReqParams)
  return status.startsWith('200')
}

function constructReqParams (creds, url) {
  return {
    baseUrl: nconf.get('githubBaseUrl'),
    url,
    headers: {
      Accept: 'application/vnd.github.v3+json', // force github API v3
      'User-Agent': creds.username
    },
    json: true,
    auth: creds
  }
}
