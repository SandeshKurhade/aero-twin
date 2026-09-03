import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FaultRecord, HealthSnapshot, MissionState } from "./types";

// The generated actor bindings expose the engine persistence surface. Cast to
// the authoritative engine contract so the frontend compiles against the
// backend contract before bindgen regenerates the actor class.
interface EngineBackend {
  recordFault(fault: FaultRecord): Promise<void>;
  getFaults(): Promise<FaultRecord[]>;
  setMissionState(state: MissionState): Promise<void>;
  getMissionState(): Promise<MissionState | null>;
  recordHealthSnapshot(snapshot: HealthSnapshot): Promise<void>;
  getHealthHistory(): Promise<HealthSnapshot[]>;
  getLatestHealth(): Promise<HealthSnapshot | null>;
}

function asEngine(actor: unknown): EngineBackend | null {
  return actor ? (actor as unknown as EngineBackend) : null;
}

export function useGetFaults() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["faults"],
    queryFn: async () => {
      const engine = asEngine(actor);
      if (!engine) return [] as FaultRecord[];
      return engine.getFaults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMissionState() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["mission"],
    queryFn: async () => {
      const engine = asEngine(actor);
      if (!engine) return null;
      return engine.getMissionState();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetHealthHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["health-history"],
    queryFn: async () => {
      const engine = asEngine(actor);
      if (!engine) return [] as HealthSnapshot[];
      return engine.getHealthHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLatestHealth() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["health-latest"],
    queryFn: async () => {
      const engine = asEngine(actor);
      if (!engine) return null;
      return engine.getLatestHealth();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordFault() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fault: FaultRecord) => {
      const engine = asEngine(actor);
      if (!engine) throw new Error("Backend is not ready");
      return engine.recordFault(fault);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["faults"] });
    },
  });
}

export function useSetMissionState() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (state: MissionState) => {
      const engine = asEngine(actor);
      if (!engine) throw new Error("Backend is not ready");
      return engine.setMissionState(state);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mission"] });
    },
  });
}

export function useRecordHealthSnapshot() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (snapshot: HealthSnapshot) => {
      const engine = asEngine(actor);
      if (!engine) throw new Error("Backend is not ready");
      return engine.recordHealthSnapshot(snapshot);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["health-history"] });
      void queryClient.invalidateQueries({ queryKey: ["health-latest"] });
    },
  });
}
