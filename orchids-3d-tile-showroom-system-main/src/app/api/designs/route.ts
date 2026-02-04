import { NextRequest, NextResponse } from "next/server";
import { db, roomDesigns, type NewRoomDesign } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/designs - Get all saved room designs
export async function GET() {
  try {
    const results = await db.select().from(roomDesigns);
    
    // Parse the meshMappings JSON for each design
    const designs = results.map((d) => ({
      ...d,
      meshMappings: JSON.parse(d.meshMappings),
    }));

    return NextResponse.json({ designs });
  } catch (error) {
    console.error("Error fetching designs:", error);
    return NextResponse.json(
      { error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
}

// POST /api/designs - Save a new room design
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newDesign: NewRoomDesign = {
      id: crypto.randomUUID(),
      name: body.name,
      customerName: body.customerName || null,
      roomType: body.roomType,
      meshMappings: JSON.stringify(body.meshMappings),
      lightingPreset: body.lightingPreset || "daylight",
      screenshotUrl: body.screenshotUrl || null,
    };

    await db.insert(roomDesigns).values(newDesign);

    return NextResponse.json(
      {
        design: {
          ...newDesign,
          meshMappings: body.meshMappings,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving design:", error);
    return NextResponse.json(
      { error: "Failed to save design" },
      { status: 500 }
    );
  }
}
