import React from "react";
import { render } from "@testing-library/react";
import { AuthContext } from "@/shared/context/AuthContext";
import { canEditPortfolio } from "../features/portfolios/_legacy/local-vendor/services/auth";

const renderWithUser = (user, vendorId, callback) => {
  const Result = () => {
    const allowed = canEditPortfolio(user, vendorId);
    callback(allowed);
    return null;
  };

  render(
    <AuthContext.Provider value={{ user }}>
      <Result />
    </AuthContext.Provider>
  );
};

describe("canEditPortfolio", () => {
  test("returns false when no user in context", () => {
    const spy = jest.fn();
    renderWithUser(null, "vendor-1", spy);

    expect(spy).toHaveBeenCalledWith(false);
  });

  test("allows admin user regardless of portfolios", () => {
    const spy = jest.fn();
    const user = { role: "admin", portfolios: [] };

    renderWithUser(user, "any-vendor", spy);

    expect(spy).toHaveBeenCalledWith(true);
  });

  test("allows owner of portfolio", () => {
    const spy = jest.fn();
    const user = { role: "customer", portfolios: ["vendor-1", "vendor-2"] };

    renderWithUser(user, "vendor-2", spy);

    expect(spy).toHaveBeenCalledWith(true);
  });

  test("denies non-admin non-owner", () => {
    const spy = jest.fn();
    const user = { role: "customer", portfolios: ["vendor-1"] };

    renderWithUser(user, "vendor-99", spy);

    expect(spy).toHaveBeenCalledWith(false);
  });
});
