export const MAX_FILE_SIZE_MB = 2;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export function validateImageFile(file) {
  if (!file) return { valid: false, error: "No file selected" };

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: `File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`,
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPG and PNG are allowed.",
    };
  }

  return { valid: true, error: null };
}
