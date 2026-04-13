import { WishCategory, IncenseType } from '~/constants/enums'

export interface CreateWishReqBody {
    category: WishCategory
    content: string
    incense_type?: IncenseType
}

export interface WishQuery {
    page?: string
    limit?: string
    category?: string
}