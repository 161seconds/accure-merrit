import mongoose, { Document, Schema } from 'mongoose'
import { UserVerifyStatus } from '~/constants/enums'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  name: string
  date_of_birth?: Date
  avatar?: string
  verify: UserVerifyStatus
  stats: {
    ducTotal: number
    toiTotal: number
    moCount: number
    streak: number
    lastActiveDate?: Date
  }
  settings: {
    font: string
    theme: string
    language: string
  }
  created_at: Date
  updated_at: Date
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    date_of_birth: {
      type: Date,
      default: null
    },
    avatar: {
      type: String,
      default: ''
    },
    verify: {
      type: Number,
      enum: UserVerifyStatus,
      default: UserVerifyStatus.Unverified
    },
    stats: {
      ducTotal: { type: Number, default: 0 },
      toiTotal: { type: Number, default: 0 },
      moCount: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null }
    },
    settings: {
      font: { type: String, default: 'Noto Serif' },
      theme: { type: String, default: 'dark' },
      language: { type: String, default: 'vi' }
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password, __v, ...safeUser } = ret
    return safeUser
  }
})

const User = mongoose.model<IUser>('User', UserSchema)
export default User 