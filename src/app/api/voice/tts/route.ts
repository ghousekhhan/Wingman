import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GNANI_API_KEY;
    const body = await req.json();
    const { text, language = "en-IN", voice = "female" } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text is required for speech synthesis." },
        { status: 400 }
      );
    }

    if (!apiKey || apiKey.trim().length === 0 || apiKey.includes("your-key")) {
      return NextResponse.json(
        {
          success: false,
          error: "Voice integration is not configured. Set GNANI_API_KEY in environment variables.",
          isConfigured: false,
          fallbackText: text,
        },
        { status: 503 }
      );
    }

    // Call Gnani TTS API
    const response = await fetch("https://api.vachana.ai/tts/v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text,
        language_code: language,
        voice,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Gnani TTS API responded with ${response.status}`,
          fallbackText: text,
        },
        { status: response.status }
      );
    }

    const audioData = await response.arrayBuffer();
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": "audio/wav",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "TTS error: " + error.message },
      { status: 500 }
    );
  }
}
