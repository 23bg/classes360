export type TeamRow = {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: "OWNER" | "MANAGER" | "COUNSELOR" | "TEACHER" | "VIEWER";
    active: boolean;
    subjects?: string;
    experience?: string;
    bio?: string;
    source: "team" | "teacher";
};

export type AppTeamState = {
    data: TeamRow[];
    loading: boolean;
    error: string | null;
    sessionRole: "OWNER" | "MANAGER" | "VIEWER" | null;
    mutationLoading: boolean;
};
