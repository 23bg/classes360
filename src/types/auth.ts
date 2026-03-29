export interface AuthSession {
    userId: string;
    instituteId: string;
    role: "OWNER" | "MANAGER" | "VIEWER";
}
