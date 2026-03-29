export interface IGoogleAccount {
    id: string;
    googleAccountId: string; // The ID from Google's API
    name?: string;
    email?: string;
    // Add other relevant properties for a Google Account
    createdAt?: Date;
    updatedAt?: Date;
}

