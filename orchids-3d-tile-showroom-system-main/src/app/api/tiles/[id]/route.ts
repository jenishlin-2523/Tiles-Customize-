import { NextRequest, NextResponse } from "next/server";
import { db, tiles } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/tiles/[id] - Get a specific tile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(tiles).where(eq(tiles.id, id));

    if (result.length === 0) {
      return NextResponse.json({ error: "Tile not found" }, { status: 404 });
    }

    return NextResponse.json({ tile: result[0] });
  } catch (error) {
    console.error("Error fetching tile:", error);
    return NextResponse.json(
      { error: "Failed to fetch tile" },
      { status: 500 }
    );
  }
}

// PUT /api/tiles/[id] - Update a tile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await db
      .update(tiles)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(tiles.id, id));

    const updated = await db.select().from(tiles).where(eq(tiles.id, id));

    return NextResponse.json({ tile: updated[0] });
  } catch (error) {
    console.error("Error updating tile:", error);
    return NextResponse.json(
      { error: "Failed to update tile" },
      { status: 500 }
    );
  }
}

// DELETE /api/tiles/[id] - Delete a tile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(tiles).where(eq(tiles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tile:", error);
    return NextResponse.json(
      { error: "Failed to delete tile" },
      { status: 500 }
    );
  }
}
