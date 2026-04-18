import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

class DatabaseConfig {
    private uri: string

    constructor() {
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tichduc_db';
    }


    async connect() {
        try {
            mongoose.set('strictQuery', true)

            await mongoose.connect(this.uri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000
            })

            console.log('MongoDB connected successfully')
            console.log(`   Database: ${this.getDatabaseName()}`)
        } catch (error) {
            console.error('MongoDB connection error:', error)
            process.exit(1)
        }

        this.registerEvents()
    }

    private registerEvents() {
        const connection = mongoose.connection

        connection.on('error', (error) => {
            console.error('MongoDB error:', error.message)
        })

        connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...')
        })

        connection.on('reconnected', () => {
            console.log('MongoDB reconnected')
        })

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await this.disconnect()
            process.exit(0)
        })

        process.on('SIGTERM', async () => {
            await this.disconnect()
            process.exit(0)
        })
    }

    async disconnect() {
        try {
            await mongoose.disconnect()
            console.log('MongoDB disconnected gracefully')
        } catch (error) {
            console.error('Error disconnecting MongoDB:', error)
        }
    }

    getConnectionState(): string {
        const states: Record<number, string> = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        }
        return states[mongoose.connection.readyState] || 'unknown'
    }

    getDatabaseName(): string {
        return mongoose.connection.name || 'unknown'
    }
}

const databaseConfig = new DatabaseConfig()
export default databaseConfig