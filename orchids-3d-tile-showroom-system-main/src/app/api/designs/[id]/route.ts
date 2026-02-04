import { NextRequest, NextResponse } from "next/server";
import { db, roomDesigns } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/designs/[id] - Get a specific design
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(roomDesigns)
      .where(eq(roomDesigns.id, id));

    if (result.length === 0) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const design = {
      ...result[0],
      meshMappings: JSON.parse(result[0].meshMappings),
    };

    return NextResponse.json({ design });
  } catch (error) {
    console.error("Error fetching design:", error);
    return NextResponse.json(
      { error: "Failed to fetch design" },
      { status: 500 }
    );
  }
}

// PUT /api/designs/[id] - Update a design
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.name) updateData.name = body.name;
    if (body.customerName !== undefined)
      updateData.customerName = body.customerName;
    if (body.meshMappings)
      updateData.meshMappings = JSON.stringify(body.meshMappings);
    if (body.lightingPreset) updateData.lightingPreset = body.lightingPreset;
    if (body.screenshotUrl !== undefined)
      updateData.screenshotUrl = body.screenshotUrl;

    await db.update(roomDesigns).set(updateData).where(eq(roomDesigns.id, id));

    const updated = await db
      .select()
      .from(roomDesigns)
      .where(eq(roomDesigns.id, id));

    return NextResponse.json({
      design: {
        ...updated[0],
        meshMappings: JSON.parse(updated[0].meshMappings),
      },
    });
  } catch (error) {
    console.error("Error updating design:", error);
    return NextResponse.json(
      { error: "Failed to update design" },
      { status: 500 }
    );
  }
}

// DELETE /api/designs/[id] - Delete a design
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(roomDesigns).where(eq(roomDesigns.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting design:", error);
    return NextResponse.json(
      { error: "Failed to delete design" },
      { status: 500 }
    );
  }
}
