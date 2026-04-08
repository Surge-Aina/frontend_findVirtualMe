describe('axiosAuth', () => {
  let mockInterceptorUse;
  let requestSuccessHandler;
  let requestErrorHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    localStorage.clear();

    // Capture the interceptor handlers
    mockInterceptorUse = jest.fn((successFn, errorFn) => {
      requestSuccessHandler = successFn;
      requestErrorHandler = errorFn;
    });

    jest.doMock('axios', () => ({
      create: jest.fn(() => ({
        interceptors: {
          request: {
            use: mockInterceptorUse,
          },
        },
      })),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

 it('creates axios instance', () => {
  const axios = require('axios');
  require('../../utils/axiosAuth');
  
  expect(axios.create).toHaveBeenCalled();
});

  it('registers request interceptor', () => {
    require('../../utils/axiosAuth');
    expect(mockInterceptorUse).toHaveBeenCalled();
  });

  describe('request interceptor', () => {
    beforeEach(() => {
      require('../../utils/axiosAuth');
    });

    it('adds Authorization header when token exists', () => {
      localStorage.setItem('token', 'test-token');
      const config = { headers: {} };

      const result = requestSuccessHandler(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('does not add Authorization header when no token', () => {
      const config = { headers: {} };

      const result = requestSuccessHandler(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('returns config object', () => {
      const config = { headers: {}, url: '/test' };

      const result = requestSuccessHandler(config);

      expect(result).toEqual(expect.objectContaining({ url: '/test' }));
    });

    it('error handler rejects with error', async () => {
      const error = new Error('Request error');

      await expect(requestErrorHandler(error)).rejects.toThrow('Request error');
    });
  });
});