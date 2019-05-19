process.title = 'image-processor'

const Rabbit = require('./src/rabbit')

const rabbit = new Rabbit()
rabbit
  .start()
  .then(
    () => {
      console.log('Start consuming rabbit queue')
      rabbit.consume()
    },
    error => {
      console.error('Failed to start Rabbit. Retrying.', error.message)
      setTimeout(() => rabbit.start(), 10000)
    }
  )
  .catch(console.warn)
