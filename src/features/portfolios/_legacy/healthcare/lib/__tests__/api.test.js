import { api, API_BASE_URL } from "../api";

describe("healthcare api", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.setItem("token", "test-token");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("exposes API_BASE_URL from env", () => {
    expect(API_BASE_URL).toBeTruthy();
    expect(typeof API_BASE_URL).toBe("string");
  });

  describe("public endpoints", () => {
    it("getPracticeData returns json on success", async () => {
      const payload = { name: "P" };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => payload,
      });

      const result = await api.getPracticeData("id1");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/practice/id1`,
        expect.objectContaining({ method: "GET" })
      );
      expect(result).toEqual(payload);
    });

    it("getPracticeData throws when response not ok", async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(api.getPracticeData("bad")).rejects.toThrow(/API error: 404/);
    });

    it("getPracticeBySubdomain calls subdomain URL", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await api.getPracticeBySubdomain("clinic");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/subdomain/clinic`,
        expect.any(Object)
      );
    });

    it("contactMe posts JSON body", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

      const form = { name: "a", email: "b", message: "c" };
      await api.contactMe(form);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/contact`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(form),
        })
      );
    });

    it("contactMe throws with server error message when not ok", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Bad email" }),
      });

      await expect(
        api.contactMe({ name: "a", email: "x", message: "m" })
      ).rejects.toThrow(/Bad email/);
    });

    it("getDemoData GETs /healthcare/demo", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ demo: true }),
      });

      const data = await api.getDemoData();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/demo`,
        expect.objectContaining({ method: "GET" })
      );
      expect(data).toEqual({ demo: true });
    });

    it("getPublicPortfolios GETs /healthcare/public/all", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await api.getPublicPortfolios();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/public/all`,
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("protected endpoints", () => {
    it("createHealthcarePortfolio throws without token", async () => {
      localStorage.removeItem("token");

      await expect(api.createHealthcarePortfolio()).rejects.toThrow(/log in/i);
    });

    it("createHealthcarePortfolio posts with bearer token", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "new" }),
      });

      await api.createHealthcarePortfolio();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/create`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    it("getAdminData uses portfolio id in path when provided", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ practice: {} }),
      });

      await api.getAdminData("abc123");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/admin/data/abc123`,
        expect.any(Object)
      );
    });

    it("saveAdminData posts stringified data with id in URL", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const data = { _id: "x1", practice: { name: "N" } };
      await api.saveAdminData(data, "x1");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/admin/data/x1`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(data),
        })
      );
    });

    it("getS3UploadUrl includes contentLength when provided", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ uploadUrl: "u", publicUrl: "p" }),
      });

      await api.getS3UploadUrl({ fileType: "image/png", contentLength: 1234 });

      const [, init] = global.fetch.mock.calls[0];
      expect(JSON.parse(init.body)).toEqual({
        fileType: "image/png",
        contentLength: 1234,
      });
    });

    it("getS3UploadUrl omits contentLength when not provided", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ uploadUrl: "u", publicUrl: "p" }),
      });

      await api.getS3UploadUrl({ fileType: "image/jpeg" });

      const [, init] = global.fetch.mock.calls[0];
      expect(JSON.parse(init.body)).toEqual({ fileType: "image/jpeg" });
    });

    it("getS3UploadUrl throws without token", async () => {
      localStorage.removeItem("token");

      await expect(
        api.getS3UploadUrl({ fileType: "image/png" })
      ).rejects.toThrow(/log in/i);
    });

    it("getMyPortfolios GETs with bearer token", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "a" }],
      });

      const rows = await api.getMyPortfolios();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/my-portfolios`,
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
      expect(rows).toEqual([{ id: "a" }]);
    });

    it("updateSubdomain posts with portfolio id in path when provided", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.updateSubdomain("clinic", "pid1");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/admin/subdomain/pid1`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ subdomain: "clinic" }),
        })
      );
    });

    it("togglePublicStatus posts isPublic with portfolio id", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.togglePublicStatus(true, "pid2");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/admin/toggle-public/pid2`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ isPublic: true }),
        })
      );
    });

    it("deletePortfolio DELETEs with portfolio id", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deleted: true }),
      });

      await api.deletePortfolio("pid3");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/admin/delete/pid3`,
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("getAdminData uses generic admin path when portfolioId omitted", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await api.getAdminData();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/admin/data`,
        expect.any(Object)
      );
    });

    it("saveAdminData uses data._id when portfolioId not passed", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const data = { _id: "fromBody", practice: {} };
      await api.saveAdminData(data);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/healthcare/admin/data/fromBody`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(data),
        })
      );
    });
  });

  describe("uploadImageToS3", () => {
    it("uploads file and returns publicUrl", async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            uploadUrl: "https://s3.example/put",
            publicUrl: "https://cdn.example/img.jpg",
          }),
        })
        .mockResolvedValueOnce({ ok: true });

      const file = new File(["x"], "a.png", { type: "image/png" });

      const url = await api.uploadImageToS3(file);

      expect(url).toBe("https://cdn.example/img.jpg");
      expect(global.fetch).toHaveBeenCalledTimes(2);
      const putCall = global.fetch.mock.calls[1];
      expect(putCall[0]).toBe("https://s3.example/put");
      expect(putCall[1]).toMatchObject({
        method: "PUT",
        body: file,
      });
    });

    it("wraps failures in Image upload failed", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "nope" }),
      });

      const file = new File(["x"], "a.png", { type: "image/png" });

      await expect(api.uploadImageToS3(file)).rejects.toThrow("Image upload failed");
    });
  });
});
