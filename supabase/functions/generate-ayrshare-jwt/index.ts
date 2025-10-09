import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { profileKey, apiKey, domain, privateKey } = await req.json();

    if (!profileKey) {
      return new Response(
        JSON.stringify({ error: "profileKey is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!apiKey || !domain || !privateKey) {
      console.error("Missing config:", { hasApiKey: !!apiKey, hasDomain: !!domain, hasPrivateKey: !!privateKey });
      return new Response(
        JSON.stringify({ error: "Ayrshare configuration is missing" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Generating JWT with domain:", domain);
    console.log("Profile key:", profileKey);
    console.log("Private key length:", privateKey.length);
    console.log("Private key first 30 chars:", privateKey.substring(0, 30));

    const response = await fetch("https://api.ayrshare.com/api/profiles/generateJWT", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain,
        privateKey,
        profileKey,
      }),
    });

    const responseText = await response.text();
    console.log("Ayrshare response status:", response.status);
    console.log("Ayrshare response:", responseText);

    if (!response.ok) {
      console.error("Ayrshare API error:", responseText);
      return new Response(
        JSON.stringify({ error: "Failed to generate JWT", details: responseText }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = JSON.parse(responseText);

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in generate-ayrshare-jwt function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
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
