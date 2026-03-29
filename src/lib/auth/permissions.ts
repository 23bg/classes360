import { SessionRole } from "@/lib/auth/auth";

const WRITE_ROLES: SessionRole[] = ["OWNER", "EDITOR", "MANAGER"];

export const canWriteInstituteData = (role: SessionRole): boolean => WRITE_ROLES.includes(role);

export const canManageBilling = (role: SessionRole): boolean => role === "OWNER";