import * as THREE from 'three';
import { LevelDef, LevelTile } from './leveled-tile-json-loader';
import { Loader } from '../loader';
import { LeveledTile } from './leveled-tile';

export class Level extends THREE.Group {
  private readonly _tiles: LeveledTile[] = [];

  constructor(
    private readonly _def: LevelDef,
    private readonly _loader: Loader,
    private readonly _camera: THREE.PerspectiveCamera,
    public minZ: number,
    public maxZ: number,
  ) {
    super();

    this.setup();
  }

  public show() {
    this.visible = true;
    this._tiles.forEach((tile) => (tile.material.opacity = 1));
    const { inView, outsideView } = this.getTilesInCameraView();

    inView.forEach((tile) => {
      tile.insideView();
    });

    outsideView.forEach((tile) => {
      tile.outsideView();
    });
  }

  public hide() {
    this.hideAnimation();
  }

  private setup() {
    this._def.Tiles.forEach((tile) => {
      this.createTile(tile);
    });
  }

  private async hideAnimation() {
    let opacity = 1;
    const handle = setInterval(() => {
      this._tiles.forEach((tile) => {
        tile.material.opacity = Math.max(0, opacity);
      });

      if (opacity === 0) {
        clearInterval(handle);
        this.visible = false;
        this._tiles.forEach((tile) => tile.outsideView());
      }

      opacity -= 0.05;
    }, 16);
  }

  private getTilesInCameraView() {
    const topDownRatio = this._camera.getFilmHeight() / this._camera.getFocalLength();
    const topDownLength = topDownRatio * this._camera.position.z;
    const topDownLengthHalf = topDownLength / 2;

    const leftRightRatio = this._camera.getFilmWidth() / this._camera.getFocalLength();
    const leftRightLength = leftRightRatio * this._camera.position.z;
    const leftRightLengthHalf = leftRightLength / 2;

    const left = this._camera.position.x - leftRightLengthHalf;
    const right = this._camera.position.x + leftRightLengthHalf;
    const top = this._camera.position.y + topDownLengthHalf;
    const bottom = this._camera.position.y - topDownLengthHalf;

    const inView: LeveledTile[] = [];
    const outsideView: LeveledTile[] = [];

    for (let i = 0; i < this._tiles.length; i++) {
      const tile = this._tiles[i];

      if (this.isTileInView(tile, left, right, top, bottom)) {
        inView.push(tile);
      } else {
        outsideView.push(tile);
      }
    }

    return { inView, outsideView };
  }

  private isTileInView(
    tile: LeveledTile,
    left: number,
    right: number,
    top: number,
    bottom: number,
  ) {
    if (
      tile.position.x > left &&
      tile.position.x < right &&
      tile.position.y < top &&
      tile.position.y > bottom
    ) {
      return true;
    }
    return false;
  }

  private async createTile(tileDef: LevelTile) {
    const tile = new LeveledTile(tileDef, this._loader);
    this._tiles.push(tile);
    this.add(tile);
  }
}
