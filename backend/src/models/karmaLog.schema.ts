import mongoose, { Document, Schema } from 'mongoose'
import { KarmaLogType } from '~/constants/enums'

export interface IKarmaLog extends Document {
    user_id: mongoose.Types.ObjectId
    type: KarmaLogType
    title: string
    description?: string
    points: number
    category: string
    created_at: Date
    updated_at: Date
}

const KarmaLogSchema = new Schema<IKarmaLog>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: Object.values(KarmaLogType),
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ''
        },
        points: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        },
        category: {
            type: String,
            trim: true,
            default: 'Khác',
            maxlength: 30
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

KarmaLogSchema.index({ user_id: 1, created_at: -1 })
KarmaLogSchema.index({ user_id: 1, type: 1 })

const KarmaLog = mongoose.model<IKarmaLog>('KarmaLog', KarmaLogSchema)
export default KarmaLog