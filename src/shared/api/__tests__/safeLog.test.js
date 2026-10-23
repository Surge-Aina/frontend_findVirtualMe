import { logApiError } from "../safeLog";

describe("logApiError", () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  test("logs method, path, and status only", () => {
    const error = {
      message: "Request failed",
      config: {
        method: "post",
        url: "https://api.example.com/api/auth/login?token=query-token",
        headers: { Authorization: "Bearer secret-token", "Content-Type": "application/json" },
        data: JSON.stringify({
          email: "person@example.com",
          password: "hunter2",
          token: "body-token",
        }),
      },
      response: {
        status: 401,
        data: { token: "response-token", error: "bad password" },
      },
    };

    logApiError(error, "Login failed");

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const logged = errorSpy.mock.calls[0];
    expect(logged).toEqual(["Login failed: POST /api/auth/login 401"]);

    const text = JSON.stringify(logged);
    expect(text).not.toMatch(/Authorization/i);
    expect(text).not.toMatch(/Bearer/);
    expect(text).not.toMatch(/secret-token/);
    expect(text).not.toMatch(/query-token/);
    expect(text).not.toMatch(/body-token/);
    expect(text).not.toMatch(/response-token/);
    expect(text).not.toMatch(/hunter2/);
    expect(text).not.toMatch(/password/i);
    expect(text).not.toMatch(/person@example.com/);
    expect(text).not.toMatch(/email/i);
  });

  test("does not print a request body when the error has no HTTP metadata", () => {
    logApiError(
      {
        config: { data: { password: "secret-pass", resume: "private text" } },
        response: { data: { token: "abc" } },
      },
      "Upload failed"
    );

    const text = JSON.stringify(errorSpy.mock.calls);
    expect(text).toContain("Upload failed: GET unknown no-status");
    expect(text).not.toMatch(/secret-pass|private text|password|token/i);
  });
});