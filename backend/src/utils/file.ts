import fs from 'fs'
import { UPLOAD_DIR, UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  ;[UPLOAD_DIR, UPLOAD_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}