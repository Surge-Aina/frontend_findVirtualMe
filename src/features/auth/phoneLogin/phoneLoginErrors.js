/**
 * Maps backend phone-login errors to short, user-facing copy.
 * @param {unknown} err Axios error or similar
 */
export function friendlyPhoneLoginError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (status === 429) {
    if (data?.error === "Too many requests") {
      return "Too many attempts. Wait a minute and try again.";
    }
    const message = typeof data?.message === "string" ? data.message : "";
    if (message.includes("region")) {
      return "Too many verification requests for this region. Try again later.";
    }
    if (message.includes("today")) {
      return "Too many verification requests today. Try again tomorrow or sign in with email.";
    }
    if (message.toLowerCase().includes("verify")) {
      return "Too many incorrect codes. Wait a few minutes before trying again.";
    }
  return "Too many requests. Please wait and try again.";
  }

  if (status === 400 && data?.code === "PHONE_COUNTRY_NOT_SUPPORTED") {
    return "Phone sign-in is not available for this country. Pick a supported country or use email.";
  }

  if (status === 400) {
    const message = typeof data?.message === "string" ? data.message : "";
    if (message === "Invalid request") {
      return "Enter a valid phone number for the selected country.";
    }
    if (message === "Unable to send verification code") {
      return "We could not send a code to this number. Check the number and try again.";
    }
    if (message === "Unable to verify code") {
      return "That code did not work. Check the SMS and try again.";
    }
  }

  if (status === 503) {
    return "Phone sign-in is temporarily unavailable. Use email and password instead.";
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  return "Something went wrong. Please try again.";
}