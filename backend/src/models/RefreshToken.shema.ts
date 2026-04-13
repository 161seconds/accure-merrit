import mongoose, { Document, Schema } from 'mongoose'

export interface IRefreshToken extends Document {
  token: string
  user_id: mongoose.Types.ObjectId
  created_at: Date
  iat: number
  exp: number
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  iat: {
    type: Number,
    required: true
  },
  exp: {
    type: Number,
    required: true
  }
})

const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema)
export default RefreshToken