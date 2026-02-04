"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { useTileStore, useLightingPreset } from "@/lib/store/tile-store";
import { ProceduralRoom } from "./procedural-room";

// Lighting presets configuration
const LIGHTING_PRESETS = {
  daylight: {
    ambientIntensity: 0.6,
    directionalIntensity: 1.2,
    directionalColor: "#ffffff",
    directionalPosition: [5, 10, 5] as [number, number, number],
    envPreset: "apartment" as const,
  },
  warm: {
    ambientIntensity: 0.4,
    directionalIntensity: 1.0,
    directionalColor: "#ffcc88",
    directionalPosition: [3, 8, 2] as [number, number, number],
    envPreset: "sunset" as const,
  },
  cool: {
    ambientIntensity: 0.5,
    directionalIntensity: 0.9,
    directionalColor: "#ccddff",
    directionalPosition: [4, 12, 6] as [number, number, number],
    envPreset: "dawn" as const,
  },
};

// Scene lighting component
function SceneLighting() {
  const lightingPreset = useLightingPreset();
  const config = LIGHTING_PRESETS[lightingPreset];

  return (
    <>
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight
        position={config.directionalPosition}
        intensity={config.directionalIntensity}
        color={config.directionalColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <hemisphereLight
        color="#ffffff"
        groundColor="#444444"
        intensity={0.3}
      />
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#cccccc" wireframe />
    </mesh>
  );
}

// Camera positions for different room types
const CAMERA_POSITIONS = {
  kitchen: { position: [6, 4, 6] as [number, number, number], target: [0, 1, 0] as [number, number, number] },
  bathroom: { position: [4, 3, 4] as [number, number, number], target: [0, 1, 0] as [number, number, number] },
  living_room: { position: [8, 5, 8] as [number, number, number], target: [0, 1, 0] as [number, number, number] },
};

export interface RoomViewerHandle {
  takeScreenshot: () => string | null;
}

interface RoomViewerProps {
  className?: string;
}

export const RoomViewer = forwardRef<RoomViewerHandle, RoomViewerProps>(
  function RoomViewer({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const currentRoom = useTileStore((state) => state.currentRoom);
    const cameraConfig = CAMERA_POSITIONS[currentRoom];

    useImperativeHandle(ref, () => ({
      takeScreenshot: () => {
        if (canvasRef.current) {
          return canvasRef.current.toDataURL("image/png");
        }
        return null;
      },
    }));

    return (
      <div className={`w-full h-full ${className || ""}`}>
        <Canvas
          ref={canvasRef}
          shadows
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor("#1a1a1a");
          }}
        >
          <PerspectiveCamera
            makeDefault
            position={cameraConfig.position}
            fov={50}
          />
          
          <SceneLighting />
          
          <Suspense fallback={<LoadingFallback />}>
            <ProceduralRoom roomType={currentRoom} />
            <Environment preset="apartment" background={false} />
          </Suspense>

          <OrbitControls
            target={cameraConfig.target}
            minDistance={3}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2 - 0.1}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Canvas>
      </div>
    );
  }
);
