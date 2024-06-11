import * as THREE from 'three';
import { Loader } from '../loader';
import { ImageQuality } from './tile';
import { FPTile, FPTileLayerImages } from './fp_def_types';

export class THREE_FPTile extends THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  private _quality?: ImageQuality;

  private _images: FPTileLayerImages[] = [];

  constructor(
    private readonly _fpTile: FPTile,
    private readonly _loader: Loader,
  ) {
    super();

    this.populateImages();

    this.setup();
  }

  public insideView(cameraZ: number) {
    const quality = this.getQuality(cameraZ);

    if (this._quality != quality) {
      this._quality = quality;
      this.load(this._quality);
    }
  }

  public outsideView() {
    this._quality = undefined;

    this.material.map?.dispose();
    this.material.map = null;
    this.material.needsUpdate = true;
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

  private async load(quality: ImageQuality) {
    if (this._images.length === 0) {
      return;
    }

    const promises = this._images.map((img) => this._loader.load(this.getDataUrl(img, quality)));
    const textures = await Promise.all(promises);

    const canvas = document.createElement('canvas');
    canvas.width = textures[0].image.width;
    canvas.height = textures[0].image.height;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.globalCompositeOperation = 'source-over';

    textures.forEach((texture) => {
      context.drawImage(texture.image, 0, 0);
    });

    const combinedTexture = new THREE.CanvasTexture(canvas);

    textures.forEach((tex) => tex.dispose());

    this.material.map?.dispose();
    this.material.map = combinedTexture;
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
