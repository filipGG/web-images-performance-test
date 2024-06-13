import * as THREE from 'three';
import { Loader } from '../loader';
import { ImageQuality } from './tile';
import { FPTile, FPTileLayerImages } from './fp_def_types';
import { FloorPlanImageLoader } from './fp_image_loader';

export class THREE_FPTile extends THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  private _quality?: ImageQuality;

  private _images: FPTileLayerImages[] = [];

  constructor(
    private readonly _fpTile: FPTile,
    private readonly _fpImageLoader: FloorPlanImageLoader,
  ) {
    super();

    this.populateImages();

    this.setup();
    this.load();
  }

  private populateImages() {
    this._fpTile.Layers.forEach((layer) => {
      if (layer.Images) {
        this._images.push(layer.Images);
      }
    });
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

  private async load() {
    if (this._images.length === 0) {
      return;
    }

    const urls = this._images.map((img) => img.Full);
    const texture = await this._fpImageLoader.prepareTexture(urls);

    this.material.map?.dispose();
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  private async setup() {
    this.position.x = this._fpTile.X;
    this.position.y = this._fpTile.Y;

    this.geometry = new THREE.PlaneGeometry(this._fpTile.Width, this._fpTile.Height);
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      color: new THREE.Color(0xffffff),
    });
  }

  private getDataUrl(images: FPTileLayerImages, quality: ImageQuality) {
    if (quality == ImageQuality.Low) {
      return images.Quarter;
    }

    if (quality == ImageQuality.Medium) {
      return images.Half;
    }

    return images.Full;
  }
}
