'use strict'

const amqp = require('amqplib')
const avro = require('avsc')

const type = avro.Type.forSchema({
  type: 'record',
  fields: [{ name: 'id', type: 'string' }, { name: 'image_path', type: 'string' }]
})

const RabbitMQMessage = require('./message')
const ThumbnailGenerator = require('./thumbnail_generator')

const tg = new ThumbnailGenerator()

const Redis = require('./redis')

const redis = new Redis()

const HOST = process.env.RABBIT_HOST || 'localhost'
const USER = process.env.RABBIT_USER
const PASSWORD = process.env.RABBIT_PASSWORD
const queue = process.env.RABBIT_QUEUE

class Rabbit {
  init () {
    this.start()
      .then(
        conn => {
          console.log('Start consuming rabbit queue')
          this.consume(conn)
        },
        error => {
          console.error('Failed to start.', error.message)
          throw new Error("Couldn't start")
        }
      )
      .catch(error => {
        console.error('[AMQP] connection. Retrying.', error.message)
        setTimeout(() => this.init(), 10000)
      })
  }

  start () {
    console.log('establishing a connection with rabbitmq')
    return amqp.connect(`amqp://${USER}:${PASSWORD}@${HOST}`).then(
      conn => {
        console.log('connection established with rabbitmq')
        process.once('SIGINT', () => {
          conn.close()
        })
        return conn
      },
      error => {
        console.error('Failed to establish a connection.', error.message)
        throw new Error("Couldn't establish a connection")
      }
    )
  }

  consume (conn) {
    console.log('consuming rabbitmq queue')
    return conn.createChannel().then(
      ch => {
        var ok = ch.assertQueue(queue, { durable: true })
        ok = ok.then(() => {
          ch.prefetch(1)
        })
        ok = ok.then(() => {
          ch.consume(queue, doWork, { noAck: false })
          console.log(' [*] Waiting for messages. To exit press CTRL+C')
        })
        return ok

        function doWork (buf) {
          const val = type.fromBuffer(buf.content)
          redis.setProcessing(val.id)
          console.log(" [x] Received '%s'", val)
          var msg = new RabbitMQMessage(val.id, val.image_path)
          var filePath = tg.generate(msg.getImagePath(), msg.getId())
          ch.ack(buf)
          redis.setReady(msg.getId(), filePath)
        }
      },
      error => {
        console.error('[AMQP] channel. Retrying.', error.message)
        throw new Error("Couldn't create channel")
      }
    )
  }
}

module.exports = Rabbit
