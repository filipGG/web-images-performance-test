import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Loader } from '../loader';

export class TestRenderTargets {
  private readonly _renderer = new THREE.WebGLRenderer({ antialias: true });
  private readonly _scene = new THREE.Scene();
  private readonly _camera = new THREE.PerspectiveCamera();
  private readonly _controls: OrbitControls;

  private readonly _imageBitmapLoader = new THREE.ImageBitmapLoader();

  constructor() {
    this._scene.background = new THREE.Color(0xffffff);

    this.configureRenderer();
    this.configureCamera();
    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableRotate = false;

    this.run();

    setInterval(() => {
      this._controls.update();
      this._renderer.render(this._scene, this._camera);
    });
  }

  private async run() {
    console.time('a');
    for (let i = 0; i < 100; i++) {
      await this.addStuff_bitmap();
    }
    console.timeEnd('a');
  }

  private async addStuff_bitmap() {
    const red = await this._imageBitmapLoader.loadAsync('red.png');
    const blue = await this._imageBitmapLoader.loadAsync('blue.png');
    const green = await this._imageBitmapLoader.loadAsync('green.png');

    // Create a canvas to combine the textures
    const canvas = document.createElement('canvas');
    canvas.width = red.width;
    canvas.height = red.height;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    // Draw the red texture
    context.drawImage(red, 0, 0);
    // Set the globalCompositeOperation to 'multiply' to blend the blue texture
    context.globalCompositeOperation = 'source-over';
    context.drawImage(blue, 0, 0);
    context.drawImage(green, 0, 0);

    // Create a new texture from the combined canvas
    const combinedTexture = new THREE.CanvasTexture(canvas);

    this.addMesh(combinedTexture);

    red.close();
    blue.close();
    green.close();
  }

  private async loadTexture(url: string) {
    const bitmap = await this._imageBitmapLoader.loadAsync(url);
    return new THREE.CanvasTexture(bitmap);
  }

  private addMesh(tex: THREE.Texture) {
    const geo = new THREE.PlaneGeometry(1024, 1024);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = Math.random() * 10000 - 5000;
    mesh.position.y = Math.random() * 10000 - 5000;
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

    this._camera.position.z = 10000;

    this._camera.updateProjectionMatrix();

    this._scene.add(this._camera);
  }
}
