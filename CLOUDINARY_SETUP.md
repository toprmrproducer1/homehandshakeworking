# Cloudinary Setup - IMPORTANT!

## URGENT: Complete This Setup Before Testing

The app is configured but **will not work** until you complete this 2-minute setup.

## Error You're Seeing

```
Cloudinary cloud name not configured
```

This happens because:
1. Environment variables need a dev server restart
2. You need to create an upload preset in Cloudinary

## Fix Steps

### Step 1: Restart Dev Server (Required!)

**IMPORTANT**: After adding environment variables, you MUST restart the dev server.

1. Stop the current dev server (if running)
2. Restart it
3. The app will now load the Cloudinary credentials

### Step 2: Create Upload Preset (Required!)

**Without this, uploads will fail with "preset not found"**

1. Go to: https://cloudinary.com/console/settings/upload
2. Log in with your account
3. Scroll down to **"Upload presets"** section
4. Click **"Add upload preset"**
5. Configure exactly as follows:
   - **Preset name**: `ml_default` (must be exact!)
   - **Signing Mode**: Select **"Unsigned"** (critical!)
   - **Folder**: `video-clips` (optional)
   - **Resource type**: Leave as **"Auto"** or select **"Video"**
   - **Access mode**: **"Public"**
6. Click **"Save"**

### Alternative: Use Signed Upload (Advanced)

If you prefer not to use unsigned presets, you can implement signed uploads:

1. Create a backend endpoint that generates signatures
2. Update `src/utils/cloudinary.ts` to use signed uploads
3. Pass the signature with each upload request

## Verify Setup

After completing both steps:

1. Refresh your browser
2. Upload a video file (50-100MB)
3. Check browser console - should see progress logs
4. Video should upload successfully to Cloudinary

## Current Configuration

Your `.env` file has:
```
VITE_CLOUDINARY_CLOUD_NAME=dptbywvgi
VITE_CLOUDINARY_API_KEY=296724783387131
VITE_CLOUDINARY_API_SECRET=2w1VUlwLX2m0VWryIxdTqxbQQzs
```

## How Video Upload Works

1. **Files < 50MB**: Upload to Supabase Storage (instant, already working)
2. **Files 50-100MB**: Upload to Cloudinary (needs setup above)
3. **All videos**: Sent to Vizard API for AI clipping

## Troubleshooting

### "Cloudinary cloud name not configured"
- ✅ **Solution**: Restart the dev server to load new environment variables

### "Upload preset not found" or "Invalid preset"
- ✅ **Solution**: Create the `ml_default` preset as unsigned (see Step 2)
- Make sure it's named **exactly** `ml_default`
- Make sure Signing Mode is **"Unsigned"**

### "Access Denied" or CORS errors
- ✅ **Solution**: Ensure preset is set to "Public" access mode
- Unsigned presets should allow browser uploads

### Still not working?
1. Clear browser cache and reload
2. Check browser console for specific error messages
3. Verify preset name matches exactly: `ml_default`
4. Confirm preset Signing Mode is "Unsigned"

## Optional: Increase File Size Limit

Current limit: 100MB (Cloudinary free tier)

To increase:
1. Upgrade Cloudinary plan for larger limits
2. Update `src/utils/videoClipping.ts`:
   ```typescript
   const MAX_CLOUDINARY_SIZE = 200 * 1024 * 1024; // 200MB
   ```

## Benefits of Cloudinary

✅ Enterprise reliability (99.9% uptime)  
✅ Global CDN for fast video delivery  
✅ Automatic video optimization  
✅ Better error handling  
✅ Real-time upload progress  
✅ Video transformations available  

## Need Help?

If you're still seeing errors after:
1. Restarting dev server
2. Creating the upload preset

Check the browser console for detailed error messages and share them for further debugging.
