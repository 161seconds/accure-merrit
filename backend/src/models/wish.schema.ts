import mongoose, { Document, Schema } from 'mongoose'
import { WishCategory, IncenseType } from '~/constants/enums'

export interface IWish extends Document {
    user_id: mongoose.Types.ObjectId
    category: WishCategory
    content: string
    incense_type: IncenseType
    created_at: Date
}

const WishSchema = new Schema<IWish>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        category: {
            type: String,
            enum: Object.values(WishCategory),
            required: true,
            default: WishCategory.BinhAn
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300
        },
        incense_type: {
            type: String,
            enum: Object.values(IncenseType),
            default: IncenseType.TramHuong
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: false
        }
    }
)

WishSchema.index({ user_id: 1, created_at: -1 })

const Wish = mongoose.model<IWish>('Wish', WishSchema)
export default Wish