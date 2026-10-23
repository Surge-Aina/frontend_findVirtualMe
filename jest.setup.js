import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "node:util";

// Mock import.meta before any modules are imported
const importMetaEnv = {
  VITE_BACKEND_API: "http://localhost:5001",
  MODE: "test",
  DEV: false,
  PROD: false,
  SSR: false,
};

// Create a getter that returns the mock
Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      env: importMetaEnv,
    },
  },
  writable: true,
  configurable: true,
});

// Polyfill TextEncoder/TextDecoder for react-router / whatwg streams in JSDOM
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!Element.prototype.scrollBy) {
  Element.prototype.scrollBy = function () {};
}

// Google OAuth: tests render Auth without GoogleOAuthProvider
jest.mock("@react-oauth/google", () => ({
  __esModule: true,
  GoogleOAuthProvider: ({ children }) => children,
  GoogleLogin: () => null,
  googleLogout: jest.fn(),
  useGoogleLogin: () => ({ login: jest.fn() }),
  useGoogleOneTapLogin: () => {},
}));
