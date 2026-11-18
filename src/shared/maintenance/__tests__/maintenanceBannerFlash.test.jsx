import { render, screen, act } from "@testing-library/react";
import { MaintenanceProvider } from "../MaintenanceProvider";
import MaintenanceBanner from "@/shared/components/MaintenanceBanner";
import { resetBackendHealthCheckForTests } from "../backendHealthCheck";

describe("maintenance banner visibility", () => {
  beforeEach(() => {
    resetBackendHealthCheckForTests();
    delete import.meta.env.VITE_MAINTENANCE_MODE;
    import.meta.env.VITE_BACKEND_API = "https://api.example.test";
    global.fetch = jest.fn();
  });

  test("does not show banner before health check fails", async () => {
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    global.fetch.mockReturnValue(fetchPromise);

    render(
      <MaintenanceProvider>
        <MaintenanceBanner />
      </MaintenanceProvider>
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => {
      resolveFetch({ ok: true, status: 200 });
      await fetchPromise;
      await Promise.resolve();
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("shows banner only after health check fails", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 503 });

    render(
      <MaintenanceProvider>
        <MaintenanceBanner />
      </MaintenanceProvider>
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole("status")).toHaveTextContent(/temporarily unavailable/i);
  });
});