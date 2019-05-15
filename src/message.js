'use strict'

class RabbitMQMessage {
  constructor (id, imagePath) {
    this.id = id
    this.imagePath = imagePath
  }

  getId () {
    return this.id
  }

  getImagePath () {
    return this.imagePath
  }
}

module.exports = RabbitMQMessage
