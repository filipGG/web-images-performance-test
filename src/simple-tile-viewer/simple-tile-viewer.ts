import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import * as ImageDef from './image_def_512.json';
import { Viewer } from '../viewer';

export class SimpleTileViewer implements Viewer {
  private readonly _renderer = new THREE.WebGLRenderer();
  private readonly _scene = new THREE.Scene();
  private readonly _camera = new THREE.PerspectiveCamera();
  private readonly _controls: OrbitControls;

  private readonly _imageBitmapLoader = new THREE.ImageBitmapLoader();

  private readonly _intervalHandle?: any;

  constructor() {
    this._scene.background = new THREE.Color(0xffffff);
    this._imageBitmapLoader.setOptions({ imageOrientation: 'flipY' });

    this.configureRenderer();
    this.configureCamera();

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableRotate = false;

    this.load();

    this._intervalHandle = setInterval(() => {
      this._controls.update();
      this._renderer.render(this._scene, this._camera);
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
    for (const tile of ImageDef.Tiles) {
      const bitmap = await this._imageBitmapLoader.loadAsync(tile.dataUrl);
      const texture = new THREE.CanvasTexture(bitmap);

      const { width, height } = texture.image;

      const geo = new THREE.PlaneGeometry(width, height);
      const mat = new THREE.MeshBasicMaterial({ transparent: true, map: texture });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = tile.X - 6000;
      mesh.position.y = tile.Y - 6000;
      this._scene.add(mesh);
    }
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
