    // Co-located with local-vendor/services/api (F7).

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

    jest.mock("../../context/VendorContext", () => ({
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
        ({ useVendor } = require("../../context/VendorContext"));

        // When api.js calls axios.create(...), return our mock client
        axios.create.mockReturnValue(mockClient);

        // Now import the module under test AFTER axios.create is configured
        ({ useVendorApi } = require("../api"));
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

    test("getBanner hits /banner/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-banner" });
        mockClient.get.mockResolvedValueOnce({ data: { image: "x" } });
        const api = useVendorApi();
        const data = await api.getBanner();
        expect(mockClient.get).toHaveBeenCalledWith("/banner/v-banner");
        expect(data).toEqual({ image: "x" });
    });

    test("uploadAboutImages posts multipart to /about/:id/upload-grid-images", async () => {
        useVendor.mockReturnValue({ vendorId: "v-ab" });
        const fd = new FormData();
        mockClient.post.mockResolvedValueOnce({ data: { ok: true } });
        const api = useVendorApi();
        const data = await api.uploadAboutImages(fd);
        expect(mockClient.post).toHaveBeenCalledWith(
            "/about/v-ab/upload-grid-images",
            fd,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        expect(data).toEqual({ ok: true });
    });

    test("getMenuByCategory includes category query", async () => {
        useVendor.mockReturnValue({ vendorId: "v-m" });
        mockClient.get.mockResolvedValueOnce({ data: [] });
        const api = useVendorApi();
        await api.getMenuByCategory("Drinks");
        expect(mockClient.get).toHaveBeenCalledWith(
            "/menu/v-m?category=Drinks"
        );
    });

    test("getReviews hits /reviews/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-r" });
        mockClient.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
        const api = useVendorApi();
        const data = await api.getReviews();
        expect(mockClient.get).toHaveBeenCalledWith("/reviews/v-r");
        expect(data).toEqual([{ id: 1 }]);
    });

    test("createGalleryImage posts to /gallery/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-g" });
        const fd = new FormData();
        mockClient.post.mockResolvedValueOnce({ data: { id: "img1" } });
        const api = useVendorApi();
        await api.createGalleryImage(fd);
        expect(mockClient.post).toHaveBeenCalledWith("/gallery/v-g", fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    });

    test("getTaggedImages hits /tagged/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-t" });
        mockClient.get.mockResolvedValueOnce({ data: [] });
        const api = useVendorApi();
        await api.getTaggedImages();
        expect(mockClient.get).toHaveBeenCalledWith("/tagged/v-t");
    });

    test("createBanner posts to /banner/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-b" });
        const fd = new FormData();
        mockClient.post.mockResolvedValueOnce({ data: { id: "b1" } });
        const api = useVendorApi();
        const data = await api.createBanner(fd);
        expect(mockClient.post).toHaveBeenCalledWith("/banner/v-b", fd);
        expect(data).toEqual({ id: "b1" });
    });

    test("updateBanner puts /banner/:vendor/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-b" });
        const fd = new FormData();
        mockClient.put.mockResolvedValueOnce({ data: { ok: 1 } });
        const api = useVendorApi();
        await api.updateBanner("bid", fd);
        expect(mockClient.put).toHaveBeenCalledWith("/banner/v-b/bid", fd);
    });

    test("deleteBanner deletes /banner/:vendor/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-b" });
        mockClient.delete.mockResolvedValueOnce({ data: { ok: 1 } });
        const api = useVendorApi();
        await api.deleteBanner("bid");
        expect(mockClient.delete).toHaveBeenCalledWith("/banner/v-b/bid");
    });

    test("getAbout hits /about/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-a" });
        mockClient.get.mockResolvedValueOnce({ data: { text: "x" } });
        const api = useVendorApi();
        const data = await api.getAbout();
        expect(mockClient.get).toHaveBeenCalledWith("/about/v-a");
        expect(data).toEqual({ text: "x" });
    });

    test("updateMenuItem puts multipart to /menu/:vendor/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-mu" });
        const fd = new FormData();
        mockClient.put.mockResolvedValueOnce({ data: { ok: 1 } });
        const api = useVendorApi();
        await api.updateMenuItem("mid", fd);
        expect(mockClient.put).toHaveBeenCalledWith("/menu/v-mu/mid", fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    });

    test("updateGalleryImage puts multipart to /gallery/:vendor/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-gu" });
        const fd = new FormData();
        mockClient.put.mockResolvedValueOnce({ data: { ok: 1 } });
        const api = useVendorApi();
        await api.updateGalleryImage("gid", fd);
        expect(mockClient.put).toHaveBeenCalledWith("/gallery/v-gu/gid", fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    });

    test("deleteGalleryImage deletes /gallery/:vendor/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-gd" });
        mockClient.delete.mockResolvedValueOnce({ data: { ok: 1 } });
        const api = useVendorApi();
        await api.deleteGalleryImage("gid");
        expect(mockClient.delete).toHaveBeenCalledWith("/gallery/v-gd/gid");
    });

    test("createReview posts to /reviews/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-rc" });
        mockClient.post.mockResolvedValueOnce({ data: { id: "r1" } });
        const api = useVendorApi();
        const payload = { stars: 5 };
        const data = await api.createReview(payload);
        expect(mockClient.post).toHaveBeenCalledWith("/reviews/v-rc", payload);
        expect(data).toEqual({ id: "r1" });
    });

    test("updateReview puts /reviews/:vendor/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-ru" });
        mockClient.put.mockResolvedValueOnce({ data: { ok: 1 } });
        const api = useVendorApi();
        await api.updateReview("r1", { stars: 4 });
        expect(mockClient.put).toHaveBeenCalledWith("/reviews/v-ru/r1", { stars: 4 });
    });

    test("deleteReview deletes /reviews/:vendor/:id", async () => {
        useVendor.mockReturnValue({ vendorId: "v-rd" });
        mockClient.delete.mockResolvedValueOnce({ data: { ok: 1 } });
        const api = useVendorApi();
        await api.deleteReview("r1");
        expect(mockClient.delete).toHaveBeenCalledWith("/reviews/v-rd/r1");
    });

    test("uploadTaggedImage posts multipart to /tagged/:id/upload", async () => {
        useVendor.mockReturnValue({ vendorId: "v-tu" });
        const fd = new FormData();
        mockClient.post.mockResolvedValueOnce({ data: { ok: 1 } });
        const api = useVendorApi();
        await api.uploadTaggedImage(fd);
        expect(mockClient.post).toHaveBeenCalledWith("/tagged/v-tu/upload", fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    });

    test("createTag posts to tagged tags endpoint", async () => {
        useVendor.mockReturnValue({ vendorId: "v-tc" });
        mockClient.post.mockResolvedValueOnce({ data: { ok: 1 } });
        const api = useVendorApi();
        const payload = { x: 1 };
        await api.createTag("tid", payload);
        expect(mockClient.post).toHaveBeenCalledWith(
            "/tagged/v-tc/tid/tags",
            payload
        );
    });

    test("deleteTag deletes tag index on tagged image", async () => {
        useVendor.mockReturnValue({ vendorId: "v-td" });
        mockClient.delete.mockResolvedValueOnce({ data: { ok: 1 } });
        const api = useVendorApi();
        await api.deleteTag("tid", 2);
        expect(mockClient.delete).toHaveBeenCalledWith(
            "/tagged/v-td/tid/tags/2"
        );
    });

    test("getMenuByCategory encodes category in query string", async () => {
        useVendor.mockReturnValue({ vendorId: "v-mc" });
        mockClient.get.mockResolvedValueOnce({ data: [] });
        const api = useVendorApi();
        await api.getMenuByCategory("A & B");
        expect(mockClient.get).toHaveBeenCalledWith(
            "/menu/v-mc?category=" + encodeURIComponent("A & B")
        );
    });
    });
