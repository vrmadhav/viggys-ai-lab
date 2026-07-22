import { NextResponse } from "next/server";
import { selectImageProvider } from "@/features/creative-direction-studio/server/image-providers";

export async function GET() {
  try {
    const selection = selectImageProvider();
    return NextResponse.json({ languageProvider: "mock-creative-director-v1", imageProvider: selection.provider.id, requestedProvider: selection.requested, isMock: selection.provider.id === "mock", fallback: selection.fallback, model: selection.model });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Provider configuration is invalid." }, { status: 500 });
  }
}
