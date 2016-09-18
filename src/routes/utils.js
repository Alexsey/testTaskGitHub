'use strict'

exports.getResponse = toSend => {
  const {status, body} = toSend
  let resStatus, resBody
  if (body) {
    resStatus = status || 200
    resBody = body
  } else {
    if (status) {
      resStatus = status
      resBody = ''
    } else {
      resStatus = 200
      resBody = toSend
    }
  }
  return {status: resStatus, body: resBody}
}
