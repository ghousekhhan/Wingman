import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GNANI_API_KEY;

    if (!apiKey || apiKey.trim().length === 0 || apiKey.includes("your-key")) {
      return NextResponse.json(
        {
          success: false,
          error: "Voice integration is not configured. Set GNANI_API_KEY in environment variables.",
          isConfigured: false,
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio_file");

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "No audio file provided in request." },
        { status: 400 }
      );
    }

    // Call Gnani Vachana STT v3 API
    const gnaniFormData = new FormData();
    gnaniFormData.append("audio_file", audioFile);
    gnaniFormData.append("language_code", "en-IN");
    gnaniFormData.append("preferred_language", "en-IN");
    gnaniFormData.append("format", "transcribe");
    gnaniFormData.append("itn_native_numerals", "true");

    const response = await fetch("https://api.vachana.ai/stt/v3", {
      method: "POST",
      headers: {
        "X-API-Key-ID": apiKey,
      },
      body: gnaniFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `Gnani STT API error (${response.status}): ${errText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transcript =
      data.transcript ||
      data.output?.literal ||
      data.text ||
      data.result?.transcript ||
      "";

    return NextResponse.json({
      success: true,
      transcript,
      gnaniResponse: data,
    });
  } catch (error: any) {
    console.error("STT Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gnani voice transcription failed: " + error.message,
      },
      { status: 500 }
    );
  }
}
