import { create } from "zustand";

type UiState = {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    showSettingsModal: boolean;
    setShowSettingsModal: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
    sidebarOpen: false,
    showSettingsModal: false,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setShowSettingsModal: (open) => set({ showSettingsModal: open }),
}));
