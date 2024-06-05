import * as THREE from 'three';

export interface QueuedLoad {
  url: string;
  res(texture: THREE.CanvasTexture): void;
  rej(reason?: any): void;
}

export class Loader {
  private readonly _imageBitmapLoader = new THREE.ImageBitmapLoader();

  private readonly _queue: QueuedLoad[] = [];
  private readonly _maxParallelLoads = 6;
  private _isProcessing = false;

  constructor() {
    this._imageBitmapLoader.setOptions({ imageOrientation: 'flipY' });
    this._imageBitmapLoader.manager.onLoad = () => {
      this.onLoad();
    };

    setInterval(() => this.processQueue());
  }

  public onLoad = () => undefined;

  public async load(url: string) {
    return new Promise<THREE.CanvasTexture>((res, rej) => {
      this._queue.push({ url, res, rej });
    });
  }

  private async processQueue() {
    if (this._queue.length == 0) {
      return;
    }

    if (this._isProcessing) {
      return;
    }

    this._isProcessing = true;

    const toBeProcessed = this._queue.splice(0, this._maxParallelLoads);
    console.log(`Processing ${toBeProcessed.length} loads`);
    console.time('a');

    const promises = toBeProcessed.map(async (item) => {
      try {
        const texture = await this.processLoad(item);
        item.res(texture);
      } catch (error) {
        item.rej(error);
      }
    });

    await Promise.all(promises);
    console.timeEnd('a');

    this._isProcessing = false;

    //this.processQueue();
  }

  private async processLoad(item: QueuedLoad) {
    const bitmap = await this._imageBitmapLoader.loadAsync(item.url);
    return new THREE.CanvasTexture(bitmap);
  }
}
