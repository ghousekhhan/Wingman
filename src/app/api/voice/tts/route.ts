import { NextRequest, NextResponse } from "next/server";

function pcmToWav(pcmBuffer: Buffer, sampleRate: number = 24000, numChannels: number = 1): Buffer {
  const header = Buffer.alloc(44);
  const dataLen = pcmBuffer.length;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLen, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // subchunk1 size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * 2, 28); // byte rate
  header.writeUInt16LE(numChannels * 2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(dataLen, 40);
  return Buffer.concat([header, pcmBuffer]);
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GNANI_API_KEY;
    const body = await req.json();
    const { text, voice = "Nalini", lang = "en-IN" } = body;

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

    // Call Gnani TTS inference API
    const response = await fetch("https://api.vachana.ai/api/v1/tts/inference", {
      method: "POST",
      headers: {
        "X-API-Key-ID": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "timbre-v2.5",
        text,
        voice,
        lang,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Gnani TTS error:", response.status, errText);
      return NextResponse.json(
        {
          success: false,
          error: `Gnani TTS API responded with ${response.status}`,
          fallbackText: text,
        },
        { status: response.status }
      );
    }

    // Read raw PCM bytes and frame with WAV header
    const rawPcm = Buffer.from(await response.arrayBuffer());
    const wavBuffer = pcmToWav(rawPcm, 24000, 1);

    return new NextResponse(new Uint8Array(wavBuffer), {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": wavBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("TTS Route Error:", error);
    return NextResponse.json(
      { success: false, error: "TTS error: " + error.message },
      { status: 500 }
    );
  }
}
