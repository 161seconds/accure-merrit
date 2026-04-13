import mongoose from 'mongoose'

class DatabaseService {
  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/accrue-merit'
      await mongoose.connect(uri)
      console.log('MongoDB connected successfully')
    } catch (error) {
      console.error('MongoDB connection error:', error)
      process.exit(1)
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService