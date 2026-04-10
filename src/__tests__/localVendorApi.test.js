    // src/__tests__/Services/localVendorApi.test.js

    // We will use CommonJS require so we can control import order.
    jest.mock("axios", () => {
    const mockAxios = {
        create: jest.fn(),
    };
    return {
        __esModule: true,
        default: mockAxios,
    };
    });

    jest.mock("../features/portfolios/_legacy/local-vendor/context/VendorContext", () => ({
    __esModule: true,
    useVendor: jest.fn(),
    }));

    describe("useVendorApi", () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    };

    // These will be assigned once we require the mocks
    let useVendor;
    let useVendorApi;

    beforeAll(() => {
        // Get the mocked axios + VendorContext
        const axios = require("axios").default;
        ({ useVendor } = require("../features/portfolios/_legacy/local-vendor/context/VendorContext"));

        // When api.js calls axios.create(...), return our mock client
        axios.create.mockReturnValue(mockClient);

        // Now import the module under test AFTER axios.create is configured
        ({ useVendorApi } = require("../features/portfolios/_legacy/local-vendor/services/api"));
    });

    beforeEach(() => {
        // Just reset call history, not implementations
        mockClient.get.mockClear();
        mockClient.post.mockClear();
        mockClient.put.mockClear();
        mockClient.delete.mockClear();
        useVendor.mockClear();
    });

    test("returns no-op helpers when vendorId is missing", async () => {
        useVendor.mockReturnValue({ vendorId: null });

        const api = useVendorApi();

        await api.fetchFullPortfolio();
        await api.getGallery();

        expect(mockClient.get).not.toHaveBeenCalled();
        expect(mockClient.post).not.toHaveBeenCalled();
    });

    test("fetchFullPortfolio hits /vendor/:id/full", async () => {
        useVendor.mockReturnValue({ vendorId: "vendor-123" });
        mockClient.get.mockResolvedValueOnce({ data: { ok: true } });

        const api = useVendorApi();
        const data = await api.fetchFullPortfolio();

        expect(mockClient.get).toHaveBeenCalledWith("/vendor/vendor-123/full");
        expect(data).toEqual({ ok: true });
    });

    test("getGallery hits /gallery/:id", async () => {
    useVendor.mockReturnValue({ vendorId: "vendor-gallery" });
    mockClient.get.mockResolvedValueOnce({ data: { photos: [] } });

    const api = useVendorApi();
    const data = await api.getGallery();

    expect(mockClient.get).toHaveBeenCalledWith("/gallery/vendor-gallery");
    expect(data).toEqual({ photos: [] });
    });

    test("updateAbout puts to /about/:id", async () => {
    useVendor.mockReturnValue({ vendorId: "vendor-about" });
    mockClient.put.mockResolvedValueOnce({ data: { ok: true } });

    const api = useVendorApi();
    const payload = { description: "New about text" };

    const data = await api.updateAbout(payload);

    expect(mockClient.put).toHaveBeenCalledWith("/about/vendor-about", payload);
    expect(data).toEqual({ ok: true });
    });

    test("deleteMenuItem deletes /menu/:id/:itemId", async () => {
    useVendor.mockReturnValue({ vendorId: "vendor-menu" });
    mockClient.delete.mockResolvedValueOnce({ data: { success: true } });

    const api = useVendorApi();
    const data = await api.deleteMenuItem("item-123");

    expect(mockClient.delete).toHaveBeenCalledWith("/menu/vendor-menu/item-123");
    expect(data).toEqual({ success: true });
    });



    test("createMenuItem posts to /menu/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "abc" });
        mockClient.post.mockResolvedValueOnce({ data: { id: "item-1" } });

        const api = useVendorApi();

        const formData = new FormData();
        formData.append("name", "Pizza");

        const data = await api.createMenuItem(formData);

        expect(mockClient.post).toHaveBeenCalledWith("/menu/abc", formData);
        expect(data).toEqual({ id: "item-1" });
    });
    });
