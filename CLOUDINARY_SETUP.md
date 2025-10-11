# Cloudinary Setup Guide

## What We've Implemented

Your platform now uses **Cloudinary** for video uploads instead of Catbox. This provides:
- Better reliability and performance
- Professional CDN delivery
- Automatic video optimization
- Up to 100MB file uploads (free tier)

## Upload Flow

1. **Small videos (< 50MB)**: Upload to Supabase Storage
2. **Large videos (50-100MB)**: Upload to Cloudinary
3. **Videos uploaded to Cloudinary** are then sent to Vizard for AI clipping

## Required Setup

To make Cloudinary work, you need to create an **unsigned upload preset**:

### Step 1: Go to Cloudinary Settings
1. Log in to your Cloudinary dashboard: https://cloudinary.com/console
2. Go to **Settings** → **Upload**

### Step 2: Create Upload Preset
1. Scroll down to **Upload presets**
2. Click **Add upload preset**
3. Set the following:
   - **Preset name**: `ml_default` (or choose your own name)
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: `video-clips` (optional, but recommended for organization)
   - **Resource type**: `Video`
   - **Access mode**: `Public`

4. Click **Save**

### Step 3: Update Code (if you used a different preset name)
If you didn't name your preset `ml_default`, update this file:

**File**: `src/utils/cloudinary.ts`

```typescript
const CLOUDINARY_UPLOAD_PRESET = 'your-preset-name-here'; // Change this line
```

## Environment Variables

Your `.env` file already has the Cloudinary credentials:
- `VITE_CLOUDINARY_CLOUD_NAME=dptbywvgi`
- `VITE_CLOUDINARY_API_KEY=296724783387131`
- `VITE_CLOUDINARY_API_SECRET=2w1VUlwLX2m0VWryIxdTqxbQQzs`

## Testing

1. Try uploading a video file between 50-100MB
2. Check the console logs - it should say "using cloud upload"
3. Verify the video URL starts with `https://res.cloudinary.com/`

## Troubleshooting

### "Upload preset not found" error
- Make sure you created the unsigned upload preset named `ml_default`
- Check that the preset is set to **Unsigned** mode

### CORS errors
- Unsigned presets should work from the browser
- If you get CORS errors, double-check the preset settings

### File size limits
- Free tier: 100MB per file
- Paid plans: Higher limits available
- Current max: 100MB (configurable in code)

## Upgrading File Size Limits

To increase the file size limit beyond 100MB:

1. Upgrade your Cloudinary plan
2. Update `MAX_CLOUDINARY_SIZE` in `src/utils/videoClipping.ts`:
   ```typescript
   const MAX_CLOUDINARY_SIZE = 200 * 1024 * 1024; // 200MB
   ```

## Benefits Over Catbox

- ✅ More reliable (enterprise-grade infrastructure)
- ✅ Faster global CDN delivery
- ✅ Automatic video optimization
- ✅ Better error handling and retry logic
- ✅ Progress tracking during uploads
- ✅ Professional video transformations (if needed later)
