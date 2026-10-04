import { NextRequest, NextResponse } from "next/server";

/**
 * Universal PCM to WAV converter with custom sample rate
 * Frames raw 16-bit mono PCM into standard browser-compatible RIFF WAV
 */
function pcmToWav(pcmBuffer: Buffer, sampleRate: number = 48000, numChannels: number = 1): Buffer {
  const header = Buffer.alloc(44);
  const dataLen = pcmBuffer.length;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLen, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  header.writeUInt16LE(1, 20); // Audio format 1 = PCM
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

    const {
      text,
      voice = process.env.GNANI_VOICE || "Yashvi",
      language = process.env.GNANI_LANGUAGE || "en-IN",
      model = process.env.GNANI_MODEL || "timbre-2.5",
      speed = Number(process.env.GNANI_SPEED) || 1.15,
      sample_rate = 48000,
    } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Text is required for speech synthesis." },
        { status: 400 }
      );
    }

    // Clean text to avoid reading markdown asterisks, hashes, or brackets
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!apiKey || apiKey.trim().length === 0 || apiKey.includes("your-key")) {
      return NextResponse.json(
        {
          success: false,
          error: "Voice integration not configured. Set GNANI_API_KEY in environment variables.",
          isConfigured: false,
          fallbackText: cleanText,
        },
        { status: 503 }
      );
    }

    // Primary Gnani Timbre v2.5 configuration (Section: GNANI TTS CONFIGURATION)
    const requestPayload = {
      model: model || "timbre-2.5",
      language: language || "en-IN",
      voice: voice || "Yashvi",
      sample_rate: sample_rate || 48000,
      speed: Math.min(1.15, Math.max(0.85, speed)), // 0.85x to 1.15x
      text: cleanText,
    };

    // Candidate Gnani endpoints & header formats
    const endpointConfigs = [
      {
        url: "https://api.gnani.ai/v1/tts/inference",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-API-Key-ID": apiKey,
          "Content-Type": "application/json",
        },
        payload: requestPayload,
      },
      {
        url: "https://api.vachana.ai/api/v1/tts/inference",
        headers: {
          "X-API-Key-ID": apiKey,
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        payload: {
          ...requestPayload,
          model: "timbre-v2.5",
          lang: language,
        },
      },
      // Fallback voice Nalini if Yashvi is not enabled on this specific Gnani sub-account
      {
        url: "https://api.gnani.ai/v1/tts/inference",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-API-Key-ID": apiKey,
          "Content-Type": "application/json",
        },
        payload: {
          ...requestPayload,
          voice: "Nalini",
        },
      },
    ];

    let lastError: string | null = null;
    let audioBuffer: Buffer | null = null;

    for (const config of endpointConfigs) {
      try {
        const response = await fetch(config.url, {
          method: "POST",
          headers: config.headers,
          body: JSON.stringify(config.payload),
        });

        if (response.ok) {
          const rawBytes = Buffer.from(await response.arrayBuffer());
          if (rawBytes.length > 0) {
            // Check if returned data already contains a RIFF WAV header
            if (rawBytes.subarray(0, 4).toString("ascii") === "RIFF") {
              audioBuffer = rawBytes;
            } else {
              // Frame raw 48kHz PCM into clean RIFF WAV
              audioBuffer = pcmToWav(rawBytes, sample_rate, 1);
            }
            break;
          }
        } else {
          lastError = `Status ${response.status}: ${await response.text()}`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!audioBuffer) {
      return NextResponse.json(
        {
          success: false,
          error: `Gnani TTS failed across endpoints: ${lastError}`,
          fallbackText: cleanText,
        },
        { status: 502 }
      );
    }

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioBuffer.length.toString(),
        "X-Gnani-Voice": voice,
        "X-Gnani-Speed": String(speed),
        "X-Gnani-Language": language,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Gnani TTS Route Error:", error);
    return NextResponse.json(
      { success: false, error: "TTS error: " + error.message },
      { status: 500 }
    );
  }
}
