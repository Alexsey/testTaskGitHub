'use strict'

exports.safeDropCollection = async (db, collection) => {
  try {
    await db.collection(collection).drop()
  } catch (e) {
    if (e.message !== 'ns not found') throw e
  }
}