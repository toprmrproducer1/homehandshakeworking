import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WebhookPayload {
  jobId: string;
  status: 'completed' | 'failed';
  images?: Array<{ data: string }> | string[];
  data?: Array<{ data: Array<{ data: string }> }>;
  error?: string;
  profileKey: string;
  userId: string;
  prompt: string;
  inspirationImageUrl?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: WebhookPayload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    const { jobId, status, profileKey, userId, prompt, inspirationImageUrl } = payload;

    if (!jobId) {
      throw new Error('Missing jobId in webhook payload');
    }

    // Parse image URLs from various possible formats
    let imageUrls: string[] = [];

    if (status === 'completed') {
      // Check for nested format: [{ data: [{ data: "url" }, ...] }]
      if (payload.data && Array.isArray(payload.data) && payload.data.length > 0) {
        if (payload.data[0]?.data && Array.isArray(payload.data[0].data)) {
          imageUrls = payload.data[0].data.map((item: any) => item.data).filter(Boolean);
        }
      }

      // Check for simple array format: [{ data: "url" }, ...]
      if (imageUrls.length === 0 && payload.images && Array.isArray(payload.images)) {
        imageUrls = payload.images.map((item: any) =>
          typeof item === 'string' ? item : item.data
        ).filter(Boolean);
      }

      console.log('Extracted image URLs:', imageUrls);

      if (imageUrls.length === 0) {
        throw new Error('No valid image URLs found in webhook payload');
      }

      // Update the job record
      const { error: jobError } = await supabase
        .from('image_generation_jobs')
        .update({
          status: 'completed',
          generated_images: imageUrls,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (jobError) {
        throw new Error(`Failed to update job: ${jobError.message}`);
      }

      // Save images to the generated_images table
      const { error: saveError } = await supabase
        .from('generated_images')
        .insert({
          user_id: userId,
          profile_key: profileKey,
          inspiration_image_url: inspirationImageUrl,
          prompt: prompt,
          generated_images: imageUrls,
        });

      if (saveError) {
        throw new Error(`Failed to save generated images: ${saveError.message}`);
      }

      console.log('Successfully processed webhook and saved images');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Images saved successfully',
          imageCount: imageUrls.length
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else if (status === 'failed') {
      // Update job as failed
      const { error: jobError } = await supabase
        .from('image_generation_jobs')
        .update({
          status: 'failed',
          error_message: payload.error || 'Image generation failed',
        })
        .eq('id', jobId);

      if (jobError) {
        throw new Error(`Failed to update job: ${jobError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Job marked as failed'
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      throw new Error(`Unknown status: ${status}`);
    }
  } catch (error) {
    console.error('Webhook error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
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
