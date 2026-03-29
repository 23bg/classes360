export interface StudentType {
    id: string;
    institute_id: string;
    name: string;
    email?: string;
    phone?: string;
    batch_id?: string;
    status: 'active' | 'inactive' | 'graduated' | 'dropped';
    enrollment_date?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateStudentInput {
    name: string;
    email?: string;
    phone?: string;
    batch_id?: string;
}

export interface UpdateStudentInput {
    name?: string;
    email?: string;
    phone?: string;
    batch_id?: string;
    status?: 'active' | 'inactive' | 'graduated' | 'dropped';
}

export interface StudentListResponse {
    data: StudentType[];
    total: number;
    page: number;
    limit: number;
}
