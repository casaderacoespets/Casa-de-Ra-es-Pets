/**
 * Client-side Image Compression & Optimization Utility
 * Resizes and optimizes images to ensure they never exceed Firestore's 1MB field/document limit.
 */

export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
}

/**
 * Compresses an image File, Blob, or Data URL to a lightweight, optimized data URL.
 * Output is guaranteed to be well under Firestore document payload limits (< 400KB).
 */
export async function compressImage(
  source: File | Blob | string,
  options: ImageCompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82,
    maxSizeBytes = 400 * 1024, // 400 KB safety cap (Firestore limit is ~1048KB)
  } = options;

  if (!source) return '';

  // If it's an external HTTP/HTTPS URL or local path, no compression is needed
  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (!trimmed.startsWith('data:image/') && !trimmed.startsWith('blob:')) {
      return trimmed;
    }
    // If it's already a tiny data URL (< 80KB), return immediately
    if (trimmed.length < 80 * 1024) {
      return trimmed;
    }
  }

  let objectUrl = '';
  let srcToLoad = '';

  if (typeof source === 'string') {
    srcToLoad = source;
  } else {
    objectUrl = URL.createObjectURL(source);
    srcToLoad = objectUrl;
  }

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = srcToLoad;
    });

    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (!width || !height) {
      if (typeof source === 'string') return source;
      throw new Error('Dimensões da imagem não puderam ser calculadas.');
    }

    // Scale dimensions maintaining aspect ratio
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (typeof source === 'string') return source;
      throw new Error('Não foi possível obter contexto 2D.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    let currentQuality = quality;
    const mimeType = 'image/jpeg';
    let resultDataUrl = canvas.toDataURL(mimeType, currentQuality);

    // If still larger than maxSizeBytes, iteratively reduce quality and resolution
    let attempts = 0;
    while (resultDataUrl.length > maxSizeBytes && attempts < 5) {
      attempts++;
      currentQuality = Math.max(0.35, currentQuality - 0.15);

      const scaleDown = 0.8;
      const nextWidth = Math.max(100, Math.round(canvas.width * scaleDown));
      const nextHeight = Math.max(100, Math.round(canvas.height * scaleDown));

      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = nextWidth;
      smallCanvas.height = nextHeight;
      const smallCtx = smallCanvas.getContext('2d');
      if (smallCtx) {
        smallCtx.imageSmoothingEnabled = true;
        smallCtx.imageSmoothingQuality = 'high';
        smallCtx.drawImage(canvas, 0, 0, nextWidth, nextHeight);
        resultDataUrl = smallCanvas.toDataURL(mimeType, currentQuality);
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        ctx.clearRect(0, 0, nextWidth, nextHeight);
        ctx.drawImage(smallCanvas, 0, 0);
      } else {
        resultDataUrl = canvas.toDataURL(mimeType, currentQuality);
      }
    }

    return resultDataUrl;
  } catch (error) {
    console.warn('[imageCompressor] Falha ao comprimir imagem via canvas:', error);
    if (typeof source === 'string') {
      return source;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(source as Blob);
    });
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
