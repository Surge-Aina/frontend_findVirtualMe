import { render, screen, waitFor } from "@testing-library/react";
import { MaintenanceProvider, useMaintenance } from "../MaintenanceProvider";
import { resetBackendHealthCheckForTests } from "../backendHealthCheck";

function Probe() {
  const { active } = useMaintenance();
  return <div data-testid="active">{active ? "yes" : "no"}</div>;
}

describe("maintenance mode", () => {
  beforeEach(() => {
    resetBackendHealthCheckForTests();
    delete import.meta.env.VITE_MAINTENANCE_MODE;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("env VITE_MAINTENANCE_MODE=true activates maintenance", async () => {
    import.meta.env.VITE_MAINTENANCE_MODE = "true";
    render(
      <MaintenanceProvider>
        <Probe />
      </MaintenanceProvider>
    );
    expect(screen.getByTestId("active")).toHaveTextContent("yes");
  });

  test("failed backend health check activates maintenance", async () => {
    global.fetch.mockRejectedValue(new Error("down"));
    render(
      <MaintenanceProvider>
        <Probe />
      </MaintenanceProvider>
    );
    await waitFor(() => expect(screen.getByTestId("active")).toHaveTextContent("yes"));
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});