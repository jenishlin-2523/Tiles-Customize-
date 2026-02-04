"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useTileStore } from "@/lib/store/tile-store";
import { LeftPanel } from "@/components/tile-viewer/left-panel";
import { RightPanel } from "@/components/tile-viewer/right-panel";
import { SAMPLE_TILES } from "@/lib/data/sample-tiles";
import type { RoomViewerHandle } from "@/components/tile-viewer/room-viewer";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Settings2, Menu } from "lucide-react";

// Dynamic import for 3D viewer to avoid SSR issues
const RoomViewer = dynamic(
  () => import("@/components/tile-viewer/room-viewer").then((mod) => mod.RoomViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Loading 3D Viewer...</p>
        </div>
      </div>
    ),
  }
);

export default function TileVisualizerPage() {
  const viewerRef = useRef<RoomViewerHandle>(null);
  const setTiles = useTileStore((state) => state.setTiles);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Load sample tiles on mount
  useEffect(() => {
    setTiles(SAMPLE_TILES);
  }, [setTiles]);

  // Handle screenshot
  const handleScreenshot = useCallback(() => {
    if (viewerRef.current) {
      const dataUrl = viewerRef.current.takeScreenshot();
      if (dataUrl) {
        // Create download link
        const link = document.createElement("a");
        link.download = `tile-design-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    }
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Left Panel */}
      <LeftPanel className="hidden lg:flex w-72 flex-shrink-0" />

      {/* Center - 3D Room Viewer */}
      <div className="flex-1 relative">
        <RoomViewer ref={viewerRef} className="absolute inset-0" />
        
        {/* Mobile Header/Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between lg:hidden pointer-events-none">
          <div className="pointer-events-auto flex gap-2">
            <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="icon" className="shadow-lg">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
<SheetContent side="left" className="p-0 w-72 sm:w-80" title="Tile Selection">
                  <LeftPanel 
                    className="border-none" 
                    onClose={() => setLeftOpen(false)} 
                  />
                </SheetContent>
            </Sheet>
          </div>

          <div className="pointer-events-auto flex gap-2">
            <Sheet open={rightOpen} onOpenChange={setRightOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="icon" className="shadow-lg">
                  <Settings2 className="h-5 w-5" />
                </Button>
              </SheetTrigger>
<SheetContent side="right" className="p-0 w-80" title="Settings">
                  <RightPanel 
                    className="border-none" 
                    onScreenshot={() => {
                      handleScreenshot();
                      setRightOpen(false);
                    }} 
                    onClose={() => setRightOpen(false)}
                  />
                </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Overlay instructions - Adjusted for mobile */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto flex justify-center sm:justify-start pointer-events-none">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm max-w-xs shadow-xl backdrop-blur-sm">
            <p className="font-medium mb-1">Controls:</p>
            <ul className="text-xs space-y-0.5 text-zinc-300">
              <li>• Tap surface to select</li>
              <li>• Tap again with tile to apply</li>
              <li className="hidden sm:block">• Drag to rotate • Scroll to zoom</li>
              <li className="sm:hidden">• Pinch to zoom • Drag to rotate</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop Right Panel */}
      <RightPanel 
        className="hidden lg:flex w-80 flex-shrink-0" 
        onScreenshot={handleScreenshot} 
      />
    </div>
  );
}
