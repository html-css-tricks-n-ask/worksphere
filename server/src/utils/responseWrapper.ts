export class ApiResponse<T = any> {
  public success: boolean = true;
  
  constructor(
    public statusCode: number,
    public data: T,
    public message: string = 'Success'
  ) {}
}

export class ApiError extends Error {
  public success: boolean = false;
  
  constructor(
    public statusCode: number,
    message: string,
    public errors: any[] = [],
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
