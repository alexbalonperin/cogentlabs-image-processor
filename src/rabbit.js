'use strict'

const amqp = require('amqplib')

const HOST = process.env.RABBIT_HOST || 'localhost'
const USER = process.env.RABBIT_USER
const PASSWORD = process.env.RABBIT_PASSWORD
const queue = process.env.RABBIT_QUEUE

class Rabbit {
  constructor () {
    this.connection = null
  }

  start () {
    console.log('establishing a connection with rabbitmq')
    this.connection = amqp.connect(`amqp://${USER}:${PASSWORD}@${HOST}`).catch(function (error) {
      console.error('[AMQP] connection', error.message)
      setTimeout(this.start(), 10000)
    })
  }

  consume () {
    this.connection
      .then(conn => {
        process.once('SIGINT', () => {
          conn.close()
        })
        return conn.createChannel().then(ch => {
          var ok = ch.assertQueue(queue, { durable: true })
          ok = ok.then(() => {
            ch.prefetch(1)
          })
          ok = ok.then(() => {
            ch.consume(queue, doWork, { noAck: false })
            console.log(' [*] Waiting for messages. To exit press CTRL+C')
          })
          return ok

          function doWork (msg) {
            var body = msg.content.toString()
            console.log(" [x] Received '%s'", body)
            ch.ack(msg)
          }
        })
      })
      .catch(console.warn)
  }
}

module.exports = Rabbit
