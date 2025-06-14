import express, { Request, Response } from 'express'
import cors from 'cors'
import fs from 'fs'
import cacheRoutes from './cacher'

fs.rmSync('cache', { recursive: true, force: true })
fs.mkdirSync('cache')


const app = express()
function errorHandler(err: Error, req: Request, res: Response, next: Function) {
  console.error(err.stack)
  res.send(500).json({ error: 'Internal Server Error' })
}
app.use(errorHandler)

app.use(cors())
app.set('trust proxy', 1)

cacheRoutes(app)
app.listen(3000, () => {
})


module.exports = app;
