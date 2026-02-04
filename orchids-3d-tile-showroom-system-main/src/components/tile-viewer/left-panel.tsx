"use client";

import { useTileStore } from "@/lib/store/tile-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RoomType, TileCategory, Tile } from "@/lib/db/schema";
import { TileUploadDialog } from "./tile-upload-dialog";
import {
  Home,
  Bath,
  Utensils,
  Grid3X3,
  LayoutGrid,
  Square,
  Upload,
  X,
} from "lucide-react";

// Room configuration for the selector
const ROOMS: { id: RoomType; label: string; icon: React.ReactNode }[] = [
  { id: "kitchen", label: "Kitchen", icon: <Utensils className="h-4 w-4" /> },
  { id: "bathroom", label: "Bathroom", icon: <Bath className="h-4 w-4" /> },
  { id: "living_room", label: "Living Room", icon: <Home className="h-4 w-4" /> },
];

// Category configuration
const CATEGORIES: { id: "all" | TileCategory; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All Tiles", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "floor", label: "Floor Tiles", icon: <Grid3X3 className="h-4 w-4" /> },
  { id: "wall", label: "Wall Tiles", icon: <Square className="h-4 w-4" /> },
];

interface LeftPanelProps {
  className?: string;
  onClose?: () => void;
}

export function LeftPanel({ className, onClose }: LeftPanelProps) {
  const currentRoom = useTileStore((state) => state.currentRoom);
  const setCurrentRoom = useTileStore((state) => state.setCurrentRoom);
  const tiles = useTileStore((state) => state.tiles);
  const selectedTile = useTileStore((state) => state.selectedTile);
  const setSelectedTile = useTileStore((state) => state.setSelectedTile);
  const categoryFilter = useTileStore((state) => state.categoryFilter);
  const setCategoryFilter = useTileStore((state) => state.setCategoryFilter);
  const collectionFilter = useTileStore((state) => state.collectionFilter);
  const setCollectionFilter = useTileStore((state) => state.setCollectionFilter);
  const resetRoom = useTileStore((state) => state.resetRoom);

  // Get unique collections
  const collections = [...new Set(tiles.map((t) => t.collection).filter(Boolean))];

  // Filter tiles based on current filters
  const filteredTiles = tiles.filter((tile) => {
    if (categoryFilter !== "all" && tile.category !== categoryFilter) return false;
    if (collectionFilter && tile.collection !== collectionFilter) return false;
    return true;
  });

  return (
    <div className={cn("flex flex-col h-full overflow-hidden bg-card border-r", className)}>
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">3D Tile Visualizer</h2>
          <p className="text-sm text-muted-foreground">Select a room and tiles</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 h-0">
        <div className="p-4 pb-8 space-y-6">
          {/* Room Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Room Type</h3>
            <div className="grid grid-cols-1 gap-2">
              {ROOMS.map((room) => (
                <Button
                  key={room.id}
                  variant={currentRoom === room.id ? "default" : "outline"}
                  className="justify-start gap-2"
                  onClick={() => {
                    setCurrentRoom(room.id);
                    resetRoom();
                  }}
                >
                  {room.icon}
                  {room.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Category</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={categoryFilter === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat.id)}
                >
                  {cat.icon}
                  <span className="ml-1">{cat.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Collection Filter */}
          {collections.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Collection</h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={collectionFilter === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCollectionFilter(null)}
                >
                  All
                </Badge>
                {collections.map((collection) => (
                  <Badge
                    key={collection}
                    variant={collectionFilter === collection ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setCollectionFilter(collection as string)}
                  >
                    {collection}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Tile Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Tiles</h3>
              <span className="text-xs text-muted-foreground">
                {filteredTiles.length} tiles
              </span>
            </div>

            {/* Upload Button */}
            <TileUploadDialog
              trigger={
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Tile
                </Button>
              }
            />

            {filteredTiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tiles available</p>
                <p className="text-xs">Upload tiles or adjust filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredTiles.map((tile) => (
                  <TileCard
                    key={tile.id}
                    tile={tile}
                    isSelected={selectedTile?.id === tile.id}
                    onClick={() => setSelectedTile(tile)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Tile card component
function TileCard({
  tile,
  isSelected,
  onClick,
}: {
  tile: Tile;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-transparent hover:border-muted-foreground/30"
      )}
      onClick={onClick}
    >
      {/* Tile Image */}
      <div className="aspect-square bg-muted">
        <img
          src={tile.imageUrl}
          alt={tile.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Tile Info Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
          <p className="text-xs font-medium truncate">{tile.name}</p>
          <p className="text-[10px] opacity-80">
            {tile.width}×{tile.height}mm • {tile.finish}
          </p>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Category badge */}
      <Badge
        variant="secondary"
        className="absolute top-1 left-1 text-[10px] px-1.5 py-0"
      >
        {tile.category}
      </Badge>
    </div>
  );
}
