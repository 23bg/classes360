import { UserStatus, BusinessRole, BusinessRoleAssignment, AdminRole } from './prisma.types';

export interface User {
    id: string;
    email: string;
    phoneNumber?: string;
    name: string;
    avatarUrl?: string;
    status: UserStatus;
    googleAccountId?: string;
    isVerified: boolean;
    otp?: string;
    otpExpires?: Date;
    googleEmail?: string;
    googleName?: string;
    googleAvatar?: string;
    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleTokenExpiry?: Date;
    isNotificationEnable: boolean;
    isWhatsappAlertsEnable: boolean;
    isEmailAlertsEnable: boolean;
    preferredTheme?: string;
    businessRoles: BusinessRoleAssignment[];
    createdAt: Date;
    lastLoginAt?: Date;
    updatedAt: Date;
}

export interface CreateUserPayload {
    email: string;
    phoneNumber?: string;
    name: string;
    avatarUrl?: string;
    status?: UserStatus;
    googleAccountId?: string;
    isVerified?: boolean;
    googleEmail?: string;
    googleName?: string;
    googleAvatar?: string;
    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleTokenExpiry?: Date;
    isNotificationEnable?: boolean;
    isWhatsappAlertsEnable?: boolean;
    isEmailAlertsEnable?: boolean;
    preferredTheme?: string;
    businessRoles?: BusinessRoleAssignment[];
}

export interface ConsoleUser {
    id: string;
    email: string;
    passwordHash: string;
    role: AdminRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

