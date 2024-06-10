import * as THREE from 'three';
import { Loader } from '../loader';
import { FPTileLayerImages } from './fp_def_types';
import { ImageQuality } from './tile';

export class THREE_FPTileLayer extends THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  constructor(
    public readonly width: number,
    public readonly height: number,
    private readonly _images: FPTileLayerImages,
    private readonly _loader: Loader,
  ) {
    super();

    this.setup();
  }

  public unload() {
    if (this.material.map) {
      this.material.map?.dispose();
      this.material.map = null;
      this.material.needsUpdate = true;
    }
  }

  public async load(quality: ImageQuality) {
    const dataUrl = this.getDataUrl(quality);
    const texture = await this._loader.load(dataUrl);

    this.material.map?.dispose();
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  private getDataUrl(quality: ImageQuality) {
    if (quality == ImageQuality.Low) {
      return this._images.Quarter;
    }

    if (quality == ImageQuality.Medium) {
      return this._images.Half;
    }

    return this._images.Full;
  }

  private async setup() {
    this.geometry = new THREE.PlaneGeometry(this.width, this.height);
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      color: new THREE.Color(0x000000),
    });
  }
}
