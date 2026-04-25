import { app } from './app'
import { env } from './env'
import { startTelegramBot } from './telegram'

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(async () => {
    console.log('HTTP server running on port', env.PORT, '🦅')
    await startTelegramBot()
  })
