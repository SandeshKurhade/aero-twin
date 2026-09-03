import type { FaultInjection } from "@/lib/types";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";

interface Engine3DProps {
  rpm: number;
  running: boolean;
  faults: FaultInjection;
}

// Horizontally-opposed (boxer) layout: crankcase runs along X, two cylinders
// per side opposed across the crankcase. Cylinders 0,1 sit on the left bank
// (Z negative), cylinders 2,3 on the right bank (Z positive).
const CYLINDER_X = [-1.5, -0.5, 0.5, 1.5];
const BANK_Z = [-1.1, -1.1, 1.1, 1.1];
const PHASES = [0, Math.PI, Math.PI, 0];
const STROKE = 0.42;

interface HighlightState {
  cylinders: string | null;
  crankcase: string | null;
  pistons: string | null;
  fuelRail: string | null;
  jitter: boolean;
}

function computeHighlights(faults: FaultInjection): HighlightState {
  const h: HighlightState = {
    cylinders: null,
    crankcase: null,
    pistons: null,
    fuelRail: null,
    jitter: false,
  };
  if (faults.overheating) h.cylinders = "oklch(0.62 0.2 25)";
  if (faults.lowOilPressure) h.crankcase = "oklch(0.78 0.13 75)";
  if (faults.excessiveVibration) {
    h.pistons = "oklch(0.7 0.1 250)";
    h.jitter = true;
  }
  if (faults.injectorFuel) h.fuelRail = "oklch(0.72 0.14 195)";
  return h;
}

function ProceduralEngine({ rpm, running, faults }: Engine3DProps) {
  const crankRef = useRef<THREE.Group>(null);
  const pistonRefs = useRef<(THREE.Group | null)[]>([]);
  const engineRef = useRef<THREE.Group>(null);
  const angleRef = useRef(0);

  const highlights = useMemo(() => computeHighlights(faults), [faults]);

  useFrame((_, delta) => {
    if (running && rpm > 0) {
      angleRef.current += (rpm / 60) * Math.PI * 2 * delta;
    }
    const angle = angleRef.current;
    if (crankRef.current) {
      crankRef.current.rotation.x = angle;
    }
    pistonRefs.current.forEach((p, i) => {
      if (!p) return;
      // Boxer pistons reciprocate along the barrel axis (Z), opposed per bank.
      p.position.z = BANK_Z[i] + Math.sin(angle + PHASES[i]) * STROKE;
    });
    if (engineRef.current && highlights.jitter) {
      engineRef.current.position.x = Math.sin(angle * 2) * 0.03;
      engineRef.current.position.z = Math.cos(angle * 2) * 0.03;
    } else if (engineRef.current) {
      engineRef.current.position.x = 0;
      engineRef.current.position.z = 0;
    }
  });

  const metal = (color: string, emissive = "black", intensity = 0) => (
    <meshStandardMaterial
      color={color}
      metalness={0.85}
      roughness={0.35}
      emissive={emissive}
      emissiveIntensity={intensity}
    />
  );

  // Thin horizontal cooling-fin slab perpendicular to the barrel axis (Z).
  const fin = (x: number, z: number, key: string) => (
    <mesh key={key} position={[x, 0.35, z]} castShadow>
      <boxGeometry args={[0.98, 0.98, 0.06]} />
      {metal("oklch(0.65 0.015 240)")}
    </mesh>
  );

  return (
    <group ref={engineRef}>
      {/* Crankcase / oil pan — silver/grey metallic, runs along X */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[4.6, 0.7, 1.5]} />
        {metal(
          "oklch(0.72 0.02 240)",
          highlights.crankcase ?? "black",
          highlights.crankcase ? 1.6 : 0,
        )}
      </mesh>
      <mesh position={[0, -0.62, 0]} castShadow>
        <boxGeometry args={[3.6, 0.3, 1.1]} />
        {metal("oklch(0.4 0.012 250)")}
      </mesh>

      {/* Crankshaft (rotates around X) */}
      <group ref={crankRef} position={[0, 0.05, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 4.6, 24]} />
          {metal("oklch(0.55 0.04 240)")}
        </mesh>
        {CYLINDER_X.map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.18, 20]} />
            {metal("oklch(0.6 0.05 240)")}
          </mesh>
        ))}
      </group>

      {/* Cylinders + cooling fins + pistons + connecting rods (boxer banks) */}
      {CYLINDER_X.map((x, i) => {
        const bankZ = BANK_Z[i];
        const outerSign = bankZ < 0 ? -1 : 1;
        return (
          <group key={x}>
            {/* Cylinder barrel — matte silver with darker fin-gap tone */}
            <mesh
              position={[x, 0.35, bankZ]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.42, 0.42, 1.05, 24]} />
              {metal(
                "oklch(0.55 0.012 240)",
                highlights.cylinders ?? "black",
                highlights.cylinders ? 1.8 : 0,
              )}
            </mesh>

            {/* Cooling fins — 4 thin slabs perpendicular to the barrel axis */}
            {[-0.42, -0.14, 0.14, 0.42].map((fz) =>
              fin(x, bankZ + fz, `${x}-${fz}`),
            )}

            {/* Dark cylinder head cover at the outer end of the barrel */}
            <mesh position={[x, 0.35, bankZ + outerSign * 0.62]} castShadow>
              <boxGeometry args={[0.9, 0.9, 0.22]} />
              {metal("oklch(0.22 0.01 250)")}
            </mesh>

            {/* Piston + connecting rod assembly (reciprocates along Z) */}
            <group
              ref={(el) => {
                pistonRefs.current[i] = el;
              }}
              position={[x, 0.35, 0]}
            >
              <mesh position={[0, 0, 0.62]} castShadow>
                <boxGeometry args={[0.6, 0.6, 0.34]} />
                {metal(
                  "oklch(0.62 0.05 240)",
                  highlights.pistons ?? "black",
                  highlights.pistons ? 1.4 : 0,
                )}
              </mesh>
              <mesh position={[0, 0, 0.1]}>
                <boxGeometry args={[0.16, 0.16, 0.6]} />
                {metal("oklch(0.5 0.04 240)")}
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Intake / exhaust manifolds along the crankcase */}
      <mesh position={[0, 0.75, 0.85]} rotation={[0, 0, 0]}>
        <boxGeometry args={[4.2, 0.18, 0.3]} />
        {metal("oklch(0.42 0.03 240)")}
      </mesh>
      <mesh position={[0, 0.75, -0.85]}>
        <boxGeometry args={[4.2, 0.18, 0.3]} />
        {metal(
          "oklch(0.42 0.03 240)",
          highlights.fuelRail ?? "black",
          highlights.fuelRail ? 1.6 : 0,
        )}
      </mesh>

      {/* Circular polished propeller hub at the front (-Z) with gold bolts */}
      <group position={[0, 0.35, -1.72]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.52, 0.52, 0.34, 32]} />
          {metal("oklch(0.78 0.02 240)")}
        </mesh>
        <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 24]} />
          {metal("oklch(0.4 0.012 250)")}
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((b) => {
          const a = (b / 6) * Math.PI * 2;
          return (
            <mesh
              key={b}
              position={[Math.cos(a) * 0.38, Math.sin(a) * 0.38, -0.18]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.035, 0.035, 0.08, 12]} />
              {metal("oklch(0.72 0.13 75)")}
            </mesh>
          );
        })}
      </group>

      {/* Lower-mounted carburetor / fuel system with red accent */}
      <group position={[0, -0.78, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.5, 0.7]} />
          {metal("oklch(0.3 0.01 250)")}
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 20]} />
          {metal("oklch(0.3 0.01 250)")}
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.5, 0.12, 0.5]} />
          {metal("oklch(0.58 0.21 22)")}
        </mesh>
      </group>

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} />
      <pointLight
        position={[-4, 2, -3]}
        intensity={0.6}
        color="oklch(0.72 0.14 195)"
      />
    </group>
  );
}

function GlbEngine({ rpm, running, faults }: Engine3DProps) {
  // Placeholder for an imported Blender engine.glb. When the asset is present
  // it is loaded via useGLTF; the procedural engine remains the fallback.
  return <ProceduralEngine rpm={rpm} running={running} faults={faults} />;
}

export function Engine3D({ rpm, running, faults }: Engine3DProps) {
  const [hasGlb, setHasGlb] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/assets/engine.glb", { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setHasGlb(res.ok);
      })
      .catch(() => {
        if (!cancelled) setHasGlb(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="relative h-full w-full"
      data-ocid="engine_3d"
      role="img"
      aria-label="Interactive 3D four-cylinder piston engine"
    >
      <Canvas
        camera={{ position: [4.5, 2.5, 6], fov: 45 }}
        shadows
        dpr={[1, 2]}
      >
        <color attach="background" args={["oklch(0.12 0.012 240)"]} />
        <fog attach="fog" args={["oklch(0.12 0.012 240)", 12, 22]} />
        <Suspense fallback={null}>
          {hasGlb ? (
            <GlbEngine rpm={rpm} running={running} faults={faults} />
          ) : (
            <ProceduralEngine rpm={rpm} running={running} faults={faults} />
          )}
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
        DRAG TO ORBIT · SCROLL TO ZOOM
      </div>
    </div>
  );
}
