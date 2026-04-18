import mongoose, { Schema, Document } from 'mongoose';

export interface IMission extends Document {
    id: string;
    icon: string;
    name: string;
    desc: string;
    pts: number;
    streakBonus: boolean;
    isChain: boolean;
    chainDays: number;
}

const missionSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    name: { type: String, required: true },
    desc: { type: String, required: true },
    pts: { type: Number, required: true },
    streakBonus: { type: Boolean, default: false },
    isChain: { type: Boolean, default: false },
    chainDays: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<IMission>('Mission', missionSchema);