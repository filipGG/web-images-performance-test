import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Viewer } from '../viewer';
import { ImageDefTile, getImageDef256 } from './tile-json-loader';

export class SimpleTileViewer implements Viewer {
  private readonly _renderer = new THREE.WebGLRenderer();
  private readonly _scene = new THREE.Scene();
  private readonly _camera = new THREE.PerspectiveCamera();
  private readonly _controls: OrbitControls;

  private readonly _imageBitmapLoader = new THREE.ImageBitmapLoader();

  private readonly _intervalHandle?: any;

  private _shouldRerender = false;

  constructor() {
    this._scene.background = new THREE.Color(0xffffff);
    this._imageBitmapLoader.setOptions({ imageOrientation: 'flipY' });

    this.configureRenderer();
    this.configureCamera();

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableRotate = false;

    this._controls.addEventListener('change', () => {
      this._shouldRerender = true;
    });
    this._imageBitmapLoader.manager.onLoad = () => {
      console.log('bitmaps loaded');
      this._shouldRerender = true;
    };

    //this.load();
    this.loadWithChunks();

    this._intervalHandle = setInterval(() => {
      this._controls.update();

      if (this._shouldRerender) {
        this._renderer.render(this._scene, this._camera);
        this._shouldRerender = false;
      }
    }, 16);
  }

  public dispose() {
    clearInterval(this._intervalHandle);
    this.diposeAllTexturesInScene();
    this._controls.dispose();
    this._renderer.dispose();
    this._renderer.domElement.parentElement?.removeChild(this._renderer.domElement);
  }

  private diposeAllTexturesInScene() {
    const disposables: any[] = [];

    this._scene.traverse((child: any) => {
      if (child.material) {
        disposables.push(child);
      }
    });

    disposables.forEach((child) => {
      child.parent.remove(child);
      child.material.dispose();
      if (child.material.map) {
        child.material.map.dispose();
      }
    });

    this._scene.clear();
  }

  private async load() {
    const imageDef = getImageDef256();
    for (const tile of imageDef.Tiles) {
      if (!tile.dataUrl) {
        //this.addWithoutTexture(tile);
      } else {
        this.addWithTexture(tile);
      }
    }
  }

  private async loadWithChunks() {
    const imageDef = getImageDef256();
    const chunks = this.chunkTiles(imageDef.Tiles);

    for (let i = 0; i < chunks.length; i++) {
      const currentChunk = chunks[i];
      await this.loadChunk(currentChunk);
    }
  }

  private async loadChunk(tiles: ImageDefTile[]) {
    const promises = tiles.map((tile) => {
      if (!tile.dataUrl) {
        return Promise.resolve();
        //return this.addWithoutTexture(tile);
      } else {
        return this.addWithTexture(tile);
      }
    });

    await Promise.all(promises);
  }

  private chunkTiles(tiles: ImageDefTile[]) {
    const chunks: ImageDefTile[][] = [];
    const chunkSize = 100;

    for (let i = 0; i < tiles.length; i += chunkSize) {
      const chunk = tiles.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    return chunks;
  }

  private async addWithoutTexture(tile: ImageDefTile) {
    const geo = new THREE.PlaneGeometry(tile.Width, tile.Height);
    const mat = new THREE.MeshBasicMaterial({ transparent: true, color: 0xff0000 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = tile.X - 6000;
    mesh.position.y = tile.Y - 6000;
    this._scene.add(mesh);
  }

  private async addWithTexture(tile: ImageDefTile) {
    const bitmap = await this._imageBitmapLoader.loadAsync(tile.dataUrl!.quarter.dataUrl);
    const texture = new THREE.CanvasTexture(bitmap);

    const { Width, Height } = tile;
    console.log(tile);

    const geo = new THREE.PlaneGeometry(Width, Height);
    const mat = new THREE.MeshBasicMaterial({ transparent: true, map: texture });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = tile.X - 6000;
    mesh.position.y = tile.Y - 6000;
    this._scene.add(mesh);
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
    this._camera.position.set(0, 0, 5000);

    this._camera.updateProjectionMatrix();

    this._scene.add(this._camera);
  }
}
