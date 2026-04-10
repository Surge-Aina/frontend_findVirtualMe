    import {
    validateImageFile,
    MAX_FILE_SIZE_MB,
    ALLOWED_IMAGE_TYPES,
    } from "../features/portfolios/_legacy/local-vendor/services/fileValidator";

    const makeFile = (overrides = {}) => ({
    size: 1000,
    type: "image/jpeg",
    ...overrides,
    });

    describe("validateImageFile", () => {
    test("returns invalid when no file is provided", () => {
        const result = validateImageFile(null);
        expect(result).toEqual({ valid: false, error: "No file selected" });
    });

    test("rejects files larger than MAX_FILE_SIZE_MB", () => {
        const bigSize = MAX_FILE_SIZE_MB * 1024 * 1024 + 1;
        const file = makeFile({ size: bigSize });

        const result = validateImageFile(file);

        expect(result.valid).toBe(false);
        expect(result.error).toContain(`${MAX_FILE_SIZE_MB}MB`);
    });

    test("rejects files with disallowed MIME types", () => {
        const file = makeFile({ type: "image/gif" });

        const result = validateImageFile(file);

        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/Invalid file type/i);
    });

    test("accepts valid image files", () => {
        for (const type of ALLOWED_IMAGE_TYPES) {
        const file = makeFile({ type });

        const result = validateImageFile(file);

        expect(result).toEqual({ valid: true, error: null });
        }
    });
    });
