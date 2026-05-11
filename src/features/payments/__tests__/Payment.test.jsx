import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import Payment from "../Payment";

jest.mock("axios", () => {
  const interceptors = { request: { use: jest.fn() }, response: { use: jest.fn() } };
  return {
    __esModule: true,
    default: {
      post: jest.fn(() =>
        Promise.resolve({ data: { checkoutUrl: "https://pay.example/session" } })
      ),
      interceptors,
    },
  };
});

describe("Payment", () => {
  const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

  afterEach(() => {
    alertSpy.mockClear();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("alerts for free tier without posting checkout", () => {
    const post = axios.post;
    render(<Payment />);
    const getStarted = screen.getAllByText("Get Started");
    fireEvent.click(getStarted[0]);
    expect(alertSpy).toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
  });
});
