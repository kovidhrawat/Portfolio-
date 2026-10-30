// Cloudflare Worker that sits between the portfolio chatbot and Gemini.
// The Gemini key lives in Cloudflare as a secret named GEMINI_API_KEY
// (set it in the dashboard: Worker → Settings → Variables and Secrets).
// This file is safe to commit: it contains no key.

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Only your site may call this Worker.
const ALLOWED_ORIGINS = [
  "https://kovidhrawat.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response("Forbidden", { status: 403, headers: cors });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad request", { status: 400, headers: cors });
    }

    // Pass through only the fields the chatbot uses, with a capped output size.
    const payload = {
      contents: Array.isArray(body.contents) ? body.contents.slice(-20) : [],
      systemInstruction: body.systemInstruction,
      generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
    };

    const res = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    return new Response(await res.text(), {
      status: res.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};
