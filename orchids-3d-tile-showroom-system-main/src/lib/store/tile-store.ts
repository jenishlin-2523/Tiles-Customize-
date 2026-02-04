import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  Tile,
  RoomType,
  LightingPreset,
  LayoutPattern,
  MeshMappings,
} from "@/lib/db/schema";

// Mesh information for 3D scene
export interface MeshInfo {
  id: string;
  name: string;
  type: "floor" | "wall" | "backsplash" | "countertop";
  roomType: RoomType;
}

// State for the tile visualization store
interface TileVisualizationState {
  // Room state
  currentRoom: RoomType;
  setCurrentRoom: (room: RoomType) => void;

  // Tile collection
  tiles: Tile[];
  setTiles: (tiles: Tile[]) => void;
  addTile: (tile: Tile) => void;

  // Selected tile for application
  selectedTile: Tile | null;
  setSelectedTile: (tile: Tile | null) => void;

  // Selected mesh in 3D scene
  selectedMeshId: string | null;
  setSelectedMeshId: (meshId: string | null) => void;
  hoveredMeshId: string | null;
  setHoveredMeshId: (meshId: string | null) => void;

  // Mesh to tile mappings
  meshMappings: MeshMappings;
  applyTileToMesh: (meshId: string, tileId: string, pattern?: LayoutPattern) => void;
  removeTileFromMesh: (meshId: string) => void;
  setMeshMappings: (mappings: MeshMappings) => void;

  // Layout pattern
  currentPattern: LayoutPattern;
  setCurrentPattern: (pattern: LayoutPattern) => void;

  // Lighting
  lightingPreset: LightingPreset;
  setLightingPreset: (preset: LightingPreset) => void;

  // Before/After view
  showBeforeView: boolean;
  setShowBeforeView: (show: boolean) => void;

  // Filter state
  categoryFilter: "all" | "floor" | "wall";
  setCategoryFilter: (filter: "all" | "floor" | "wall") => void;
  collectionFilter: string | null;
  setCollectionFilter: (collection: string | null) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset
  resetRoom: () => void;
}

export const useTileStore = create<TileVisualizationState>()(
  subscribeWithSelector((set, get) => ({
    // Room state
    currentRoom: "kitchen",
    setCurrentRoom: (room) => set({ currentRoom: room, selectedMeshId: null }),

    // Tile collection
    tiles: [],
    setTiles: (tiles) => set({ tiles }),
    addTile: (tile) => set((state) => ({ tiles: [...state.tiles, tile] })),

    // Selected tile
    selectedTile: null,
    setSelectedTile: (tile) => set({ selectedTile: tile }),

    // Mesh selection
    selectedMeshId: null,
    setSelectedMeshId: (meshId) => set({ selectedMeshId: meshId }),
    hoveredMeshId: null,
    setHoveredMeshId: (meshId) => set({ hoveredMeshId: meshId }),

    // Mesh mappings
    meshMappings: {},
    applyTileToMesh: (meshId, tileId, pattern) => {
      const currentPattern = pattern || get().currentPattern;
      set((state) => ({
        meshMappings: {
          ...state.meshMappings,
          [meshId]: {
            tileId,
            pattern: currentPattern,
            rotation: 0,
            scale: 1,
          },
        },
      }));
    },
    removeTileFromMesh: (meshId) => {
      set((state) => {
        const newMappings = { ...state.meshMappings };
        delete newMappings[meshId];
        return { meshMappings: newMappings };
      });
    },
    setMeshMappings: (mappings) => set({ meshMappings: mappings }),

    // Layout pattern
    currentPattern: "straight",
    setCurrentPattern: (pattern) => set({ currentPattern: pattern }),

    // Lighting
    lightingPreset: "daylight",
    setLightingPreset: (preset) => set({ lightingPreset: preset }),

    // Before/After
    showBeforeView: false,
    setShowBeforeView: (show) => set({ showBeforeView: show }),

    // Filters
    categoryFilter: "all",
    setCategoryFilter: (filter) => set({ categoryFilter: filter }),
    collectionFilter: null,
    setCollectionFilter: (collection) => set({ collectionFilter: collection }),

    // Loading
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),

    // Reset
    resetRoom: () =>
      set({
        meshMappings: {},
        selectedMeshId: null,
        selectedTile: null,
        showBeforeView: false,
      }),
  }))
);

// Selector hooks for optimized re-renders
export const useCurrentRoom = () => useTileStore((state) => state.currentRoom);
export const useSelectedTile = () => useTileStore((state) => state.selectedTile);
export const useSelectedMesh = () => useTileStore((state) => state.selectedMeshId);
export const useMeshMappings = () => useTileStore((state) => state.meshMappings);
export const useLightingPreset = () => useTileStore((state) => state.lightingPreset);
export const useLayoutPattern = () => useTileStore((state) => state.currentPattern);
