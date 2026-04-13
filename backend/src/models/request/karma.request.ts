import { KarmaLogType } from '~/constants/enums'

export interface CreateKarmaLogReqBody {
    type: KarmaLogType
    title: string
    description?: string
    points: number
    category?: string
}

export interface UpdateKarmaLogReqBody {
    title?: string
    description?: string
    points?: number
    category?: string
}

export interface KarmaLogQuery {
    type?: KarmaLogType
    category?: string
    page?: string
    limit?: string
    startDate?: string
    endDate?: string
}