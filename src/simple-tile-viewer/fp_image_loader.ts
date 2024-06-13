import * as THREE from 'three';
import { generateUUID } from 'three/src/math/MathUtils.js';
import { WorkerInput, WorkerResult } from './worker-v2';

import all from './worker-v2?worker&url';

interface Job {
  res: (texture: THREE.DataTexture) => void;
  rej: (msg: string) => void;
}

export class FloorPlanImageLoader {
  private readonly _worker = new Worker(all, { type: 'module' });

  private readonly _jobs = new Map<string, Job>();

  constructor() {
    this._worker.onmessage = this.onWorkerMessage;
  }

  public onLoad = () => undefined;

  public prepareTexture(imageUrls: string[]): Promise<THREE.DataTexture> {
    const workerInput: WorkerInput = {
      imageUrls,
      workId: generateUUID(),
    };

    const promise = new Promise<THREE.DataTexture>((res, rej) => {
      this._jobs.set(workerInput.workId, { res, rej });
    });

    this._worker.postMessage(workerInput);

    return promise;
  }

  private onWorkerMessage = (msg: MessageEvent<WorkerResult>) => {
    const { workId, textureResult } = msg.data;
    const job = this._jobs.get(workId);

    if (!job) {
      throw new Error(`Unable to find job for work ${workId}`);
    }

    this._jobs.delete(workId);

    if (!textureResult) {
      job.rej(`No result from job ${workId}`);
      return;
    }

    const { arr, width, height } = textureResult;
    const texture = new THREE.DataTexture(arr, width, height);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    job.res(texture);

    this.onLoad();
  };
}