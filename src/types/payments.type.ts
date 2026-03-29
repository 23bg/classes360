import { PaymentStatus } from './prisma.types';

export interface Payment {
    id: string;
    userId?: string;
    businessId?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    description?: string;
    metadata?: Record<string, any>;
    refundedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePaymentPayload {
    userId?: string;
    businessId?: string;
    amount: number;
    currency?: string;
    status?: PaymentStatus;
    paymentMethod?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    description?: string;
    metadata?: Record<string, any>;
}
