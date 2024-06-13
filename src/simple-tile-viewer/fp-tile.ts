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
    //private readonly _loader: Loader,
    private readonly _fpImageLoader: FloorPlanImageLoader,
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

    const urls = this._images.map((img) => this.getDataUrl(img, quality));
    const texture = await this._fpImageLoader.prepareTexture(urls);

    this.material.map?.dispose();
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  private flipPixelsCanvas(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    console.time('flipPixelsCanvas');

    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Invert the pixel values
    for (let i = 0; i < data.length; i += 4) {
      // Invert red, green, and blue channels
      data[i] = 255 - data[i]; // Red
      data[i + 1] = 255 - data[i + 1]; // Green
      data[i + 2] = 255 - data[i + 2]; // Blue
      // Leave alpha channel unchanged
    }

    // Put the modified image data back onto the canvas
    context.putImageData(imageData, 0, 0);
    console.timeEnd('flipPixelsCanvas');
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
