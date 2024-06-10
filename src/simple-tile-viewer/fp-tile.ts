import * as THREE from 'three';
import { ImageDefTile } from './tile-json-loader';
import { Loader } from '../loader';
import { ImageQuality } from './tile';
import { FPTile } from './fp_def_types';
import { THREE_FPTileLayer } from './fp-tile-layer';

export class THREE_FPTile extends THREE.Group {
  private _quality?: ImageQuality;

  private _layers: THREE_FPTileLayer[] = [];

  constructor(
    private readonly _fpTile: FPTile,
    private readonly _loader: Loader,
  ) {
    super();

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
    //this.visible = false;
    this._quality = undefined;
    this._layers.forEach((layer) => layer.unload());
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
    for (const layer of this._layers) {
      await layer.load(quality);
    }
  }

  private async setup() {
    this.position.x = this._fpTile.X;
    this.position.y = this._fpTile.Y;

    this._fpTile.Layers.forEach((layer) => {
      if (layer.Images) {
        const threeLayer = new THREE_FPTileLayer(
          this._fpTile.Width,
          this._fpTile.Height,
          layer.Images,
          this._loader,
        );

        this._layers.push(threeLayer);
        this.add(threeLayer);
      }
    });
  }
}
