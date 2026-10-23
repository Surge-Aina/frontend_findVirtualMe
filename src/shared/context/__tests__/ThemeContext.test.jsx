import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from "../ThemeContext";

jest.mock("axios");

function ThemeConsumer() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
      <button type="button" onClick={() => setTheme("dark")}>
        set dark
      </button>
      <button type="button" onClick={() => setTheme("invalid")}>
        set invalid
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("reads initial theme from localStorage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    render(
      <AuthContext.Provider value={{ user: null, token: null, setUser: jest.fn() }}>
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggleTheme switches light/dark and persists when logged in", async () => {
    const user = userEvent.setup();
    axios.patch.mockResolvedValue({ data: { user: { _id: "u1", appTheme: "dark" } } });
    const setUser = jest.fn();

    render(
      <AuthContext.Provider value={{ user: { _id: "u1", appTheme: "light" }, token: "tok", setUser }}>
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      </AuthContext.Provider>
    );

    await user.click(screen.getByRole("button", { name: /toggle/i }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(axios.patch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/users\/app-theme$/),
      { appTheme: "dark" },
      { headers: { Authorization: "Bearer tok" } }
    );
  });

  it("setTheme ignores invalid values", async () => {
    const user = userEvent.setup();

    render(
      <AuthContext.Provider value={{ user: null, token: null, setUser: jest.fn() }}>
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      </AuthContext.Provider>
    );

    await user.click(screen.getByRole("button", { name: /set invalid/i }));

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("syncs theme from user.appTheme when user id changes", () => {
    const setUser = jest.fn();
    const { rerender } = render(
      <AuthContext.Provider
        value={{ user: { _id: "a", appTheme: "light" }, token: "t", setUser }}
      >
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");

    rerender(
      <AuthContext.Provider
        value={{ user: { _id: "b", appTheme: "dark" }, token: "t", setUser }}
      >
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });
});
