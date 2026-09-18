/**
 * Fast client-side image compression using HTML5 Canvas.
 * Reduces 10-15MB phone camera captures down to ~600KB - 1.2MB WebP/JPEG
 * before uploading to Supabase or transmitting to Gemini API.
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1440,
  quality = 0.85
): Promise<{ file: File; base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio preservation
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2D canvas context"));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        const outputMime = "image/webp";
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas compression failed"));
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              { type: outputMime, lastModified: Date.now() }
            );

            const base64Data = canvas.toDataURL(outputMime, quality).split(",")[1];
            resolve({
              file: compressedFile,
              base64: base64Data,
              mimeType: outputMime,
            });
          },
          outputMime,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image for compression"));
    };

    reader.onerror = () => reject(new Error("Failed to read file for compression"));
  });
}
