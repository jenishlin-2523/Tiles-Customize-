import { NextRequest, NextResponse } from "next/server";

// Generate a procedural tile texture
function generateTileTexture(type: string): string {
  // Return SVG data URL for procedural tile textures
  const textures: Record<string, string> = {
    // Marble textures
    "marble-white": generateMarbleTexture("#f5f5f5", "#e0e0e0", "#d0d0d0"),
    "marble-gold": generateMarbleTexture("#f5f0e0", "#e8d4a0", "#d4b070"),
    "marble-dark": generateMarbleTexture("#4a3c32", "#5c4a3a", "#3a2e26"),

    // Wood textures
    "wood-oak": generateWoodTexture("#c4a77d", "#a88a5b"),
    "wood-walnut": generateWoodTexture("#5c4033", "#3d2817"),
    "wood-grey": generateWoodTexture("#8a8a8a", "#6a6a6a"),

    // Concrete textures
    "concrete-grey": generateConcreteTexture("#808080", "#707070"),
    "concrete-charcoal": generateConcreteTexture("#4a4a4a", "#3a3a3a"),

    // Ceramic textures
    "ceramic-white": generateSolidTexture("#ffffff", "#f0f0f0"),
    "ceramic-black": generateSolidTexture("#1a1a1a", "#2a2a2a"),
    "ceramic-green": generateSolidTexture("#7fa87f", "#6a956a"),
    "ceramic-blue": generateSolidTexture("#2c4a6e", "#1e3a5e"),

    // Mosaic textures
    "mosaic-hex-white": generateHexMosaicTexture("#ffffff", "#e8e8e8"),
    "mosaic-penny-black": generatePennyMosaicTexture("#2a2a2a", "#1a1a1a"),

    // Large format slabs
    "slab-statuario": generateMarbleTexture("#fafafa", "#e8e8e8", "#d8d8d8"),
    "slab-onyx": generateMarbleTexture("#f0e8d8", "#e0d0b8", "#d0c0a0"),
  };

  return textures[type] || generateSolidTexture("#808080", "#707070");
}

function generateMarbleTexture(base: string, vein1: string, vein2: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <filter id="noise" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <linearGradient id="vein1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${vein1};stop-opacity:0.3"/>
        <stop offset="50%" style="stop-color:${vein2};stop-opacity:0.5"/>
        <stop offset="100%" style="stop-color:${vein1};stop-opacity:0.3"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="${base}"/>
    <path d="M0,100 Q128,80 256,120 T512,100" stroke="url(#vein1)" stroke-width="8" fill="none" filter="url(#noise)"/>
    <path d="M0,250 Q150,200 300,280 T512,240" stroke="url(#vein1)" stroke-width="6" fill="none" filter="url(#noise)"/>
    <path d="M0,400 Q200,350 350,420 T512,380" stroke="url(#vein1)" stroke-width="10" fill="none" filter="url(#noise)"/>
    <rect width="512" height="512" fill="${base}" opacity="0.1"/>
  </svg>`;
}

function generateWoodTexture(base: string, grain: string): string {
  const grainLines = Array.from({ length: 20 }, (_, i) => {
    const y = i * 25 + Math.random() * 10;
    return `<line x1="0" y1="${y}" x2="512" y2="${y + Math.random() * 5}" stroke="${grain}" stroke-width="${1 + Math.random() * 2}" opacity="${0.3 + Math.random() * 0.4}"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${base}"/>
    ${grainLines}
  </svg>`;
}

function generateConcreteTexture(base: string, speckle: string): string {
  const speckles = Array.from({ length: 100 }, () => {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 1 + Math.random() * 3;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${speckle}" opacity="${0.2 + Math.random() * 0.3}"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3"/>
        <feColorMatrix type="saturate" values="0"/>
        <feBlend in="SourceGraphic" mode="multiply"/>
      </filter>
    </defs>
    <rect width="512" height="512" fill="${base}"/>
    ${speckles}
    <rect width="512" height="512" fill="${base}" opacity="0.3" filter="url(#noise)"/>
  </svg>`;
}

function generateSolidTexture(base: string, edge: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${base}"/>
    <rect x="2" y="2" width="508" height="508" fill="none" stroke="${edge}" stroke-width="4"/>
  </svg>`;
}

function generateHexMosaicTexture(base: string, grout: string): string {
  const hexSize = 40;
  const hexHeight = hexSize * Math.sqrt(3);
  const hexagons: string[] = [];

  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 10; col++) {
      const x = col * hexSize * 1.5 + (row % 2) * hexSize * 0.75;
      const y = row * hexHeight * 0.5;
      hexagons.push(`
        <polygon 
          points="${x},${y + hexSize * 0.5} ${x + hexSize * 0.25},${y} ${x + hexSize * 0.75},${y} ${x + hexSize},${y + hexSize * 0.5} ${x + hexSize * 0.75},${y + hexSize} ${x + hexSize * 0.25},${y + hexSize}"
          fill="${base}" 
          stroke="${grout}" 
          stroke-width="3"
        />
      `);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${grout}"/>
    ${hexagons.join("")}
  </svg>`;
}

function generatePennyMosaicTexture(base: string, grout: string): string {
  const circleSize = 24;
  const circles: string[] = [];

  for (let row = 0; row < 22; row++) {
    for (let col = 0; col < 22; col++) {
      const x = col * circleSize + (row % 2) * circleSize * 0.5;
      const y = row * circleSize * 0.866;
      circles.push(`<circle cx="${x}" cy="${y}" r="${circleSize * 0.4}" fill="${base}"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${grout}"/>
    ${circles.join("")}
  </svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const svgContent = generateTileTexture(type);

  // Convert SVG to data URL
  const base64 = Buffer.from(svgContent).toString("base64");
  const dataUrl = `data:image/svg+xml;base64,${base64}`;

  // Return SVG directly
  return new NextResponse(svgContent, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
