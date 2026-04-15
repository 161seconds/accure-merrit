import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import databaseConfig from '~/config/database'
import { setupSwagger } from '~/config/swagger'

import routes from '~/routes'

import staticRouter from '~/routes/static.routes'

import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import { initFolder } from '~/utils/file'

const app = express()
const PORT = process.env.PORT || 3000

initFolder()

const allowedOrigins = [
    'http://localhost:5173',
    'https://accrue-merit.vercel.app'
]
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Bị CORS block chặn cửa rồi!'))
        }
    },
    credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Swagger API Docs
setupSwagger(app)

// Health check (Cho Render)
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        database: databaseConfig.getConnectionState(),
        timestamp: new Date().toISOString()
    })
})

// Gắn Routes
app.use('/api', routes)
app.use('/static', staticRouter)

app.use(defaultErrorHandler)

const startServer = async () => {
    try {
        await databaseConfig.connect()

        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════════╗
║          🪷  AccrueMerit Backend  🪷           ║
║──────────────────────────────────────────────║
║  Server:    http://localhost:${PORT}            ║
║  API Docs:  http://localhost:${PORT}/api-docs   ║
║  Health:    http://localhost:${PORT}/health     ║
╚══════════════════════════════════════════════╝
      `)
        })
    } catch (error) {
        console.error('❌ Lỗi không thể khởi động Server:', error)
        process.exit(1)
    }
}

startServer()

export default app