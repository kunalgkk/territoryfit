import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AnalyticsSummary {
    totalWorkouts: bigint;
    totalDistanceKm: bigint;
    totalCaloriesBurned: bigint;
    avgPace: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface WorkoutSession {
    activityType: string;
    zone?: string;
    distanceKm: bigint;
    durationSeconds: bigint;
    timestamp: Time;
    caloriesBurned: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PublicTerritoryZone {
    passCounts: Array<[Principal, bigint]>;
    currentOwner: Principal;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export type Transform = (arg0: TransformationInput) => Promise<TransformationOutput>;
export interface FitnessProfile {
    age: bigint;
    primaryGoal: string;
    heightCm: bigint;
    fullName: string;
    weightKg: bigint;
    gender: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getAllTerritoryZones(): Promise<Array<[string, PublicTerritoryZone]>>;
    getAnalyticsSummary(user: Principal): Promise<AnalyticsSummary>;
    getCallerUserRole(): Promise<UserRole>;
    getFitnessProfile(): Promise<FitnessProfile | null>;
    getStripeConfigForRuntime(_transform: [Principal, string]): Promise<[StripeConfiguration, [Principal, string]]>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTotalUserStats(user: Principal): Promise<{
        calories: bigint;
        distance: bigint;
    } | null>;
    getUserOwnedZones(user: Principal): Promise<bigint>;
    getWorkoutSessions(user: Principal): Promise<Array<WorkoutSession>>;
    getZoneOwnership(zone: string): Promise<Principal | null>;
    getZonePassCounts(zone: string): Promise<Array<[Principal, bigint]>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listZones(): Promise<Array<string>>;
    recordWorkoutSession(session: WorkoutSession): Promise<void>;
    registerFitnessProfile(profile: FitnessProfile): Promise<void>;
    /**
     * / Admin-only function to initialize Stripe configuration (SaaS platform use only)
     */
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
