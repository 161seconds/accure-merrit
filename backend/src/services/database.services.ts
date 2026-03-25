import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/user.schema'
import RefreshToken from '~/models/RefreshToken.shema'
dotenv.config() // kết nối file .env

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clustershoppingcart.uefou3o.mongodb.net/?appName=ClusterShoppingCart`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
class DatabaseServices {
  private client: MongoClient //prop
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  // method connect database
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.error('Error connecting to MongoDB:', error)
      throw error
    }
  }
  // method connect đến Collection users
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
}
// tạo instance và export luôn
const databaseServices = new DatabaseServices()
export default databaseServices
