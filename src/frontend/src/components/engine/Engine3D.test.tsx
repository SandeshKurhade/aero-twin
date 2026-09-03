import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_FAULTS } from "@/lib/simulation";

// The 3D engine renders through a WebGL canvas that jsdom cannot host. This
// characterization pins the component's public contract — the named export and
// the rpm/running/faults props that DashboardPage depends on — by stubbing the
// R3F canvas host. The internal scene geometry is intentionally NOT asserted:
// it is exactly what the redesign will change.
vi.mock("@react-three/fiber", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-three/fiber")>();
  return {
    ...actual,
    Canvas: () => <div data-ocid="canvas_host" />,
    // The animation loop only runs inside a live R3F canvas; jsdom has none, so
    // the frame callback is a no-op here.
    useFrame: () => {},
  };
});

// OrbitControls reads the R3F store via useThree, which only exists inside a
// live canvas; render it as an inert element in jsdom.
vi.mock("@react-three/drei", () => ({
  OrbitControls: () => <div data-ocid="orbit_controls_mock" />,
}));

import { Engine3D } from "@/components/engine/Engine3D";

describe("Engine3D public contract", () => {
  it("exports Engine3D as a component", () => {
    expect(typeof Engine3D).toBe("function");
  });

  it("renders the engine container with the expected ocid and aria label", () => {
    render(<Engine3D rpm={2800} running faults={EMPTY_FAULTS} />);
    const container = screen.getByTestId("engine_3d");
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute(
      "aria-label",
      "Interactive 3D four-cylinder piston engine",
    );
  });

  it("renders the canvas host for the props DashboardPage supplies", () => {
    render(<Engine3D rpm={3100} running={false} faults={EMPTY_FAULTS} />);
    // The canvas host is present; the component boundary that DashboardPage
    // relies on stays intact for a non-running engine.
    expect(screen.getByTestId("canvas_host")).toBeInTheDocument();
  });
});
