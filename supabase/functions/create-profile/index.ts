import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateProfileRequest {
  email: string;
  title: string;
  userId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, title, userId }: CreateProfileRequest = await req.json();

    if (!email || !title) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Email and title are required" 
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const apiKey = Deno.env.get('HOMEHANDSHAKE_API_KEY');
    if (!apiKey) {
      console.error('Missing HOMEHANDSHAKE_API_KEY environment variable');
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Server misconfiguration: missing API key" 
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

    const externalApiUrl = "https://homehandshake-backend-final.vercel.app/api/create-profile";
    
    const requestBody: CreateProfileRequest = {
      email,
      title,
    };

    if (userId) {
      requestBody.userId = userId;
    }

    console.log('Calling external API:', externalApiUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || `API error: ${response.status}` };
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: errorData.message || `API error: ${response.status}`,
          details: errorData,
        }),
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
    console.log('Success response:', JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        profileKey: data.profileKey,
        refId: data.refId,
        bucketName: data.bucketName,
        bucketCreated: data.bucketCreated,
        clerkUpdated: data.clerkUpdated,
        message: "Profile created successfully",
        ...data,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Profile creation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        error: String(error),
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