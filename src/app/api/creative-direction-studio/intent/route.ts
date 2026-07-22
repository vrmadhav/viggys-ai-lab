import { NextResponse } from "next/server";
import { z } from "zod";
import { workingIntentSchema } from "@/features/creative-direction-studio/lib/schemas";
import { updateIntentMock } from "@/features/creative-direction-studio/server/mock-language-services";

const requestSchema = z.object({ previousIntent: workingIntentSchema, contribution: z.string().trim().min(1).max(4000) });

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    return NextResponse.json(updateIntentMock(input.previousIntent, input.contribution));
  } catch {
    return NextResponse.json({ error: "I couldn’t interpret that update. Your existing work is unchanged." }, { status: 400 });
  }
}

