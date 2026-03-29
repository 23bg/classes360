// Enums from Prisma schema
export enum AdminRole {
    SUPERADMIN = 'SUPERADMIN',
    SUPPORT = 'SUPPORT',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED',
    PENDING = 'PENDING',
}

export enum BusinessRole {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
}

export enum BusinessStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    ARCHIVED = 'ARCHIVED',
}

export enum OutletStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ARCHIVED = 'ARCHIVED',
}

export enum GbpSyncStatus {
    CONNECTED = 'CONNECTED',
    SYNCING = 'SYNCING',
    SYNC_ERROR = 'SYNC_ERROR',
    DISCONNECTED = 'DISCONNECTED',
}

export enum PostStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    EXPIRED = 'EXPIRED',
    REMOVED = 'REMOVED',
}

export enum PostSource {
    INTERNAL = 'INTERNAL',
    GBP = 'GBP',
}

export enum ReviewState {
    PUBLISHED = 'PUBLISHED',
    REMOVED = 'REMOVED',
    PENDING = 'PENDING',
}

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

// Types from Prisma schema
export interface BusinessRoleAssignment {
    businessId: string;
    role: BusinessRole;
    assignedAt?: Date;
}

export interface GbpConnection {
    locationId: string;
    accountId: string;
    syncStatus: GbpSyncStatus;
    lastSyncAt?: Date;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
}

export interface ManagerPermissions {
    userId: string;
    permissions: {
        reviews?: boolean;
        posts?: boolean;
        insights?: boolean;
        [key: string]: unknown;
    };
}
