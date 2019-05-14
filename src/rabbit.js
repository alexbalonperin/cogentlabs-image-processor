'use strict'

const amqp = require('amqplib')
const avro = require('avsc');

const type = avro.Type.forSchema({
  type: 'record',
  fields: [
    {name: 'id', type: 'string'},
    {name: 'image_path', type: 'string'}
  ]
});

const RabbitMQMessage = require('./message')
const ThumbnailGenerator = require('./thumbnail_generator')
const tg = new ThumbnailGenerator()

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

          function doWork (buf) {
            const val = type.fromBuffer(buf.content);
            var parsedMessage = new RabbitMQMessage(val.id, val.image_path)
            tg.generate(parsedMessage.getImagePath(), parsedMessage.getId())
            console.log(" [x] Received '%s'", val)
            ch.ack(buf)
          }
        })
      })
      .catch(console.warn)
  }
}

module.exports = Rabbit
