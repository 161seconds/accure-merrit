import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import databaseConfig from '~/config/database'
import { setupSwagger } from '~/config/swagger'

// Nhập tổng hợp các routes API (Từ server.ts)
import routes from '~/routes'

// Bổ sung route xử lý file tĩnh (static) từ index.ts sang để không bị lỗi load ảnh
import staticRouter from '~/routes/static.routes'

// Sử dụng đúng tên Error Handler từ index.ts để tránh lỗi import
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import { initFolder } from '~/utils/file'

const app = express()
const PORT = process.env.PORT || 3000

// Tạo thư mục uploads nếu chưa có
initFolder()

// Middlewares (Giữ lại limit 10mb từ server.ts)
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
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
app.use('/static', staticRouter) // Đã bổ sung thành công

// Error handler (Phải ở cuối cùng)
app.use(defaultErrorHandler)

// Khởi động Server an toàn với Try/Catch
const startServer = async () => {
    try {
        await databaseConfig.connect()

        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════════╗
║          🪷  AccrueMerit Backend  🪷          ║
║──────────────────────────────────────────────║
║  Server:    http://localhost:${PORT}              ║
║  API Docs:  http://localhost:${PORT}/api-docs     ║
║  Health:    http://localhost:${PORT}/health       ║
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