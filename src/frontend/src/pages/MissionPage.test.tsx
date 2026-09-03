import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EngineSimulationProvider } from "@/hooks/useEngineSimulation";
import MissionPage from "@/pages/MissionPage";

// The scrolling telemetry chart is a recharts SVG; the mission page's observable
// behavior (status, risk, health, fault injection) is what we assert.
vi.mock("@/components/charts/TelemetryChart", () => ({
  TelemetryChart: () => <div data-testid="telemetry_chart_mock" />,
}));

function renderMission() {
  return render(
    <EngineSimulationProvider>
      <MissionPage />
    </EngineSimulationProvider>,
  );
}

describe("MissionPage", () => {
  it("shows mission status, health, RUL, confidence and predicted fault", () => {
    renderMission();
    expect(screen.getByText("MALE-UAV Mission Control")).toBeInTheDocument();
    expect(screen.getByText("SYNTHETIC / DEMO DATA")).toBeInTheDocument();
    expect(screen.getByTestId("mission_status_badge")).toHaveTextContent(
      "NOMINAL",
    );
    expect(screen.getByText("Remaining Useful Life")).toBeInTheDocument();
    expect(screen.getByText("Model Confidence")).toBeInTheDocument();
    expect(screen.getByText("Predicted Fault")).toBeInTheDocument();
  });

  it("selecting a mission phase updates the current phase label", async () => {
    const user = userEvent.setup();
    renderMission();

    expect(screen.getByText(/Current phase: Orbit/i)).toBeInTheDocument();

    await user.click(screen.getByTestId("mission_phase_launch"));
    await waitFor(() => {
      expect(screen.getByText(/Current phase: Launch/i)).toBeInTheDocument();
    });
  });

  it("injecting a fault degrades mission status and risk and lists the fault", async () => {
    const user = userEvent.setup();
    renderMission();

    await user.click(screen.getByTestId("inject_fault_overheating"));

    const faultsPanel = screen.getByTestId("active_faults_panel");
    await waitFor(() => {
      expect(within(faultsPanel).getByText("Overheating")).toBeInTheDocument();
    });
    // The active faults panel lists the injected fault with its recommendation.
    expect(
      within(faultsPanel).getByText(
        /Reduce throttle and inspect the cooling system/i,
      ),
    ).toBeInTheDocument();
  });
});
