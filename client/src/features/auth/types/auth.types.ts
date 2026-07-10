export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterCompanyResponse {
  success: boolean;
  message: string;
}
