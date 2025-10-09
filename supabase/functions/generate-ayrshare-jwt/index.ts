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
    const { profileKey } = await req.json();

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

    const apiKey = Deno.env.get("VITE_AYRSHARE_API_KEY");
    const domain = Deno.env.get("VITE_AYRSHARE_DOMAIN");
    let privateKey = Deno.env.get("VITE_AYRSHARE_PRIVATE_KEY");

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

    // Remove quotes if present and ensure proper newline characters
    privateKey = privateKey.replace(/^"|"$/g, '');
    
    // Replace escaped newlines with actual newlines if needed
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    console.log("Private key starts with:", privateKey.substring(0, 30));
    console.log("Private key ends with:", privateKey.substring(privateKey.length - 30));

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ayrshare API error:", errorText);
      console.error("Request params:", { domain, profileKey, privateKeyLength: privateKey.length });
      return new Response(
        JSON.stringify({ error: "Failed to generate JWT", details: errorText }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();

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
