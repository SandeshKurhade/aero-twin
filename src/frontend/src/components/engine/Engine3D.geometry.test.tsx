import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_FAULTS } from "@/lib/simulation";

// The 3D engine renders through a WebGL canvas that jsdom cannot host. To
// assert the redesigned boxer geometry, the R3F canvas host is stubbed to
// render its children so the procedural scene tree materializes as DOM
// elements whose geometry props (position/args/material color) are readable.
vi.mock("@react-three/fiber", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-three/fiber")>();
  return {
    ...actual,
    Canvas: ({ children }: { children: React.ReactNode }) => (
      <div data-ocid="canvas_host">{children}</div>
    ),
    // The animation loop only runs inside a live R3F canvas; jsdom has none, so
    // the frame callback is a no-op here.
    useFrame: () => {},
  };
});

vi.mock("@react-three/drei", () => ({
  OrbitControls: () => <div data-ocid="orbit_controls_mock" />,
}));

import { Engine3D } from "@/components/engine/Engine3D";

// The R3F primitives render as lowercase intrinsic DOM elements with their
// geometry props serialized as attributes (e.g. position="x,y,z",
// args="a,b,c"). These helpers locate the meshes that carry a given geometry.
function meshesWithGeometry(
  container: HTMLElement,
  tag: string,
  args: string,
): HTMLElement[] {
  return Array.from(container.querySelectorAll(`${tag}[args="${args}"]`)).map(
    (el) => el.parentElement as HTMLElement,
  );
}

function positionOf(mesh: HTMLElement): number[] {
  return (mesh.getAttribute("position") ?? "0,0,0")
    .split(",")
    .map((n) => Number(n));
}

describe("Engine3D boxer geometry", () => {
  it("lays out four cylinders as two opposed banks across the crankcase", () => {
    const { container } = render(
      <Engine3D rpm={2800} running faults={EMPTY_FAULTS} />,
    );

    // Cylinder barrels are the 0.42-radius cylinders.
    const barrels = meshesWithGeometry(
      container,
      "cylindergeometry",
      "0.42,0.42,1.05,24",
    );
    expect(barrels).toHaveLength(4);

    // Two cylinders per side, opposed across the crankcase (Z sign differs).
    const zs = barrels.map((b) => positionOf(b)[2]);
    const leftBank = zs.filter((z) => z < 0);
    const rightBank = zs.filter((z) => z > 0);
    expect(leftBank).toHaveLength(2);
    expect(rightBank).toHaveLength(2);

    // The four barrels are spread along the crankcase axis (distinct X).
    const xs = barrels.map((b) => positionOf(b)[0]);
    expect(new Set(xs).size).toBe(4);
  });

  it("gives every cylinder prominent thin horizontal cooling fins", () => {
    const { container } = render(
      <Engine3D rpm={2800} running faults={EMPTY_FAULTS} />,
    );

    // Cooling fins are the thin 0.06-thick slabs; four per cylinder.
    const fins = meshesWithGeometry(container, "boxgeometry", "0.98,0.98,0.06");
    expect(fins).toHaveLength(16);
  });

  it("uses dark cylinder head covers at the outer end of each barrel", () => {
    const { container } = render(
      <Engine3D rpm={2800} running faults={EMPTY_FAULTS} />,
    );

    // Head covers are the 0.9x0.9x0.22 boxes with a dark material.
    const covers = meshesWithGeometry(container, "boxgeometry", "0.9,0.9,0.22");
    expect(covers).toHaveLength(4);
    for (const cover of covers) {
      const material = cover.querySelector("meshstandardmaterial");
      expect(material?.getAttribute("color")).toBe("oklch(0.22 0.01 250)");
    }
  });

  it("places a circular metallic propeller hub at the front of the engine", () => {
    const { container } = render(
      <Engine3D rpm={2800} running faults={EMPTY_FAULTS} />,
    );

    // The circular hub is the 0.52-radius cylinder at the front (-Z). The hub
    // mesh sits inside a group that carries the forward position.
    const hub = meshesWithGeometry(
      container,
      "cylindergeometry",
      "0.52,0.52,0.34,32",
    );
    expect(hub).toHaveLength(1);
    const group = hub[0].parentElement as HTMLElement;
    const pos = positionOf(group);
    expect(pos[2]).toBeLessThan(0);
  });

  it("mounts a lower carburetor/fuel system beneath the crankcase", () => {
    const { container } = render(
      <Engine3D rpm={2800} running faults={EMPTY_FAULTS} />,
    );

    // The carburetor body is the 1.1x0.5x0.7 box, mounted low (negative Y).
    // The body mesh sits inside a group that carries the low position.
    const carb = meshesWithGeometry(container, "boxgeometry", "1.1,0.5,0.7");
    expect(carb).toHaveLength(1);
    const group = carb[0].parentElement as HTMLElement;
    const pos = positionOf(group);
    expect(pos[1]).toBeLessThan(0);
  });
});
