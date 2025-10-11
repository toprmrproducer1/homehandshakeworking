import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MuxUploadResponse {
  id: string;
  url: string;
  status: string;
  asset_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const MUX_TOKEN_ID = Deno.env.get("MUX_TOKEN_ID");
    const MUX_TOKEN_SECRET = Deno.env.get("MUX_TOKEN_SECRET");

    if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
      throw new Error("Mux credentials not configured");
    }

    const authHeader = btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`);

    const muxResponse = await fetch("https://api.mux.com/video/v1/uploads", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_asset_settings: {
          playback_policy: ["public"],
          mp4_support: "standard",
          encoding_tier: "smart",
        },
        cors_origin: "*",
      }),
    });

    if (!muxResponse.ok) {
      const errorText = await muxResponse.text();
      console.error("Mux API error:", errorText);
      throw new Error(`Mux API error: ${muxResponse.status} - ${errorText}`);
    }

    const uploadData = await muxResponse.json();
    const upload: MuxUploadResponse = uploadData.data;

    return new Response(
      JSON.stringify({
        success: true,
        uploadUrl: upload.url,
        uploadId: upload.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating Mux upload:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
