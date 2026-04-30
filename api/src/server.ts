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
    console.log(`🦅 HTTP server running on port ${process.env.PORT ?? env.PORT}`),
    console.log(`📄 Docs available at http://localhost:${process.env.PORT ?? env.PORT}/docs`)
  })

if (env.NODE_ENV === 'development') {
  const specFile = resolve(process.cwd(), 'swagger.json')
  app.ready().then(() => {
    const spec = JSON.stringify(app.swagger(), null, 2)
    writeFile(specFile, spec).then(() => {
    }).catch((err) => {
      console.error(err)
    })
  })
}
