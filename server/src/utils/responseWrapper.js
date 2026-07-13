export class ApiResponse {
   __init() {this.success = true}
  
  constructor(
     statusCode,
     data,
     message = 'Success'
  ) {;this.statusCode = statusCode;this.data = data;this.message = message;ApiResponse.prototype.__init.call(this);}
}

export class ApiError extends Error {
   __init2() {this.success = false}
  
  constructor(
     statusCode,
    message,
     errors = [],
    stack = ''
  ) {
    super(message);this.statusCode = statusCode;this.errors = errors;ApiError.prototype.__init2.call(this);;
    this.statusCode = statusCode;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
