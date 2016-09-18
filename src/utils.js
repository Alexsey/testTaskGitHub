'use strict'

module.exports = {
  aTry: async (f, ...args) => {
    try {
      return [null, await f.apply(null, args)]
    } catch (e) {
      return [e instanceof Error ? e : Error(JSON.stringify(e))]
    }
  }
}
