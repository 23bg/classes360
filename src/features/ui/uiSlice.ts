import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    sidebarOpen: boolean;
    mobileMenuOpen: boolean;
    notificationsOpen: boolean;
}

const initialState: UIState = {
    sidebarOpen: true,
    mobileMenuOpen: false,
    notificationsOpen: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },
        setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
            state.mobileMenuOpen = action.payload;
        },
        setNotificationsOpen: (state, action: PayloadAction<boolean>) => {
            state.notificationsOpen = action.payload;
        },
    },
});

export const { toggleSidebar, setSidebarOpen, setMobileMenuOpen, setNotificationsOpen } =
    uiSlice.actions;
export default uiSlice.reducer;
