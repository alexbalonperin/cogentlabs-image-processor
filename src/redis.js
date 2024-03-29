'use strict'

const redis = require('redis')

const redisClient = redis.createClient({ host: 'redis' })
redisClient.on('error', function (err) {
  console.log('Error ' + err)
})

class Redis {
  set (key, value) {
    redisClient.set(key, value, redis.print)
  }

  get (id) {
    return redisClient.get(id)
  }

  setProcessing (id) {
    if (this.get(id) !== null) {
      this.set(id, JSON.stringify({ status: 'processing' }))
    } else {
      throw new Error(`trying to get unknown id ${id} in redis`)
    }
  }

  setReady (id, path) {
    if (this.get(id) !== null) {
      this.set(id, JSON.stringify({ status: 'ready', path: path }))
    } else {
      throw new Error(`trying to get unknown id ${id} in redis`)
    }
  }
}

module.exports = Redis
