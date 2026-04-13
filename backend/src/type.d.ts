import { Request } from 'express'
import { TokenPayload } from './models/request/user.requests'

declare module 'express' {
    interface Request {
        decoded_authorization?: TokenPayload
        decoded_refresh_token?: TokenPayload
    }
}