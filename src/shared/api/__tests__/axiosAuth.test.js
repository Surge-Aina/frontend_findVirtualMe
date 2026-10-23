jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("axiosAuth", () => {
  let requestUse;
  let responseUse;
  let requestSuccessHandler;
  let requestErrorHandler;
  let responseSuccessHandler;
  let responseErrorHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    localStorage.clear();

    requestUse = jest.fn((successFn, errorFn) => {
      requestSuccessHandler = successFn;
      requestErrorHandler = errorFn;
    });
    responseUse = jest.fn((successFn, errorFn) => {
      responseSuccessHandler = successFn;
      responseErrorHandler = errorFn;
    });

    jest.doMock("axios", () => ({
      create: jest.fn(() => ({
        interceptors: {
          request: { use: requestUse },
          response: { use: responseUse },
        },
      })),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function loadModule() {
    return require("../axiosAuth");
  }

  it("creates axios instance", () => {
    const axios = require("axios");
    loadModule();

    expect(axios.create).toHaveBeenCalled();
  });

  it("registers request and response interceptors", () => {
    loadModule();
    expect(requestUse).toHaveBeenCalled();
    expect(responseUse).toHaveBeenCalled();
  });

  describe("request interceptor", () => {
    beforeEach(() => {
      loadModule();
    });

    it("adds Authorization header when token exists", () => {
      localStorage.setItem("token", "test-token");
      const config = { headers: {} };

      const result = requestSuccessHandler(config);

      expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("does not add Authorization header when no token", () => {
      const config = { headers: {} };

      const result = requestSuccessHandler(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("returns config object", () => {
      const config = { headers: {}, url: "/test" };

      const result = requestSuccessHandler(config);

      expect(result).toEqual(expect.objectContaining({ url: "/test" }));
    });

    it("error handler rejects with error", async () => {
      const error = new Error("Request error");

      await expect(requestErrorHandler(error)).rejects.toThrow("Request error");
    });
  });

  describe("response interceptor", () => {
    beforeEach(() => {
      loadModule();
    });

    it("passes successful responses through", () => {
      const response = { status: 200, data: { ok: true } };
      expect(responseSuccessHandler(response)).toBe(response);
    });

    it("toasts a sign-in message on 401", async () => {
      const { toast } = require("react-toastify");
      const error = { response: { status: 401 }, config: {} };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(toast.error).toHaveBeenCalledWith(
        "Please sign in to continue.",
        expect.objectContaining({ toastId: "Please sign in to continue." })
      );
    });

    it("toasts a permission message on 403", async () => {
      const { toast } = require("react-toastify");
      const error = { response: { status: 403 }, config: {} };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(toast.error).toHaveBeenCalledWith(
        "You do not have permission to do that.",
        expect.objectContaining({ toastId: "You do not have permission to do that." })
      );
    });

    it("skips the toast when skipAuthToast is set", async () => {
      const { toast } = require("react-toastify");
      const error = { response: { status: 401 }, config: { skipAuthToast: true } };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("does not toast for other failures", async () => {
      const { toast } = require("react-toastify");
      const error = { response: { status: 500 }, config: {} };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe("authFailureMessage", () => {
    it("maps 401 and 403 and ignores other statuses", () => {
      const { authFailureMessage, SIGN_IN_MESSAGE, PERMISSION_MESSAGE } = loadModule();

      expect(authFailureMessage({ response: { status: 401 } })).toBe(SIGN_IN_MESSAGE);
      expect(authFailureMessage({ response: { status: 403 } })).toBe(PERMISSION_MESSAGE);
      expect(authFailureMessage({ response: { status: 404 } })).toBeNull();
      expect(authFailureMessage(new Error("network"))).toBeNull();
    });
  });
});
