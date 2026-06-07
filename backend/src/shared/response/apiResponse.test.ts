import { successResponse, errorResponse } from './apiResponse.js';

describe('apiResponse', () => {
  it('should create a success response with data', () => {
    const result = successResponse({ id: 1, name: 'test' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 1, name: 'test' });
  });

  it('should create an error response with message', () => {
    const result = errorResponse('Something went wrong');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Something went wrong');
  });
});
