import { create } from 'zustand';
import { ReactNode } from 'react';

interface UIState {
    isSidebarOpen: boolean;
    isInspectorOpen: boolean;
    centerActions: ReactNode | null;
    mapViewMode: '3d' | '2d';
    toggleSidebar: () => void;
    toggleInspector: () => void;
    setCenterActions: (actions: ReactNode | null) => void;
    setMapViewMode: (mode: '3d' | '2d') => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setInspectorOpen: (isOpen: boolean) => void;

    mapSearchTerm: string;
    setMapSearchTerm: (term: string) => void;

    databaseViewMode: 'global' | 'personal';
    setDatabaseViewMode: (mode: 'global' | 'personal') => void;

    closeAll: () => void;

    // Global Dashboard Overlay
    isDashboardOpen: boolean;
    setDashboardOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: false,
    isInspectorOpen: false,
    isDashboardOpen: false,
    centerActions: null,
    mapViewMode: '2d',
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    setInspectorOpen: (isOpen) => set({ isInspectorOpen: isOpen }),
    setCenterActions: (actions) => set({ centerActions: actions }),
    setMapViewMode: (mode) => set({ mapViewMode: mode }),
    setDashboardOpen: (isOpen) => set({ isDashboardOpen: isOpen }),

    // Database View Mode
    databaseViewMode: 'global',
    setDatabaseViewMode: (mode: 'global' | 'personal') => set({ databaseViewMode: mode }),

    mapSearchTerm: "",
    setMapSearchTerm: (term: string) => set({ mapSearchTerm: term }),

    closeAll: () => set({ isSidebarOpen: false, isInspectorOpen: false, isDashboardOpen: false }),
}));
