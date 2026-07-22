import { NextResponse } from "next/server";
import { z } from "zod";
import { directionSchema } from "@/features/creative-direction-studio/lib/schemas";
import { refineDirectionMock } from "@/features/creative-direction-studio/server/mock-language-services";

const requestSchema = z.object({ direction: directionSchema.passthrough(), instruction: z.string().trim().min(1).max(4000), lockedTraits: z.array(z.string()) });

export async function POST(request: Request) {
  try {
    const { direction, instruction, lockedTraits } = requestSchema.parse(await request.json());
    return NextResponse.json({ direction: refineDirectionMock(direction, instruction, lockedTraits) });
  } catch {
    return NextResponse.json({ error: "That revision could not be interpreted. The current image is unchanged." }, { status: 400 });
  }
}

