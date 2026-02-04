import * as THREE from "three";
import type { LayoutPattern } from "@/lib/db/schema";

// Grout line width in pixels (for texture generation)
const GROUT_WIDTH = 4;
const GROUT_COLOR = "#888888";

// Cache for loaded textures
const textureCache = new Map<string, THREE.Texture>();
const materialCache = new Map<string, THREE.MeshStandardMaterial>();

/**
 * Creates a Three.js material with tiled texture based on tile dimensions and pattern
 * @param imageUrl - URL of the tile image
 * @param tileWidthMm - Tile width in millimeters
 * @param tileHeightMm - Tile height in millimeters
 * @param surfaceWidthM - Surface width in meters
 * @param surfaceHeightM - Surface height in meters
 * @param pattern - Layout pattern (straight, brick, herringbone, diagonal)
 * @param roughness - Material roughness (0-1)
 */
export function createTileTexture(
  imageUrl: string,
  tileWidthMm: number,
  tileHeightMm: number,
  surfaceWidthM: number,
  surfaceHeightM: number,
  pattern: LayoutPattern,
  roughness: number = 0.5
): THREE.MeshStandardMaterial {
  // Create cache key
  const cacheKey = `${imageUrl}-${tileWidthMm}-${tileHeightMm}-${surfaceWidthM}-${surfaceHeightM}-${pattern}-${roughness}`;

  // Check cache first
  if (materialCache.has(cacheKey)) {
    return materialCache.get(cacheKey)!;
  }

  // Convert tile dimensions from mm to meters
  const tileWidthM = tileWidthMm / 1000;
  const tileHeightM = tileHeightMm / 1000;

  // Calculate how many tiles fit in each direction
  const repeatX = surfaceWidthM / tileWidthM;
  const repeatY = surfaceHeightM / tileHeightM;

  // Load or get cached texture
  let texture: THREE.Texture;
  if (textureCache.has(imageUrl)) {
    texture = textureCache.get(imageUrl)!.clone();
  } else {
    const loader = new THREE.TextureLoader();
    texture = loader.load(imageUrl);
    textureCache.set(imageUrl, texture);
  }

  // Configure texture wrapping and repeat
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  // Apply pattern-specific transformations
  switch (pattern) {
    case "straight":
      texture.repeat.set(repeatX, repeatY);
      texture.offset.set(0, 0);
      texture.rotation = 0;
      break;

    case "brick":
      // Brick pattern: offset every other row by half a tile
      texture.repeat.set(repeatX, repeatY);
      texture.offset.set(0, 0);
      // The brick offset is handled via UV manipulation or shader
      // For now, we use a simple approach
      break;

    case "herringbone":
      // Herringbone pattern at 45 degrees
      // Scale up to account for diagonal orientation
      const herringboneScale = Math.sqrt(2);
      texture.repeat.set(repeatX * herringboneScale, repeatY * herringboneScale);
      texture.rotation = Math.PI / 4;
      texture.center.set(0.5, 0.5);
      break;

    case "diagonal":
      // Diagonal pattern at 45 degrees
      texture.repeat.set(repeatX * 1.41, repeatY * 1.41);
      texture.rotation = Math.PI / 4;
      texture.center.set(0.5, 0.5);
      break;

    default:
      texture.repeat.set(repeatX, repeatY);
  }

  // Enable anisotropic filtering for better quality at angles
  texture.anisotropy = 16;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;

  // Create the material
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: roughness,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // Cache and return
  materialCache.set(cacheKey, material);
  return material;
}

/**
 * Creates a canvas texture with grout lines for more realistic tile appearance
 * @param imageUrl - Base tile image URL
 * @param tileSize - Size of the tile in the canvas
 * @param groutWidth - Width of grout lines
 */
export async function createTileWithGrout(
  imageUrl: string,
  tileSize: number = 256,
  groutWidth: number = GROUT_WIDTH
): Promise<THREE.CanvasTexture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const totalSize = tileSize + groutWidth;
      canvas.width = totalSize;
      canvas.height = totalSize;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Fill with grout color
      ctx.fillStyle = GROUT_COLOR;
      ctx.fillRect(0, 0, totalSize, totalSize);

      // Draw the tile image
      ctx.drawImage(img, 0, 0, tileSize, tileSize);

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;

      resolve(texture);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };

    img.src = imageUrl;
  });
}

/**
 * Clears the texture and material caches
 * Call this when changing rooms or when memory needs to be freed
 */
export function clearTextureCache() {
  textureCache.forEach((texture) => texture.dispose());
  materialCache.forEach((material) => {
    material.map?.dispose();
    material.dispose();
  });
  textureCache.clear();
  materialCache.clear();
}

/**
 * Preloads a tile texture for faster application
 * @param imageUrl - URL of the tile image to preload
 */
export function preloadTileTexture(imageUrl: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    if (textureCache.has(imageUrl)) {
      resolve(textureCache.get(imageUrl)!);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        textureCache.set(imageUrl, texture);
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}
