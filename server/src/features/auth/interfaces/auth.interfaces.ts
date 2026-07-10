import { IUser } from '../../../models/User.js';

/**
 * Interface representing standard JWT payload structures.
 */
export interface TokenPayload {
  userId: string;
  role: string;
  companyId?: string;
}

/**
 * Interface representing access and refresh token pairs.
 */
export interface TokenPairs {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    companyId: string;
  };
}

/**
 * Interface representing standard string-message action response structures.
 */
export interface ActionResponse {
  success: boolean;
  message: string;
}
