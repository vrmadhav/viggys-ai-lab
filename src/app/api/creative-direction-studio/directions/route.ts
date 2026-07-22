import { NextResponse } from "next/server";
import { z } from "zod";
import { workingIntentSchema } from "@/features/creative-direction-studio/lib/schemas";
import { generateDirectionsMock } from "@/features/creative-direction-studio/server/mock-language-services";

const requestSchema = z.object({ workingIntent: workingIntentSchema });

export async function POST(request: Request) {
  try {
    const { workingIntent } = requestSchema.parse(await request.json());
    return NextResponse.json({ directions: generateDirectionsMock(workingIntent), languageProvider: "mock-creative-director-v1" });
  } catch {
    return NextResponse.json({ error: "I couldn’t build directions from this intent. Your context is unchanged." }, { status: 400 });
  }
}

