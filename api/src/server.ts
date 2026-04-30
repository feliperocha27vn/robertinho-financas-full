import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { app } from './app'
import { env } from './env'

app
  .listen({
    port: process.env.PORT ? Number(process.env.PORT) : env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('HTTP server running')
  })

if (env.NODE_ENV === 'development') {
  const specFile = resolve(process.cwd(), 'swagger.json')
  app.ready().then(() => {
    const spec = JSON.stringify(app.swagger(), null, 2)
    writeFile(specFile, spec).then(() => {
      console.log('Swagger spec generated')
    })
  })
}
