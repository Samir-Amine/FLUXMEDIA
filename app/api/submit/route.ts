import { NextResponse } from "next/server";
import { getDb, mutateDb } from "@/lib/db";
import { sendToMake } from "@/lib/make";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      type,
      fullName,
      email,
      whatsapp,
      company,
      selectedId,
      selectedName,
      selectedPrice,
      description,
      additional,
      platforms,
      goals,
      brandInfo,
    } = body;

    if (!type || !fullName || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields.",
        },
        { status: 400 }
      );
    }

    if (type !== "automation" && type !== "social_media") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request type.",
        },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const request = {
      id,
      type,
      fullName,
      email,
      whatsapp: whatsapp || "",
      company: company || "",
      selectedId: selectedId || "",
      selectedName: selectedName || "",
      selectedPrice: selectedPrice || "",
      description: description || "",
      additional: additional || "",
      platforms: Array.isArray(platforms) ? platforms : [],
      goals: goals || "",
      brandInfo: brandInfo || "",
      status: "new" as const,
      createdAt: new Date().toISOString(),
    };

    await mutateDb((db) => {
      db.requests.unshift(request);
    });

    // Send the newly created request to Make.com.
    // This happens server-side, so the Make webhook URL
    // is never exposed to the browser.
    await sendToMake("service_request.created", request);

    return NextResponse.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Submit request error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit request.",
      },
      { status: 500 }
    );
  }
}