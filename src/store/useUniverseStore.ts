import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';

export interface UniverseBreadcrumb {
    id: string;
    label: string;
    slug: string;
}

interface UniverseState {
    nodes: Node[];
    edges: Edge[];
    breadcrumbs: UniverseBreadcrumb[];
    activeNodeId: string | null;
    isLoading: boolean;
    
    // Actions
    setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
    setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
    setBreadcrumbs: (breadcrumbs: UniverseBreadcrumb[]) => void;
    pushBreadcrumb: (breadcrumb: UniverseBreadcrumb) => void;
    popToBreadcrumb: (id: string) => void;
    setActiveNode: (id: string | null) => void;
    setLoading: (isLoading: boolean) => void;
}

export const useUniverseStore = create<UniverseState>((set) => ({
    nodes: [],
    edges: [],
    breadcrumbs: [{ id: 'root', label: 'Universe', slug: 'universe' }],
    activeNodeId: null,
    isLoading: false,

    setNodes: (nodesOrUpdater) => set((state) => ({
        nodes: typeof nodesOrUpdater === 'function' ? nodesOrUpdater(state.nodes) : nodesOrUpdater
    })),
    setEdges: (edgesOrUpdater) => set((state) => ({
        edges: typeof edgesOrUpdater === 'function' ? edgesOrUpdater(state.edges) : edgesOrUpdater
    })),
    setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
    pushBreadcrumb: (breadcrumb) => set((state) => {
        // Prevent duplicates
        if (state.breadcrumbs.some(b => b.id === breadcrumb.id)) return state;
        return { breadcrumbs: [...state.breadcrumbs, breadcrumb] };
    }),
    popToBreadcrumb: (id) => set((state) => {
        const index = state.breadcrumbs.findIndex(b => b.id === id);
        if (index === -1) return state;
        return { breadcrumbs: state.breadcrumbs.slice(0, index + 1) };
    }),
    setActiveNode: (id) => set({ activeNodeId: id }),
    setLoading: (isLoading) => set({ isLoading })
}));
