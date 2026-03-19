import { app } from './app'
import { startDiscordBot } from './discord'

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('HTTP server running 🦅')
    startDiscordBot()
  })
