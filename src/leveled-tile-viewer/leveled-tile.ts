import * as THREE from 'three';
import { LevelTile } from './leveled-tile-json-loader';
import { Loader } from '../loader';

export class LeveledTile extends THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  private _loaded = false;

  constructor(
    private readonly _def: LevelTile,
    private readonly _loader: Loader,
  ) {
    super();

    this.setup();
  }

  public insideView() {
    this.load();
  }

  public outsideView() {
    if (!this.material.map) {
      return;
    }

    this.material.map?.dispose();
    this.material.map = null;
    this._loaded = false;
    this.material.needsUpdate = true;
  }

  private async load() {
    if (this._loaded) {
      return;
    }
    this._loaded = true;

    const dataUrl = this._def.dataUrl;
    if (!dataUrl) {
      return;
    }

    const texture = await this._loader.load(dataUrl);
    //texture.generateMipmaps = false;

    this.material.map?.dispose();
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  private async setup() {
    const { Width, Height, X, Y } = this._def;
    this.geometry = new THREE.PlaneGeometry(Width, Height);
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      color: new THREE.Color(0xffffff),
    });
    this.position.x = X;
    this.position.y = Y;
    this.material.needsUpdate = true;
  }
}
