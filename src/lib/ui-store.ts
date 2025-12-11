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

    databaseViewMode: 'global' | 'personal';
    setDatabaseViewMode: (mode: 'global' | 'personal') => void;

    closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: false,
    isInspectorOpen: false,
    centerActions: null,
    mapViewMode: '3d',
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    setInspectorOpen: (isOpen) => set({ isInspectorOpen: isOpen }),
    setCenterActions: (actions) => set({ centerActions: actions }),
    setMapViewMode: (mode) => set({ mapViewMode: mode }),

    // Database View Mode
    databaseViewMode: 'global',
    setDatabaseViewMode: (mode: 'global' | 'personal') => set({ databaseViewMode: mode }),

    closeAll: () => set({ isSidebarOpen: false, isInspectorOpen: false }),
}));
