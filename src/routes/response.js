'use strict'

const {getResponse} = require('./utils')

module.exports = (req, res) => {
  if (req.toSend) {
    const {status, body} = getResponse(req.toSend)
    return res.status(status).send(body)
  }
  const error = `url '${req.url}' is not valid`
  res.status(404).send({error})
}
