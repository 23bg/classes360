import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../types';

interface AuthState {
    user: AuthUser | null;
    role: string | null;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    role: null,
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Set authenticated user (called after login/signup verification)
         */
        setUser: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
            state.role = action.payload.role;
            state.isLoading = false;
        },

        /**
         * Set loading state
         */
        setAuthLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        /**
         * Clear auth (called on logout)
         */
        clearAuth: (state) => {
            state.user = null;
            state.role = null;
            state.isLoading = false;
        },

        /**
         * Update user role
         */
        updateRole: (state, action: PayloadAction<string>) => {
            state.role = action.payload;
            if (state.user) {
                state.user.role = action.payload as any;
            }
        },
    },
});

export const { setUser, clearAuth, setAuthLoading, updateRole } = authSlice.actions;
export default authSlice.reducer;


