import { Readable } from 'stream';
import { cloudinary, isConfigured } from '../config/cloudinary.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/responseWrapper.js';


export interface UploadResult {
  url: string;
  publicId: string;
}

class UploadService {
  private uploadStream(fileBuffer: Buffer, folder: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      if (!isConfigured) {
        // Fallback mock upload for local development
        const mockPublicId = `${folder.replace(/\//g, '_')}_mock_${Date.now()}`;
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dummy';
        const mockUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1/${folder}/${mockPublicId}.png`;
        logger.info(`[Upload Service Mock] Uploaded file to mock folder "${folder}". Mock URL: ${mockUrl}`);
        return resolve({ url: mockUrl, publicId: mockPublicId });
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error || !result) {
            logger.error(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`);
            return reject(new ApiError(500, `Cloudinary upload failed: ${error?.message || 'Unknown error'}`));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      // Pipe buffer into the Cloudinary upload write stream
      const stream = Readable.from(fileBuffer);
      stream.pipe(uploadStream);
    });
  }

  async uploadCompanyLogo(fileBuffer: Buffer): Promise<UploadResult> {
    return this.uploadStream(fileBuffer, 'worksphere/company-logos');
  }

  async uploadAvatar(fileBuffer: Buffer): Promise<UploadResult> {
    return this.uploadStream(fileBuffer, 'worksphere/profile-images');
  }

  async uploadDocument(fileBuffer: Buffer): Promise<UploadResult> {
    return this.uploadStream(fileBuffer, 'worksphere/documents');
  }

  async deleteFile(publicId: string): Promise<boolean> {
    if (!isConfigured || publicId.includes('_mock_')) {
      logger.info(`[Upload Service Mock] Deleted mock file with public ID: ${publicId}`);
      return true;
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      logger.error(`Cloudinary file destruction failed: ${(error as Error).message}`);
      throw new ApiError(500, `Cloudinary delete operation failed: ${(error as Error).message}`);
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;
