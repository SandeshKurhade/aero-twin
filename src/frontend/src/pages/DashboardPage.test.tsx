import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EngineSimulationProvider } from "@/hooks/useEngineSimulation";
import DashboardPage from "@/pages/DashboardPage";

// The 3D engine uses a WebGL canvas that jsdom cannot host; the dashboard's
// observable behavior (health, gauges, alerts, fault injection) is what we
// assert, so the canvas is stubbed out.
vi.mock("@/components/engine/Engine3D", () => ({
  Engine3D: () => <div data-testid="engine_3d_mock" />,
}));

function renderDashboard() {
  return render(
    <EngineSimulationProvider>
      <DashboardPage />
    </EngineSimulationProvider>,
  );
}

describe("DashboardPage", () => {
  it("loads and shows the health score, predicted fault, RUL and demo badge", () => {
    renderDashboard();
    expect(screen.getByText("MALE UAV · Engine Health")).toBeInTheDocument();
    expect(screen.getByText("SYNTHETIC DEMO DATA")).toBeInTheDocument();
    expect(screen.getByTestId("health_score")).toBeInTheDocument();
    expect(screen.getByTestId("predicted_fault")).toHaveTextContent("Normal");
    expect(screen.getByTestId("rul")).toBeInTheDocument();
    expect(screen.getByTestId("confidence")).toBeInTheDocument();
  });

  it("shows live gauges and an empty alert panel initially", () => {
    renderDashboard();
    expect(screen.getByText("Live Telemetry")).toBeInTheDocument();
    // Gauge labels appear both in the SVG and the label span.
    expect(screen.getAllByText("RPM").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cylinder Head Temp").length).toBeGreaterThan(0);
    expect(screen.getByText("All systems nominal")).toBeInTheDocument();
  });

  it("injecting the Overheating fault raises CHT, lowers health and RUL, and raises an alert with a maintenance recommendation", async () => {
    const user = userEvent.setup();
    renderDashboard();

    const initialHealth = Number(
      screen.getByTestId("health_score").textContent,
    );
    const initialRul = Number(screen.getByTestId("rul").textContent);

    await user.click(screen.getByTestId("fault_injector.overheating"));

    // The detection chain runs on the next tick; wait for the alert to appear.
    const alertPanel = screen.getByTestId("alert_panel");
    await waitFor(() => {
      expect(within(alertPanel).getByText("Overheating")).toBeInTheDocument();
    });

    // Alert panel shows the maintenance recommendation.
    expect(
      within(alertPanel).getByText(
        /Reduce throttle and inspect the cooling system/i,
      ),
    ).toBeInTheDocument();

    // Health and RUL drop below their initial values.
    await waitFor(() => {
      expect(
        Number(screen.getByTestId("health_score").textContent),
      ).toBeLessThan(initialHealth);
      expect(Number(screen.getByTestId("rul").textContent)).toBeLessThan(
        initialRul,
      );
    });
  });

  it("injecting Low Oil Pressure triggers a lubrication warning and is detected as a fault", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByTestId("fault_injector.lowOilPressure"));

    const alertPanel = screen.getByTestId("alert_panel");
    await waitFor(() => {
      expect(
        within(alertPanel).getByText("Low Oil Pressure"),
      ).toBeInTheDocument();
    });
    expect(
      within(alertPanel).getByText(/Land at the nearest suitable field/i),
    ).toBeInTheDocument();
  });

  it("clearing faults restores the nominal alert state", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByTestId("fault_injector.overheating"));
    const alertPanel = screen.getByTestId("alert_panel");
    await waitFor(() => {
      expect(within(alertPanel).getByText("Overheating")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("fault_injector.clear"));
    await waitFor(() => {
      expect(
        within(alertPanel).getByText("All systems nominal"),
      ).toBeInTheDocument();
    });
  });

  it("changing the mission phase updates the displayed mission label", async () => {
    const user = userEvent.setup();
    renderDashboard();

    // Default phase is Orbit.
    expect(screen.getByText(/Mission: Orbit/i)).toBeInTheDocument();

    await user.click(screen.getByTestId("mission_phase.launch"));
    await waitFor(() => {
      expect(screen.getByText(/Mission: Launch/i)).toBeInTheDocument();
    });
  });
});
