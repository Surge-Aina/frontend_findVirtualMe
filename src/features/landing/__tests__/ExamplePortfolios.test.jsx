import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toast } from "react-toastify";
import ExamplePortfolios from "../ExamplePortfolios";

const mockNavigate = jest.fn();
let mockLocation = { pathname: "/", state: null, hash: "", search: "", key: "default" };

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

jest.mock("react-toastify", () => ({
  toast: jest.fn(),
}));

describe("ExamplePortfolios", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    toast.mockClear();
    mockLocation = { pathname: "/", state: null, hash: "", search: "", key: "default" };
  });

  it("renders all example cards by default", () => {
    render(<ExamplePortfolios />);
    expect(screen.getByRole("heading", { name: /portfolios/i })).toBeInTheDocument();
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(screen.getByText("Healthcare Professional")).toBeInTheDocument();
    const grid = screen.getByRole("heading", { name: /portfolios/i }).parentElement.querySelector(".grid");
    expect(grid.querySelectorAll(":scope > div").length).toBe(8);
  });

  it("shows first three examples when navigated from about", () => {
    mockLocation = { pathname: "/examples", state: { from: "about" } };
    render(<ExamplePortfolios />);
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    expect(screen.queryByText("Photographer")).not.toBeInTheDocument();
  });

  it("filters to local-service occupations when from occupations", () => {
    mockLocation = { pathname: "/examples", state: { from: "occupations" } };
    render(<ExamplePortfolios />);
    expect(screen.getByText("Local Food Vendor")).toBeInTheDocument();
    expect(screen.getByText("Handyman/Local Repair Services")).toBeInTheDocument();
    expect(screen.getByText("Healthcare Professional")).toBeInTheDocument();
    expect(screen.getByText("Cleaner/Local Cleaning Services")).toBeInTheDocument();
    expect(screen.queryByText("Project Manager")).not.toBeInTheDocument();
  });

  it("navigates when card has a location", () => {
    render(<ExamplePortfolios />);
    fireEvent.click(screen.getByText("Data Scientist").closest("div.bg-white"));
    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/data-scientist");
  });

  it("toasts when card has no location", () => {
    render(<ExamplePortfolios />);
    fireEvent.click(screen.getByText("Software Engineer").closest("div.bg-white"));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("Coming Soon!");
  });
});
