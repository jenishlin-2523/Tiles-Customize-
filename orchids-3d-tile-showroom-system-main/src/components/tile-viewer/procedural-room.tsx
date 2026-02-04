"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useTileStore } from "@/lib/store/tile-store";
import { SelectableMesh } from "./selectable-mesh";
import type { RoomType } from "@/lib/db/schema";

// Room dimensions in meters (realistic room sizes)
const ROOM_CONFIGS = {
  kitchen: {
    width: 4,
    depth: 5,
    height: 2.8,
    hasBacksplash: true,
    hasCountertop: true,
    counterHeight: 0.9,
    counterDepth: 0.6,
    backsplashHeight: 0.6,
  },
  bathroom: {
    width: 3,
    depth: 3.5,
    height: 2.5,
    hasBacksplash: true,
    hasCountertop: true,
    counterHeight: 0.85,
    counterDepth: 0.5,
    backsplashHeight: 0.5,
  },
  living_room: {
    width: 6,
    depth: 7,
    height: 3,
    hasBacksplash: false,
    hasCountertop: false,
    counterHeight: 0,
    counterDepth: 0,
    backsplashHeight: 0,
  },
};

// Mesh IDs for each room part
export const MESH_IDS = {
  floor: "floor",
  wallBack: "wall-back",
  wallLeft: "wall-left",
  wallRight: "wall-right",
  wallFront: "wall-front",
  backsplash: "backsplash",
  countertop: "countertop",
};

interface ProceduralRoomProps {
  roomType: RoomType;
}

export function ProceduralRoom({ roomType }: ProceduralRoomProps) {
  const config = ROOM_CONFIGS[roomType];
  const showBeforeView = useTileStore((state) => state.showBeforeView);

  // Default materials (before state)
  const defaultFloorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#808080",
        roughness: 0.8,
        metalness: 0.1,
      }),
    []
  );

  const defaultWallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f5f5f5",
        roughness: 0.9,
        metalness: 0,
      }),
    []
  );

  const defaultCounterMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3a3a3a",
        roughness: 0.3,
        metalness: 0.2,
      }),
    []
  );

  // Calculate positions
  const halfWidth = config.width / 2;
  const halfDepth = config.depth / 2;
  const halfHeight = config.height / 2;

  return (
    <group>
      {/* Floor */}
      <SelectableMesh
        meshId={MESH_IDS.floor}
        meshType="floor"
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        defaultMaterial={defaultFloorMaterial}
        showDefault={showBeforeView}
        dimensions={{ width: config.width, height: config.depth }}
      >
        <planeGeometry args={[config.width, config.depth]} />
      </SelectableMesh>

      {/* Back Wall (Z-) */}
      <SelectableMesh
        meshId={MESH_IDS.wallBack}
        meshType="wall"
        position={[0, halfHeight, -halfDepth]}
        rotation={[0, 0, 0]}
        defaultMaterial={defaultWallMaterial}
        showDefault={showBeforeView}
        dimensions={{ width: config.width, height: config.height }}
      >
        <planeGeometry args={[config.width, config.height]} />
      </SelectableMesh>

      {/* Left Wall (X-) */}
      <SelectableMesh
        meshId={MESH_IDS.wallLeft}
        meshType="wall"
        position={[-halfWidth, halfHeight, 0]}
        rotation={[0, Math.PI / 2, 0]}
        defaultMaterial={defaultWallMaterial}
        showDefault={showBeforeView}
        dimensions={{ width: config.depth, height: config.height }}
      >
        <planeGeometry args={[config.depth, config.height]} />
      </SelectableMesh>

      {/* Right Wall (X+) */}
      <SelectableMesh
        meshId={MESH_IDS.wallRight}
        meshType="wall"
        position={[halfWidth, halfHeight, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        defaultMaterial={defaultWallMaterial}
        showDefault={showBeforeView}
        dimensions={{ width: config.depth, height: config.height }}
      >
        <planeGeometry args={[config.depth, config.height]} />
      </SelectableMesh>

      {/* Ceiling (optional visual reference) */}
      <mesh position={[0, config.height, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[config.width, config.depth]} />
        <meshStandardMaterial color="#ffffff" side={THREE.BackSide} />
      </mesh>

      {/* Counter and Backsplash for Kitchen/Bathroom */}
      {config.hasCountertop && (
        <>
          {/* Countertop */}
          <SelectableMesh
            meshId={MESH_IDS.countertop}
            meshType="countertop"
            position={[0, config.counterHeight, -halfDepth + config.counterDepth / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            defaultMaterial={defaultCounterMaterial}
            showDefault={showBeforeView}
            dimensions={{ width: config.width, height: config.counterDepth }}
          >
            <planeGeometry args={[config.width, config.counterDepth]} />
          </SelectableMesh>

          {/* Counter base (visual) */}
          <mesh
            position={[0, config.counterHeight / 2, -halfDepth + config.counterDepth / 2]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[config.width, config.counterHeight, config.counterDepth]} />
            <meshStandardMaterial color="#4a4a4a" roughness={0.7} />
          </mesh>
        </>
      )}

      {config.hasBacksplash && (
        <SelectableMesh
          meshId={MESH_IDS.backsplash}
          meshType="backsplash"
          position={[
            0,
            config.counterHeight + config.backsplashHeight / 2,
            -halfDepth + 0.01,
          ]}
          rotation={[0, 0, 0]}
          defaultMaterial={defaultWallMaterial}
          showDefault={showBeforeView}
          dimensions={{ width: config.width, height: config.backsplashHeight }}
        >
          <planeGeometry args={[config.width, config.backsplashHeight]} />
        </SelectableMesh>
      )}

      {/* Room fixtures based on type */}
      {roomType === "kitchen" && <KitchenFixtures config={config} />}
      {roomType === "bathroom" && <BathroomFixtures config={config} />}
      {roomType === "living_room" && <LivingRoomFixtures config={config} />}
    </group>
  );
}

// Kitchen-specific fixtures
function KitchenFixtures({ config }: { config: typeof ROOM_CONFIGS.kitchen }) {
  const halfDepth = config.depth / 2;

  return (
    <group>
      {/* Sink area */}
      <mesh
        position={[0, config.counterHeight + 0.02, -halfDepth + config.counterDepth / 2]}
        castShadow
      >
        <boxGeometry args={[0.6, 0.04, 0.45]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Stove area */}
      <mesh
        position={[1.2, config.counterHeight + 0.02, -halfDepth + config.counterDepth / 2]}
        castShadow
      >
        <boxGeometry args={[0.6, 0.03, 0.5]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} />
      </mesh>

      {/* Upper cabinets */}
      <mesh position={[0, 2, -halfDepth + 0.2]} castShadow receiveShadow>
        <boxGeometry args={[config.width - 0.4, 0.7, 0.35]} />
        <meshStandardMaterial color="#5c4033" roughness={0.6} />
      </mesh>
    </group>
  );
}

// Bathroom-specific fixtures
function BathroomFixtures({ config }: { config: typeof ROOM_CONFIGS.bathroom }) {
  const halfWidth = config.width / 2;
  const halfDepth = config.depth / 2;

  return (
    <group>
      {/* Sink */}
      <mesh
        position={[0, config.counterHeight + 0.05, -halfDepth + config.counterDepth / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.2, 0.25, 0.1, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Bathtub/Shower area */}
      <mesh position={[-halfWidth + 0.5, 0.3, halfDepth - 0.8]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.6, 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>

      {/* Toilet */}
      <group position={[halfWidth - 0.4, 0, halfDepth - 0.5]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.5, -0.1]} castShadow>
          <boxGeometry args={[0.35, 0.5, 0.15]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      </group>

      {/* Mirror */}
      <mesh position={[0, 1.5, -halfDepth + 0.02]}>
        <planeGeometry args={[1, 0.8]} />
        <meshStandardMaterial color="#88ccff" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// Living room-specific fixtures
function LivingRoomFixtures({ config }: { config: typeof ROOM_CONFIGS.living_room }) {
  const halfWidth = config.width / 2;
  const halfDepth = config.depth / 2;

  return (
    <group>
      {/* Sofa */}
      <group position={[0, 0, halfDepth - 1]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.5, 0.9]} />
          <meshStandardMaterial color="#4a5568" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.55, -0.35]} castShadow>
          <boxGeometry args={[2.5, 0.5, 0.2]} />
          <meshStandardMaterial color="#4a5568" roughness={0.8} />
        </mesh>
        {/* Armrests */}
        <mesh position={[-1.15, 0.35, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.9]} />
          <meshStandardMaterial color="#4a5568" roughness={0.8} />
        </mesh>
        <mesh position={[1.15, 0.35, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.9]} />
          <meshStandardMaterial color="#4a5568" roughness={0.8} />
        </mesh>
      </group>

      {/* Coffee table */}
      <mesh position={[0, 0.25, halfDepth - 2.5]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#8b4513" roughness={0.5} />
      </mesh>
      {/* Table legs */}
      {[[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, halfDepth - 2.5 + z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.2]} />
          <meshStandardMaterial color="#5c4033" />
        </mesh>
      ))}

      {/* TV unit */}
      <mesh position={[0, 0.3, -halfDepth + 0.3]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.6, 0.5]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.6} />
      </mesh>

      {/* TV screen */}
      <mesh position={[0, 1.2, -halfDepth + 0.1]}>
        <planeGeometry args={[1.8, 1]} />
        <meshStandardMaterial color="#111111" roughness={0.2} />
      </mesh>

      {/* Rug (visual only, not selectable) */}
      <mesh position={[0, 0.01, halfDepth - 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#8b7355" roughness={0.95} />
      </mesh>
    </group>
  );
}
