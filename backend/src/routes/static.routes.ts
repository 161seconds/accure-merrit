import { Router } from 'express'
import express from 'express'
import { UPLOAD_DIR } from '~/constants/dir'

const staticRouter = Router()

staticRouter.use('/', express.static(UPLOAD_DIR))

export default staticRouter