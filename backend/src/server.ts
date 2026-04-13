import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import databaseConfig from '~/config/database'
import { setupSwagger } from '~/config/swagger'
import routes from '~/routes'
import { errorHandler } from '~/middlewares/error.middlewares'
import { initFolder } from '~/utils/file'

const app = express()
const PORT = process.env.PORT || 3000

initFolder()

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

setupSwagger(app)

app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        database: databaseConfig.getConnectionState(),
        timestamp: new Date().toISOString()
    })
})

app.use('/api', routes)

app.use(errorHandler)

const startServer = async () => {
    try {
        await databaseConfig.connect()

        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════╗
║        🪷  AccrueMerit Backend  🪷        ║
║──────────────────────────────────────────║
║  Server:    http://localhost:${PORT}      ║
║  API Docs:  http://localhost:${PORT}/api-docs ║
║  Health:    http://localhost:${PORT}/health   ║
╚══════════════════════════════════════════╝
      `)
        })
    } catch (error) {
        console.error('❌ Lỗi không thể khởi động Server:', error)
        process.exit(1)
    }
}

startServer()

export default app