import { jest } from '@jest/globals';
import { authService } from '../src/features/auth/index.js';
import { companyRepository } from '../src/repositories/company.repository.js';
import { userRepository } from '../src/repositories/user.repository.js';
import { emailService } from '../src/services/email/email.service.js';
import { ApiError } from '../src/utils/responseWrapper.js';

describe('AuthService Integration & Registration Suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerCompany', () => {
    it('should throw an error if company email already exists', async () => {
      const findCompanySpy = jest.spyOn(companyRepository, 'findByEmail').mockResolvedValue({ id: 'comp_1' } );
      const userCreateSpy = jest.spyOn(userRepository, 'create');

      await expect(
        authService.registerCompany(
          { name: 'Acme Corp', email: 'exist@acme.com' },
          { firstName: 'Jane', lastName: 'Doe', email: 'admin@acme.com', password: 'Password123!' }
        )
      ).rejects.toThrow(ApiError);

      expect(findCompanySpy).toHaveBeenCalledWith('exist@acme.com');
      expect(userCreateSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if admin email already exists', async () => {
      const findCompanySpy = jest.spyOn(companyRepository, 'findByEmail').mockResolvedValue(null);
      const findUserSpy = jest.spyOn(userRepository, 'findByEmail').mockResolvedValue({ id: 'usr_1' } );
      const userCreateSpy = jest.spyOn(userRepository, 'create');

      await expect(
        authService.registerCompany(
          { name: 'Acme Corp', email: 'new@acme.com' },
          { firstName: 'Jane', lastName: 'Doe', email: 'admin@acme.com', password: 'Password123!' }
        )
      ).rejects.toThrow(ApiError);

      expect(findUserSpy).toHaveBeenCalledWith('admin@acme.com');
      expect(userCreateSpy).not.toHaveBeenCalled();
    });

    it('should successfully register company and admin and trigger verify email link', async () => {
      jest.spyOn(companyRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      
      const mockCompany = { id: 'comp_id_123', name: 'Acme Corp', slug: 'acme-corp' };
      const mockAdmin = { id: 'usr_id_456', firstName: 'Jane', lastName: 'Doe', email: 'admin@acme.com' };
      
      const companyCreateSpy = jest.spyOn(companyRepository, 'create').mockResolvedValue(mockCompany );
      const userCreateSpy = jest.spyOn(userRepository, 'create').mockResolvedValue(mockAdmin );
      const companyUpdateSpy = jest.spyOn(companyRepository, 'update').mockResolvedValue(mockCompany );
      const emailSpy = jest.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue(true );

      const result = await authService.registerCompany(
        { name: 'Acme Corp', email: 'new@acme.com' },
        { firstName: 'Jane', lastName: 'Doe', email: 'admin@acme.com', password: 'Password123!' }
      );

      expect(result.company.id).toBe(mockCompany.id);
      expect(result.admin.email).toBe(mockAdmin.email);
      expect(companyCreateSpy).toHaveBeenCalled();
      expect(userCreateSpy).toHaveBeenCalled();
      expect(emailSpy).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw 401 on incorrect credentials password or missing user', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      await expect(
        authService.login('notexist@acme.com', 'wrongpassword')
      ).rejects.toThrow(ApiError);
    });
  });
});
