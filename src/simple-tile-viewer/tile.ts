import * as THREE from 'three';
import { ImageDefTile } from './tile-json-loader';

export enum ImageQuality {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export class Tile extends THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  private _quality?: ImageQuality;

  constructor(
    private readonly _def: ImageDefTile,
    private readonly _loader: THREE.ImageBitmapLoader,
  ) {
    super();

    this.setup();
  }

  public insideView(cameraZ: number) {
    //this.visible = true;
    const quality = this.getQuality(cameraZ);

    if (this._quality != quality) {
      this._quality = quality;
      this.load(this._quality);
      this.updateColors();
    }
  }

  public outsideView() {
    //this.visible = false;
    this._quality = undefined;
    this.material.map?.dispose();
    this.material.map = null;
    this.updateColors();
  }

  private getDataUrl(quality: ImageQuality) {
    if (quality == ImageQuality.Low) {
      return this._def.dataUrl!.quarter.dataUrl;
    }

    if (quality == ImageQuality.Medium) {
      return this._def.dataUrl!.half.dataUrl;
    }

    return this._def.dataUrl!.full.dataUrl;
  }

  private getQuality(cameraZ: number) {
    if (cameraZ > 6000) {
      return ImageQuality.Low;
    }

    if (cameraZ > 3000) {
      return ImageQuality.Medium;
    }

    return ImageQuality.High;
  }

  private updateColors() {
    if (!this._quality) {
      this.material.color = new THREE.Color(0x000000);
    } else if (this._quality == ImageQuality.Low) {
      this.material.color = new THREE.Color(0xff0000);
    } else if (this._quality == ImageQuality.Medium) {
      this.material.color = new THREE.Color(0x00ff00);
    } else {
      this.material.color = new THREE.Color(0x0000ff);
    }
  }

  private async load(quality: ImageQuality) {
    const dataUrl = this.getDataUrl(quality);
    const bitmap = await this._loader.loadAsync(dataUrl);
    const texture = new THREE.CanvasTexture(bitmap);
    this.material.map?.dispose();
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  private async setup() {
    const { Width, Height, X, Y } = this._def;
    this.geometry = new THREE.PlaneGeometry(Width, Height);
    this.material = new THREE.MeshBasicMaterial({ transparent: true, color: new THREE.Color(0x000000) });
    this.position.x = X;
    this.position.y = Y;
    this.material.needsUpdate = true;
  }
}
