import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MuxUpload {
  id: string;
  url: string;
  status: string;
  asset_id?: string;
}

interface MuxAsset {
  id: string;
  playback_ids?: Array<{
    id: string;
    policy: string;
  }>;
  status: string;
  mp4_support?: string;
  static_renditions?: {
    status: string;
    files?: Array<{
      name: string;
      ext: string;
      bitrate?: number;
      width?: number;
      height?: number;
    }>;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const uploadId = url.searchParams.get("uploadId");

    if (!uploadId) {
      throw new Error("uploadId parameter is required");
    }

    const MUX_TOKEN_ID = Deno.env.get("MUX_TOKEN_ID");
    const MUX_TOKEN_SECRET = Deno.env.get("MUX_TOKEN_SECRET");

    if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
      throw new Error("Mux credentials not configured");
    }

    const authHeader = btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`);

    const uploadResponse = await fetch(`https://api.mux.com/video/v1/uploads/${uploadId}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${authHeader}`,
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Mux API error:", errorText);
      throw new Error(`Mux API error: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    const upload: MuxUpload = uploadData.data;

    let videoUrls = null;

    if (upload.asset_id) {
      const assetResponse = await fetch(`https://api.mux.com/video/v1/assets/${upload.asset_id}`, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${authHeader}`,
        },
      });

      if (assetResponse.ok) {
        const assetData = await assetResponse.json();
        const asset: MuxAsset = assetData.data;
        const playbackId = asset.playback_ids?.[0]?.id;

        if (playbackId) {
          const mp4Ready = asset.mp4_support === "standard" &&
                           (asset.static_renditions?.status === "ready" ||
                            asset.status === "ready");

          videoUrls = {
            playbackId,
            assetId: asset.id,
            streamUrl: `https://stream.mux.com/${playbackId}.m3u8`,
            mp4Highest: `https://stream.mux.com/${playbackId}/highest.mp4`,
            mp4Download: `https://stream.mux.com/${playbackId}/highest.mp4?download=video`,
            audioOnly: `https://stream.mux.com/${playbackId}/audio.m4a`,
            thumbnail: `https://image.mux.com/${playbackId}/thumbnail.jpg`,
            animatedGif: `https://image.mux.com/${playbackId}/animated.gif`,
            staticRenditionsReady: mp4Ready,
          };

          console.log(`Asset ${asset.id} status: ${asset.status}, mp4_support: ${asset.mp4_support}, static_renditions: ${asset.static_renditions?.status}, MP4 ready: ${mp4Ready}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        uploadId: upload.id,
        assetId: upload.asset_id || null,
        status: upload.status,
        videoUrls,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error checking Mux upload status:", error);
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
