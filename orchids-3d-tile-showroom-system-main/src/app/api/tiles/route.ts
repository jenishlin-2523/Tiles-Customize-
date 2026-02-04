import { NextRequest, NextResponse } from "next/server";
import { db, tiles, type NewTile } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "crypto";

// GET /api/tiles - Get all tiles with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const collection = searchParams.get("collection");

    let query = db.select().from(tiles);

    // Apply filters if provided
    const results = await query;
    
    let filteredResults = results;
    if (category && category !== "all") {
      filteredResults = filteredResults.filter((t) => t.category === category);
    }
    if (collection) {
      filteredResults = filteredResults.filter((t) => t.collection === collection);
    }

    return NextResponse.json({ tiles: filteredResults });
  } catch (error) {
    console.error("Error fetching tiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch tiles" },
      { status: 500 }
    );
  }
}

// POST /api/tiles - Create a new tile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newTile: NewTile = {
      id: crypto.randomUUID(),
      name: body.name,
      category: body.category,
      width: body.width,
      height: body.height,
      finish: body.finish,
      imageUrl: body.imageUrl,
      thumbnailUrl: body.thumbnailUrl || body.imageUrl,
      collection: body.collection || null,
      color: body.color || null,
      isPreloaded: body.isPreloaded || false,
    };

    await db.insert(tiles).values(newTile);

    return NextResponse.json({ tile: newTile }, { status: 201 });
  } catch (error) {
    console.error("Error creating tile:", error);
    return NextResponse.json(
      { error: "Failed to create tile" },
      { status: 500 }
    );
  }
}
