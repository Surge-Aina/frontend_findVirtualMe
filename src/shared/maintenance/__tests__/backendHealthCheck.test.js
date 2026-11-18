import { checkBackendHealthOnce, resetBackendHealthCheckForTests } from "../backendHealthCheck";

describe("checkBackendHealthOnce", () => {
  beforeEach(() => {
    resetBackendHealthCheckForTests();
    global.fetch = jest.fn();
  });

  test("skips probe for loopback API hosts", async () => {
    import.meta.env.VITE_BACKEND_API = "http://127.0.0.1:4010";
    const ok = await checkBackendHealthOnce();
    expect(ok).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});