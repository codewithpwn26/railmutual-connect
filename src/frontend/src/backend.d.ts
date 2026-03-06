import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SearchFilters {
    designation?: string;
    zone?: string;
    division?: string;
    location?: string;
}
export type Time = bigint;
export interface PublicUser {
    name: string;
    division: string;
    email?: string;
    location: string;
    railwayZone: string;
}
export interface Profile {
    desiredPostingLocation: string;
    userId: Principal;
    designation: string;
    createdAt: Time;
    division: string;
    fullName: string;
    email?: string;
    phone?: string;
    department: string;
    railwayZone: string;
    currentPostingLocation: string;
    contactVisible: boolean;
}
export interface DashboardStats {
    profileCompletionPercentage: bigint;
    matchCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllUsers(): Promise<Array<PublicUser>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getMatches(): Promise<Array<Profile>>;
    getMyProfile(): Promise<Profile>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerOrLogin(): Promise<Profile>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    searchProfiles(filters: SearchFilters): Promise<Array<Profile>>;
    updateProfile(fullName: string, department: string, designation: string, railwayZone: string, division: string, currentPostingLocation: string, desiredPostingLocation: string, contactVisible: boolean, email: string | null, phone: string | null): Promise<void>;
}
