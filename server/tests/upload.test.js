import { jest } from '@jest/globals';

// Set dummy env variables BEFORE importing anything so isConfigured resolves to true
process.env.CLOUDINARY_CLOUD_NAME = 'dummy_cloud';
process.env.CLOUDINARY_API_KEY = 'dummy_key';
process.env.CLOUDINARY_API_SECRET = 'dummy_secret';

import { cloudinary } from '../src/config/cloudinary.js';
import { uploadService } from '../src/services/upload.service.js';

describe('UploadService File Upload & Destruction Suite', () => {
  let mockUploadStream;
  let mockDestroy;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock cloudinary upload_stream
    mockUploadStream = (jest.spyOn(cloudinary.uploader, 'upload_stream') ).mockImplementation((options, callback) => {
      callback(null, {
        secure_url: 'https://cloudinary.com/logo.png',
        public_id: 'worksphere/company-logos/logo_123',
      });
      return {
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn().mockReturnThis(),
        once: jest.fn().mockReturnThis(),
        emit: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis(),
      } ;
    });

    // Mock cloudinary destroy
    mockDestroy = jest.spyOn(cloudinary.uploader, 'destroy').mockResolvedValue({ result: 'ok' });
  });

  describe('uploadCompanyLogo', () => {
    it('should invoke cloudinary stream upload and return assets urls', async () => {
      const buffer = Buffer.from('dummy image data');
      const result = await uploadService.uploadCompanyLogo(buffer);

      expect(result.url).toBe('https://cloudinary.com/logo.png');
      expect(result.publicId).toBe('worksphere/company-logos/logo_123');
      expect(mockUploadStream).toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should call cloudinary destroy and return true', async () => {
      const success = await uploadService.deleteFile('worksphere/company-logos/logo_123');
      expect(success).toBe(true);
      expect(mockDestroy).toHaveBeenCalledWith('worksphere/company-logos/logo_123');
    });
  });
});
