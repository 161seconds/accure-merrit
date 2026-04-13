import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import databaseConfig from '~/config/database'
import { setupSwagger } from '~/config/swagger'

import usersRouter from '~/routes/users.routes'
import mediasRouter from '~/routes/medias.routes'
import staticRouter from '~/routes/static.routes'
import karmaRouter from '~/routes/karma.routes'
import wishRouter from '~/routes/wish.routes'
import woodenFishRouter from '~/routes/woodenfish.routes'

import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import { initFolder } from '~/utils/file'

const app = express()
const PORT = process.env.PORT || 3000

// Tạo thư mục uploads nếu chưa có
initFolder()

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Swagger API Docs
setupSwagger(app)

// Routes
app.use('/api', usersRouter)
app.use('/api/medias', mediasRouter)
app.use('/api/karma', karmaRouter)
app.use('/api/wishes', wishRouter)
app.use('/api/wooden-fish', woodenFishRouter)
app.use('/static', staticRouter)

// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        database: databaseConfig.getConnectionState(),
        timestamp: new Date().toISOString()
    })
})

// Error handler (phải ở cuối cùng)
app.use(defaultErrorHandler)

// Start
databaseConfig.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════╗
║          🪷  AccrueMerit Backend  🪷         ║
║──────────────────────────────────────────────║
║  Server:    http://localhost:${PORT}              ║
║  API Docs:  http://localhost:${PORT}/api-docs     ║
║  Health:    http://localhost:${PORT}/health        ║
╚══════════════════════════════════════════════╝
    `)
    })
})

export default app