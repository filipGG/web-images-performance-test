import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ImageDefTile, getImageDef256, getImageDef512 } from './tile-json-loader';
import { Tile } from './tile';
import { Loader } from '../loader';
import { FPTile, loadFPDef512 } from './fp_def_types';
import { THREE_FPTile } from './fp-tile';
import { DebounceTimer } from '../debounce-timer';
import { FloorPlanImageLoader } from './fp_image_loader';

export class SimpleTileViewer {
  private readonly _renderer = new THREE.WebGLRenderer({ antialias: true });
  private readonly _scene = new THREE.Scene();
  private readonly _camera = new THREE.PerspectiveCamera();
  private readonly _controls: OrbitControls;

  private readonly _loader = new Loader();
  private readonly _fpImageLoader = new FloorPlanImageLoader();
  private readonly _intervalHandle?: any;

  private readonly debounceTimer = new DebounceTimer(100);

  private readonly _tiles: THREE_FPTile[] = [];

  private _shouldRerender = true;

  constructor() {
    this._scene.background = new THREE.Color(0xffffff);

    this.configureRenderer();
    this.configureCamera();

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableRotate = false;

    this._controls.addEventListener('change', () => {
      this._shouldRerender = true;
    });

    this._loader.onLoad = () => {
      this._shouldRerender = true;
    };

    this.createTiles();

    this.debounceTimer.onTrigger = () => this.updateZoomLevel();

    this._intervalHandle = setInterval(() => {
      this._controls.update();

      //if (this._shouldRerender) {
      this.debounceTimer.queueTrigger();
      this._renderer.render(this._scene, this._camera);
      this._shouldRerender = false;
      //}
    });
  }

  private updateZoomLevel() {
    const { inView, outsideView } = this.getTilesInCameraView();

    for (const tile of inView) {
      tile.insideView(this._camera.position.z);
    }

    for (const tile of outsideView) {
      tile.outsideView();
    }
  }

  private async createTiles() {
    const FP_DEF_512 = loadFPDef512();

    for (const tile of FP_DEF_512.Tiles) {
      const shouldAdd = tile.Layers.filter((layer) => layer.Images != undefined).length > 0;

      if (shouldAdd) {
        await this.addTile(tile);
      }
    }
  }

  private async addTile(tile: FPTile) {
    const threeTile = new THREE_FPTile(tile, this._fpImageLoader);
    this._tiles.push(threeTile);
    this._scene.add(threeTile);
    threeTile.position.x -= 6000;
    threeTile.position.y -= 6000;
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

    const inView: THREE_FPTile[] = [];
    const outsideView: THREE_FPTile[] = [];

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
    tile: THREE_FPTile,
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

  private configureRenderer() {
    const { innerWidth, innerHeight } = window;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(innerWidth, innerHeight);
    const parent = document.getElementById('app');

    if (!parent) {
      throw new Error('Parent not found');
    }

    parent.appendChild(this._renderer.domElement);
  }

  private configureCamera() {
    this._camera.fov = 60;

    const { innerWidth, innerHeight } = window;
    this._camera.aspect = innerWidth / innerHeight;
    this._camera.near = 0.1;
    this._camera.far = 1_000_000;

    this._camera.position.z = 10000;

    this._camera.updateProjectionMatrix();

    this._scene.add(this._camera);
  }
}
