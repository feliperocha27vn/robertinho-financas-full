import { app } from './app'
import { startTelegramBot } from './telegram'

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('HTTP server running 🦅')
    startTelegramBot()
  })
