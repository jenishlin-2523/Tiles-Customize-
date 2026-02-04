"use client";

import { useRef, useMemo, useEffect, ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTileStore } from "@/lib/store/tile-store";
import { createTileTexture } from "./texture-utils";
import type { LayoutPattern } from "@/lib/db/schema";

interface SelectableMeshProps {
  meshId: string;
  meshType: "floor" | "wall" | "backsplash" | "countertop";
  position: [number, number, number];
  rotation: [number, number, number];
  defaultMaterial: THREE.MeshStandardMaterial;
  showDefault: boolean;
  dimensions: { width: number; height: number };
  children: ReactNode;
}

export function SelectableMesh({
  meshId,
  meshType,
  position,
  rotation,
  defaultMaterial,
  showDefault,
  dimensions,
  children,
}: SelectableMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const outlineRef = useRef<THREE.LineSegments>(null);

  const selectedMeshId = useTileStore((state) => state.selectedMeshId);
  const hoveredMeshId = useTileStore((state) => state.hoveredMeshId);
  const setSelectedMeshId = useTileStore((state) => state.setSelectedMeshId);
  const setHoveredMeshId = useTileStore((state) => state.setHoveredMeshId);
  const meshMappings = useTileStore((state) => state.meshMappings);
  const tiles = useTileStore((state) => state.tiles);
  const selectedTile = useTileStore((state) => state.selectedTile);
  const applyTileToMesh = useTileStore((state) => state.applyTileToMesh);

  const isSelected = selectedMeshId === meshId;
  const isHovered = hoveredMeshId === meshId;
  const mapping = meshMappings[meshId];

  // Create tiled texture material when a tile is applied
  const tiledMaterial = useMemo(() => {
    if (showDefault || !mapping) return null;

    const tile = tiles.find((t) => t.id === mapping.tileId);
    if (!tile) return null;

    return createTileTexture(
      tile.imageUrl,
      tile.width,
      tile.height,
      dimensions.width,
      dimensions.height,
      mapping.pattern,
      tile.finish === "glossy" ? 0.3 : tile.finish === "matte" ? 0.8 : 0.6
    );
  }, [mapping, tiles, dimensions, showDefault]);

  // Outline geometry for selection highlight
  const outlineGeometry = useMemo(() => {
    const geo = new THREE.EdgesGeometry(
      new THREE.PlaneGeometry(dimensions.width + 0.02, dimensions.height + 0.02)
    );
    return geo;
  }, [dimensions]);

  // Animate outline
  useFrame((state) => {
    if (outlineRef.current) {
      const material = outlineRef.current.material as THREE.LineBasicMaterial;
      if (isSelected) {
        material.color.setHSL((state.clock.elapsedTime * 0.5) % 1, 1, 0.5);
        material.opacity = 1;
      } else if (isHovered) {
        material.color.set("#00ff88");
        material.opacity = 0.8;
      } else {
        material.opacity = 0;
      }
    }
  });

  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    
    // If a tile is selected and this mesh is clicked, apply the tile
    if (selectedTile && isSelected) {
      applyTileToMesh(meshId, selectedTile.id);
    } else {
      setSelectedMeshId(meshId);
    }
  };

  const handlePointerOver = (e: THREE.Event) => {
    e.stopPropagation();
    setHoveredMeshId(meshId);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHoveredMeshId(null);
    document.body.style.cursor = "auto";
  };

  // Determine which material to use
  const activeMaterial = showDefault || !tiledMaterial ? defaultMaterial : tiledMaterial;

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        receiveShadow
        castShadow
        material={activeMaterial}
      >
        {children}
      </mesh>

      {/* Selection/Hover outline */}
      <lineSegments ref={outlineRef} geometry={outlineGeometry}>
        <lineBasicMaterial
          color="#00ff88"
          transparent
          opacity={0}
          linewidth={2}
        />
      </lineSegments>

      {/* Highlight overlay when selected */}
      {isSelected && (
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[dimensions.width, dimensions.height]} />
          <meshBasicMaterial
            color="#00ff88"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
