import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FaultRecord {
    id: bigint;
    source: FaultSource;
    maintenanceRecommendation: string;
    timestamp: Timestamp;
    severity: Severity;
    faultType: string;
}
export type Timestamp = bigint;
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface MissionState {
    status: MissionStatus;
    currentPhase: MissionPhase;
    riskLevel: RiskLevel;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface HealthSnapshot {
    rul: number;
    timestamp: Timestamp;
    healthScore: number;
    confidence: number;
    predictedFault?: string;
}
export enum FaultSource {
    injected = "injected",
    detected = "detected"
}
export enum MissionPhase {
    postLanding = "postLanding",
    orbit = "orbit",
    ascent = "ascent",
    launch = "launch",
    reentry = "reentry",
    preLaunch = "preLaunch",
    landing = "landing"
}
export enum MissionStatus {
    aborted = "aborted",
    nominal = "nominal",
    critical = "critical",
    degraded = "degraded"
}
export enum RiskLevel {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getFaults(): Promise<Array<FaultRecord>>;
    getHealthHistory(): Promise<Array<HealthSnapshot>>;
    getLatestHealth(): Promise<HealthSnapshot | null>;
    getMissionState(): Promise<MissionState | null>;
    isCallerAdmin(): Promise<boolean>;
    recordFault(fault: FaultRecord): Promise<void>;
    recordHealthSnapshot(snapshot: HealthSnapshot): Promise<void>;
    schema(): Promise<string>;
    setMissionState(state: MissionState): Promise<void>;
}
