import { error } from 'console'
import jwt from 'jsonwebtoken'
import { resolve } from 'path'
import { TokenPayload } from '~/models/request/user.requests'

export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: any //
  privateKey: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resole, reject) => {
    jwt.sign(payload, privateKey as string, options, function (err, token) {
      if (err) throw reject(err)
      else resole(token as string)
    })
  })
}
//

export const verifyToken = ({
  token, //
  privateKey
}: {
  token: string
  privateKey: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, privateKey, (error, decoded) => {
      if (error) throw reject(error)
      resolve(decoded as TokenPayload)
    })
  })
}
