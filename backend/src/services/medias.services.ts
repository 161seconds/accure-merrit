export interface CustomMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

class MediasService {
  async handleUploadImage(file: CustomMulterFile) {
    return {
      url: `/static/${file.filename}`,
      type: file.mimetype
    }
  }
}

const mediasService = new MediasService()
export default mediasService