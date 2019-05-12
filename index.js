process.title = 'image-processor'

const Rabbit = require('./src/rabbit')

const rabbit = new Rabbit()
rabbit.start()
rabbit.consume()
