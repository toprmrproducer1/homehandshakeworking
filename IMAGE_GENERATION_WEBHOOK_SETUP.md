# Image Generation Webhook Setup

## Overview

The image generation system has been updated to support asynchronous processing with webhook callbacks. This allows users to navigate away while images are being generated, and they'll be notified when generation completes.

## Architecture

1. **Frontend** submits image generation request
2. **Job Record** is created in database with status "pending"
3. **Railway Service** is called to start generation (non-blocking)
4. **User Interface** shows job in progress and user can navigate away
5. **Railway Service** completes generation and calls webhook
6. **Webhook Handler** (Supabase Edge Function) saves results to database
7. **Realtime Updates** notify user that images are ready

## Webhook Endpoint

The webhook endpoint is now deployed as a Supabase Edge Function:

```
https://eczinltfnokyqfghlbjo.supabase.co/functions/v1/image-generation-webhook
```

## Expected Webhook Payload

When the Railway service completes image generation, it should POST to the webhook endpoint with the following payload:

### Success Case

```json
{
  "jobId": "uuid-of-the-job",
  "status": "completed",
  "profileKey": "profile-key-from-request",
  "userId": "clerk-user-id",
  "prompt": "original prompt text",
  "inspirationImageUrl": "optional-url-to-inspiration-image",
  "data": [
    {
      "data": [
        { "data": "https://files.catbox.moe/image1.png" },
        { "data": "https://files.catbox.moe/image2.png" },
        { "data": "https://files.catbox.moe/image3.png" }
      ]
    }
  ]
}
```

### Alternative Format (also supported)

```json
{
  "jobId": "uuid-of-the-job",
  "status": "completed",
  "profileKey": "profile-key-from-request",
  "userId": "clerk-user-id",
  "prompt": "original prompt text",
  "inspirationImageUrl": "optional-url-to-inspiration-image",
  "images": [
    { "data": "https://files.catbox.moe/image1.png" },
    { "data": "https://files.catbox.moe/image2.png" },
    { "data": "https://files.catbox.moe/image3.png" }
  ]
}
```

### Failure Case

```json
{
  "jobId": "uuid-of-the-job",
  "status": "failed",
  "profileKey": "profile-key-from-request",
  "userId": "clerk-user-id",
  "prompt": "original prompt text",
  "error": "Error message describing what went wrong"
}
```

## Required Changes to Railway Service

### 1. Accept Webhook URL in Request

The Railway service should accept a `webhookUrl` parameter in the initial request:

```javascript
// When receiving the generation request
const { inspirationImage, prompt, profileKey, jobId, webhookUrl } = request;
```

### 2. Process Images Asynchronously

Instead of responding with images immediately, the service should:

1. Start generation process
2. Respond immediately with `202 Accepted` status
3. Continue processing in background
4. Call webhook when complete

### 3. Call Webhook on Completion

After generating images:

```javascript
// On success
await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobId: jobId,
    status: 'completed',
    profileKey: profileKey,
    userId: userId,
    prompt: prompt,
    inspirationImageUrl: inspirationImageUrl,
    data: [
      {
        data: generatedImages.map(url => ({ data: url }))
      }
    ]
  })
});
```

```javascript
// On failure
await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobId: jobId,
    status: 'failed',
    profileKey: profileKey,
    userId: userId,
    prompt: prompt,
    error: errorMessage
  })
});
```

## Frontend Integration

The frontend now includes:

1. **Automatic database saving** - Images are saved to `generated_images` table when webhook is called
2. **Realtime subscriptions** - UI updates instantly when new images arrive
3. **Polling fallback** - Polls every 3 seconds for job status updates
4. **Background processing** - Users can navigate away while generation continues
5. **Status notifications** - Toast messages notify users when generation completes

## Testing

### Test with Current Synchronous Flow

The current synchronous flow will continue to work. After generation completes, the frontend will:
1. Extract image URLs from the response
2. Update the job record
3. Save images to the database
4. Refresh the gallery

### Test with Webhook Flow (After Railway Update)

Once Railway is updated to use webhooks:
1. Submit an image generation request
2. Navigate to another panel
3. Wait for ~4 minutes
4. Webhook will be called automatically
5. Realtime subscription will trigger UI update
6. Success notification will appear
7. Images will appear in gallery

## Benefits

1. **Non-blocking** - Users don't wait for 4 minutes
2. **Better UX** - Can navigate away and come back
3. **Scalable** - Handles multiple concurrent generations
4. **Reliable** - Jobs tracked in database
5. **Real-time** - Instant notifications when ready

## Monitoring

Check the Supabase Edge Function logs to monitor webhook calls:
- Successful webhook processing
- Failed webhook attempts
- Image URL parsing issues
- Database save errors
