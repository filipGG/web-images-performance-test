import * as THREE from 'three';

export interface WorkerInput {
  workId: string;
  imageUrls: string[];
}

export interface WorkerResult {
  workId: string;
  textureResult?: TextureResult;
}

interface TextureResult {
  arr: Uint8ClampedArray;
  width: number;
  height: number;
}

const loader = new THREE.ImageBitmapLoader();
loader.setOptions({ imageOrientation: 'flipY' });

self.onmessage = async (e: MessageEvent<WorkerInput>) => {
  const { imageUrls, workId } = e.data;

  const result: WorkerResult = {
    workId,
  };

  if (imageUrls.length === 0) {
    self.postMessage(result);
    return;
  }

  const bitmaps = await loadImages(imageUrls);
  const { width, height } = bitmaps[0];

  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to get OffscreenCanvas 2D context');
  }

  for (const bitmap of bitmaps) {
    context.drawImage(bitmap, 0, 0);
  }

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Invert the pixel values
  for (let i = 0; i < data.length; i += 4) {
    // Invert red, green, and blue channels
    data[i] = 255;
    data[i + 1] = 0;
    data[i + 2] = 0;
  }

  result.textureResult = {
    arr: data,
    width,
    height,
  };

  self.postMessage(result);
};

async function loadImages(urls: string[]) {
  if (urls.length == 0) {
    return [];
  }

  const promises = urls.map((url) => loader.loadAsync(url));
  return await Promise.all(promises);
}
