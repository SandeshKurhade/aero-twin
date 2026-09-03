import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_FAULTS } from "@/lib/simulation";

// The 3D engine renders through a WebGL canvas that jsdom cannot host. To
// assert the fault-highlighting behavior, the R3F canvas host is stubbed to
// render its children so the procedural scene tree materializes as DOM
// elements whose material props (emissive color) are readable.
vi.mock("@react-three/fiber", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-three/fiber")>();
  return {
    ...actual,
    Canvas: ({ children }: { children: React.ReactNode }) => (
      <div data-ocid="canvas_host">{children}</div>
    ),
    useFrame: () => {},
  };
});

vi.mock("@react-three/drei", () => ({
  OrbitControls: () => <div data-ocid="orbit_controls_mock" />,
}));

import { Engine3D } from "@/components/engine/Engine3D";

describe("Engine3D fault highlighting", () => {
  it("highlights the cylinder barrels when the overheating fault is injected", () => {
    const { container } = render(
      <Engine3D
        rpm={2800}
        running
        faults={{ ...EMPTY_FAULTS, overheating: true }}
      />,
    );

    // The cylinder barrel material carries the overheating emissive color.
    const barrelMaterials = Array.from(
      container.querySelectorAll(
        'meshstandardmaterial[emissive="oklch(0.62 0.2 25)"]',
      ),
    );
    expect(barrelMaterials.length).toBeGreaterThan(0);
  });

  it("does not highlight cylinders when no fault is injected", () => {
    const { container } = render(
      <Engine3D rpm={2800} running faults={EMPTY_FAULTS} />,
    );

    const barrelMaterials = Array.from(
      container.querySelectorAll(
        'meshstandardmaterial[emissive="oklch(0.62 0.2 25)"]',
      ),
    );
    expect(barrelMaterials).toHaveLength(0);
  });
});
