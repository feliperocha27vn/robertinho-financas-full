import { app } from './app'
import { seedDefaultDiet } from './bootstrap/seed-default-diet'
import { startTelegramBot } from './telegram'

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(async () => {
    await seedDefaultDiet()
    console.log('HTTP server running 🦅')
    await startTelegramBot()
  })
