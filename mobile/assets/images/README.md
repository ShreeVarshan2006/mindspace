# Logo Images

Please add the following image files to this directory:

1. **brain-logo.png** - The brain icon with puzzle piece in a blue circular background
   - Size: 512x512 px recommended
   - Format: PNG with transparent background (or the blue circular background)

2. **srm-logo.webp (preferred) or srm-logo.png** - The SRM Institute of Science & Technology logo
   - Use the full logo with institution header/details
   - Prefer WebP for smaller APK sizes and faster builds
   - Target file size: under 200 KB (optimize/compress if larger)
   - Recommended display size: ~150×48 dp (maintain aspect ratio)
   - Formats: WEBP (preferred) or PNG

## How to add the images:

1. Save the brain logo as: `brain-logo.png`
2. Save the SRM logo as: `srm-logo.webp` (preferred) or `srm-logo.png`
3. Place both files in this directory: `mobile/assets/images/`

After adding the images, rebuild the app to see them on the login screen.

Tip: If builds fail during AAPT2 resource processing, the logo is likely too large.

- Compress with a tool like Squoosh or ImageOptim
- Ensure the shorter side is ≤ 512 px and file ≤ 200 KB
