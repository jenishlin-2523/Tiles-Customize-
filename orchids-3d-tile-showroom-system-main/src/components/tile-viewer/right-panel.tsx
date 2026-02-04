"use client";

import { useState } from "react";
import { useTileStore } from "@/lib/store/tile-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LightingPreset, LayoutPattern } from "@/lib/db/schema";
import { MESH_IDS } from "./procedural-room";
import {
  Sun,
  Sunset,
  Moon,
  Grid3X3,
  Layers,
  RotateCcw,
  Camera,
  Save,
  Download,
  Paintbrush,
  X,
} from "lucide-react";

// Lighting presets
const LIGHTING_OPTIONS: { id: LightingPreset; label: string; icon: React.ReactNode }[] = [
  { id: "daylight", label: "Daylight", icon: <Sun className="h-4 w-4" /> },
  { id: "warm", label: "Warm", icon: <Sunset className="h-4 w-4" /> },
  { id: "cool", label: "Cool", icon: <Moon className="h-4 w-4" /> },
];

// Layout patterns
const PATTERN_OPTIONS: { id: LayoutPattern; label: string }[] = [
  { id: "straight", label: "Straight" },
  { id: "brick", label: "Brick (Offset)" },
  { id: "herringbone", label: "Herringbone" },
  { id: "diagonal", label: "Diagonal" },
];

// Mesh display names
const MESH_NAMES: Record<string, string> = {
  [MESH_IDS.floor]: "Floor",
  [MESH_IDS.wallBack]: "Back Wall",
  [MESH_IDS.wallLeft]: "Left Wall",
  [MESH_IDS.wallRight]: "Right Wall",
  [MESH_IDS.backsplash]: "Backsplash",
  [MESH_IDS.countertop]: "Countertop",
};

interface RightPanelProps {
  className?: string;
  onScreenshot?: () => void;
  onClose?: () => void;
}

export function RightPanel({ className, onScreenshot, onClose }: RightPanelProps) {
  const selectedTile = useTileStore((state) => state.selectedTile);
  const selectedMeshId = useTileStore((state) => state.selectedMeshId);
  const setSelectedMeshId = useTileStore((state) => state.setSelectedMeshId);
  const meshMappings = useTileStore((state) => state.meshMappings);
  const applyTileToMesh = useTileStore((state) => state.applyTileToMesh);
  const removeTileFromMesh = useTileStore((state) => state.removeTileFromMesh);
  const currentPattern = useTileStore((state) => state.currentPattern);
  const setCurrentPattern = useTileStore((state) => state.setCurrentPattern);
  const lightingPreset = useTileStore((state) => state.lightingPreset);
  const setLightingPreset = useTileStore((state) => state.setLightingPreset);
  const showBeforeView = useTileStore((state) => state.showBeforeView);
  const setShowBeforeView = useTileStore((state) => state.setShowBeforeView);
  const currentRoom = useTileStore((state) => state.currentRoom);
  const tiles = useTileStore((state) => state.tiles);
  const resetRoom = useTileStore((state) => state.resetRoom);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const [customerName, setCustomerName] = useState("");

  // Get applied tile info for selected mesh
  const selectedMeshMapping = selectedMeshId ? meshMappings[selectedMeshId] : null;
  const appliedTile = selectedMeshMapping
    ? tiles.find((t) => t.id === selectedMeshMapping.tileId)
    : null;

  // Handle applying tile to selected mesh
  const handleApplyTile = () => {
    if (selectedTile && selectedMeshId) {
      applyTileToMesh(selectedMeshId, selectedTile.id, currentPattern);
    }
  };

  // Handle saving design
  const handleSaveDesign = async () => {
    if (!designName.trim()) return;

    try {
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: designName,
          customerName: customerName || null,
          roomType: currentRoom,
          meshMappings,
          lightingPreset,
        }),
      });

      if (response.ok) {
        setSaveDialogOpen(false);
        setDesignName("");
        setCustomerName("");
      }
    } catch (error) {
      console.error("Failed to save design:", error);
    }
  };

  return (
    <div className={cn("flex flex-col h-full overflow-hidden bg-card border-l", className)}>
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tile Controls</h2>
          <p className="text-sm text-muted-foreground">Apply and customize</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 h-0">
        <div className="p-4 pb-8 space-y-6">
          {/* Selected Tile Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Selected Tile</h3>
            {selectedTile ? (
              <div className="rounded-lg border overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={selectedTile.imageUrl}
                    alt={selectedTile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-medium">{selectedTile.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Size:</span>{" "}
                      {selectedTile.width}×{selectedTile.height}mm
                    </div>
                    <div>
                      <span className="font-medium">Finish:</span>{" "}
                      {selectedTile.finish}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>{" "}
                      {selectedTile.category}
                    </div>
                    {selectedTile.collection && (
                      <div>
                        <span className="font-medium">Collection:</span>{" "}
                        {selectedTile.collection}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tile selected</p>
                <p className="text-xs">Select a tile from the left panel</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Selected Mesh Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Selected Surface</h3>
            {selectedMeshId ? (
              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {MESH_NAMES[selectedMeshId] || selectedMeshId}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMeshId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {appliedTile && (
                  <div className="text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium">Applied:</span> {appliedTile.name}
                    </p>
                    <p>
                      <span className="font-medium">Pattern:</span>{" "}
                      {selectedMeshMapping?.pattern}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleApplyTile}
                    disabled={!selectedTile}
                    className="flex-1"
                  >
                    <Paintbrush className="h-4 w-4 mr-1" />
                    Apply Tile
                  </Button>
                  {selectedMeshMapping && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTileFromMesh(selectedMeshId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No surface selected</p>
                <p className="text-xs">Click a surface in the 3D view</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Layout Pattern */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Layout Pattern</h3>
            <Select
              value={currentPattern}
              onValueChange={(value: LayoutPattern) => setCurrentPattern(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                {PATTERN_OPTIONS.map((pattern) => (
                  <SelectItem key={pattern.id} value={pattern.id}>
                    {pattern.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Lighting Presets */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Lighting</h3>
            <div className="grid grid-cols-3 gap-2">
              {LIGHTING_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  variant={lightingPreset === option.id ? "default" : "outline"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setLightingPreset(option.id)}
                >
                  {option.icon}
                  <span className="text-xs mt-1">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Before/After Toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">View Options</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="before-after" className="cursor-pointer">
                Show Before View
              </Label>
              <Switch
                id="before-after"
                checked={showBeforeView}
                onCheckedChange={setShowBeforeView}
              />
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Actions</h3>

            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={onScreenshot}
            >
              <Camera className="h-4 w-4" />
              Take Screenshot
            </Button>

            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Save className="h-4 w-4" />
                  Save Design
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Room Design</DialogTitle>
                  <DialogDescription>
                    Save this design for future reference or customer presentation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="design-name">Design Name *</Label>
                    <Input
                      id="design-name"
                      placeholder="e.g., Modern Kitchen Design"
                      value={designName}
                      onChange={(e) => setDesignName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Customer Name (Optional)</Label>
                    <Input
                      id="customer-name"
                      placeholder="e.g., John Smith"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSaveDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveDesign}
                    disabled={!designName.trim()}
                  >
                    Save Design
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={resetRoom}
            >
              <RotateCcw className="h-4 w-4" />
              Reset Room
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
