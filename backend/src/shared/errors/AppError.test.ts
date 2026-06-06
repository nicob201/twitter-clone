import { AppError } from './AppError';

describe('AppError', () => {
  it('should create an operational error with status code and message', () => {
    const error = new AppError('Not found', 404);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe('AppError');
  });

  it('should allow non-operational errors', () => {
    const error = new AppError('Internal error', 500, false);
    expect(error.isOperational).toBe(false);
  });
});
